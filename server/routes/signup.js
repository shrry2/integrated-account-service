const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const { body, validationResult } = require('express-validator');
const util = require('util');
const moment = require('moment');

const models = require('../models');

const validators = require('../../shared/validators');
const rateLimiter = require('../middlewares/rate-limiter');

const signupRouter = Router();

signupRouter.all('*', async (req, res, next) => {
  // TODO: There might be need to check if there is currently active account session
  next();
});

signupRouter.get('/', (req, res) => {
  const { t } = req;
  res.render('react-root', {
    bodyClass: 'signup-page',
    title: t('pages:signup.title'),
    pageScript: 'Signup.js',
  });
});

signupRouter.post('/_/create_signup', rateLimiter.createMiddleware(
  rateLimiter.createLimiter({
    keyPrefix: 'signup_attempts_ip_per_day',
    points: 30,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 30 attempts per day
  }),
), [
  body('displayName').exists(),
  body('contact').exists(),
  body('contactType').exists(),
], async (req, res, next) => {
  // validate user input
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(Boom.badRequest('errors:missingRequiredData', validationErrors.array()));
  }

  let displayName;
  try {
    displayName = validators.displayName(req.body.displayName);
  } catch (error) {
    return next(Boom.badRequest(`validators:${error.message}`));
  }

  const { contactType } = req.body;
  let contact;
  switch (contactType) {
    case 'mobilePhone': {
      // validate phone number
      let phoneNumber;
      try {
        phoneNumber = validators.mobilePhone(req.body.contact);
        phoneNumber = validators.formatPhoneNumber(phoneNumber, 'E.164');
      } catch (error) {
        return next(Boom.badRequest(`validators:${error.message}`));
      }
      // check if already exists
      if (await models.Phone.exists(phoneNumber)) {
        return next(Boom.badRequest('routes:signup.create_signup.phoneExists'));
      }
      contact = phoneNumber;
      break;
    }
    case 'email': {
      // validate email
      let email;
      try {
        email = validators.email(req.body.contact);
      } catch (error) {
        return next(Boom.badRequest(`validators:${error.message}`));
      }
      // check if already exists
      if (await models.Email.exists(email)) {
        return next(Boom.badRequest('routes:signup.create_signup.emailExists'));
      }
      contact = email;
      break;
    }
    default:
      return next(Boom.badRequest());
  }

  const signupData = {
    displayName,
    contactType,
    contact,
  };

  // check if other request exists
  let signup;
  try {
    signup = await models.Signup.findByContact(contact);

    if (signup === null) {
      // create new signup request
      signup = await models.Signup.createSignup(req, signupData);
    } else {
      // update display name if it changes
      if (signup.get('displayName') !== displayName) {
        signup.update({ displayName });
      }
      // check if enough time has passed since last key issue
      if (!signup.reissueAvailable()) {
        return next(Boom.tooManyRequests('routes:signup.create_signup.reissueDenied'));
      }
      // reissue verification key and send message
      await signup.issueKeyAndSendMessage(req);
    }
  } catch (e) {
    req.logger.error(e);
    return next(Boom.internal('Database error occurred while processing signup request.'));
  }

  signupData.id = signup.id;

  return res.json({
    result: 'ok',
    data: signupData,
  });
});

signupRouter.post('/_/verify_code', rateLimiter.createMiddleware(
  rateLimiter.createLimiter({
    keyPrefix: 'signup_code_verify_attempts_ip_per_day',
    points: 30,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 30 attempts per day
  }),
), [
  body('signupId').exists().isString().isLength({ max: 60 }),
  body('verificationCode').exists().isNumeric().isLength({ min: 6, max: 6 }),
], async (req, res, next) => {
  // validate user input
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(Boom.badRequest('errors:invalidData', validationErrors.array()));
  }

  const {
    signupId,
    verificationCode: enteredCode,
  } = req.body;

  // get signup instance from db
  const signup = await models.Signup.findByPk(signupId);

  let isCodeValid = false;
  try {
    isCodeValid = await signup.validateVerificationKey(enteredCode);
  } catch (e) {
    req.logger.error(e);
    switch (e.message) {
      case 'signup has already been completed':
        return next(Boom.badRequest());
      case 'key is already expired':
        return next(Boom.badRequest('routes:signup.verify_code.codeUnavailable'));
      case 'max retry count (3) exceeded':
        return next(Boom.locked('routes:signup.verify_code.maxRetryExceeded'));
      default:
        return next(Boom.internal());
    }
  }

  if (!isCodeValid) {
    return next(Boom.badRequest('routes:signup.verify_code.invalidCode'));
  }

  let account = null;
  try {
    account = await signup.complete();
  } catch (e) {
    if (e.message === 'signupAlreadyDone') {
      return next(Boom.badRequest());
    }

    req.logger.error(e);
    return next(Boom.internal());
  }

  let sessionContinue = true;

  try {
    if (req.session) {
      // regenerate session
      await util.promisify(req.session.regenerate).bind(req.session)();
      // set account id to current session
      req.session.signupContinueAccount = account.id;
    } else {
      sessionContinue = false;
    }
  } catch (e) {
    req.logger.error(e);
    sessionContinue = false;
  }

  return res.json({
    result: 'ok',
    sessionContinue,
  });
});

signupRouter.get('/verify/:signupId', async (req, res, next) => {
  const { t } = req;

  // get signup id from uri
  const { signupId } = req.params;

  // get verification key from query
  let verificationKey;
  try {
    verificationKey = req.query.key;
  } catch (e) {
    req.logger.error('routes:signup.verify: verification key was not found in query');
    return next(Boom.notFound('routes:signup.verify.badLink'));
  }

  // get signup instance from db
  const signup = await models.Signup.findByPk(signupId);

  if (!signup) {
    req.logger.error('routes:signup.verify: signup data was not found on db');
    return next(Boom.notFound('routes:signup.verify.badLink'));
  }

  // validate the key
  let isKeyValid = false;
  try {
    isKeyValid = await signup.validateVerificationKey(verificationKey);
  } catch (e) {
    req.logger.error(e);
    switch (e.message) {
      case 'signup has already been completed':
        return next(Boom.notFound('routes:signup.verify.badLink'));
      case 'key is already expired':
        return next(Boom.notFound('routes:signup.verify.badLink'));
      default:
        return next(Boom.internal());
    }
  }

  if (!isKeyValid) {
    return next(Boom.notFound('routes:signup.verify.badLink'));
  }

  // no verification error

  // render react page
  return res.render('react-root', {
    bodyClass: 'signup-page',
    title: t('pages:signup.title'),
    pageScript: 'Signup.js',
  });
});

signupRouter.post('/_/verify_email', rateLimiter.createMiddleware(
  rateLimiter.createLimiter({
    keyPrefix: 'signup_email_verify_attempts_ip_per_day',
    points: 10,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 10 attempts per day
  }),
), [
  body('signupId').exists().isString().isLength({ max: 60 }),
  body('verificationKey').exists().isString().isLength({ min: 60, max: 60 }),
], async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(Boom.badRequest('errors:missingRequiredData', validationErrors.array()));
  }

  const { signupId, verificationKey } = req.body;

  // get signup instance from db
  const signup = await models.Signup.findByPk(signupId);

  if (!signup) {
    req.logger.error('routes:signup.verify_email: signup data was not found in db');
    return next(Boom.badRequest());
  }

  // validate the key
  let isKeyValid = false;
  try {
    isKeyValid = await signup.validateVerificationKey(verificationKey);
  } catch (e) {
    req.logger.error(e);
    switch (e.message) {
      case 'signup has already been completed':
      case 'key is already expired':
        return next(Boom.badRequest());
      default:
        return next(Boom.internal());
    }
  }

  if (!isKeyValid) {
    req.logger.error('routes:signup.verify_email: verification key is invalid');
    return next(Boom.badRequest());
  }

  let account = null;
  try {
    account = await signup.complete();
  } catch (e) {
    if (e.message === 'signupAlreadyDone') {
      return next(Boom.badRequest());
    }

    req.logger.error(e);
    return next(Boom.internal());
  }

  let sessionContinue = true;

  try {
    if (req.session) {
      // regenerate session
      await util.promisify(req.session.regenerate).bind(req.session)();
      // set account id to current session
      req.session.signupContinueAccount = account.id;
    } else {
      sessionContinue = false;
    }
  } catch (e) {
    req.logger.error(e);
    sessionContinue = false;
  }

  return res.json({
    result: 'ok',
    sessionContinue,
  });
});

signupRouter.post('/_/continue_session', [
  body('extend').exists().isBoolean(),
], async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(Boom.badRequest('errors:missingRequiredData', validationErrors.array()));
  }

  if (!req.session.signupContinueAccount) {
    req.logger.info('routes:signup.continue_session: Blocked request without valid session data');
    return next(Boom.badRequest());
  }

  const account = await models.Account.findByPk(req.session.signupContinueAccount);

  if (!account) {
    req.logger.info('routes:signup.continue_session: Blocked request with invalid account id');
    return next(Boom.badRequest());
  }

  const createdAtMoment = moment(account.craetedAt);
  if (moment().diff(createdAtMoment, 'minutes', true) > 3) {
    // contiue signup account session is only valid for within 3 minutes after signing up
    req.logger.info('routes:signup.continue_session: Blocked request because its taking too much time')
    return next(Boom.badRequest('routes:signup.continue_session.expired'));
  }

  delete req.session.signupContinueAccount;

  // create signin instance specially for this signup
  const signin = await models.Signin.createForSignup(account, account.signupId);

  // add to current session
  await models.SessionAccount.addAccount(req, account, signin);

  if (req.body.extend === true) {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // ONE WEEK
  } else {
    req.session.cookie.expires = false;
  }

  return res.json({
    result: 'ok',
  });
});

module.exports = signupRouter;
