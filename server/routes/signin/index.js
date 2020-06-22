const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const { body } = require('express-validator');
const moment = require('moment');
const util = require('util');

const models = require('../../models');

const requestValidator = require('../../middlewares/request-validator');
const rateLimiter = require('../../middlewares/rate-limiter');

const {
  tokenValidator,
  generateToken,
  verifyApproval,
} = require('./utils');

const emailRoutes = require('./email');
const phoneRoutes = require('./phone');

const signinRouter = Router();

signinRouter.all('*', async (req, res, next) => {
  // TODO: There might be need to check if there is currently active account session
  next();
});

signinRouter.get('/', (req, res) => {
  const { t } = req;
  res.render('react-root', {
    bodyClass: 'signin-page',
    title: t('pages:signin.title'),
    pageScript: 'Signin.js',
  });
});

const signinCreationRequestsIpPer15min = rateLimiter.createLimiter({
  keyPrefix: 'signin_creation_requests_ip_per_15min',
  points: 10,
  duration: 60 * 15,
  blockDuration: 60 * 30, // Block for 30 min, if 10 attempts per 15 min
});
signinRouter.post('/_/create_token', rateLimiter.createMiddleware(
  signinCreationRequestsIpPer15min,
  rateLimiter.createLimiter({
    keyPrefix: 'signin_account_finding_attack_ip_per_day',
    points: 50,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 50 attempts per day
  }),
), [
  body('identifier').exists().isString().isLength({ min: 1, max: 256 }),
  requestValidator,
], async (req, res, next) => {
  // find account
  const account = await models.Account.findByIdentifier(
    req.body.identifier,
    req.language.slice(-2), // country code is required to determine phone number locale
  );
  if (!account) {
    return next(Boom.notFound('routes:signin.create.notFound'));
  }
  if (Array.isArray(req.accountIds) && req.accountIds.includes(account.id)) {
    // currently active account
    return next(Boom.badRequest('routes:signin.errors.alreadySignedIn'));
  }

  // create sign-in instance
  const signin = await models.Signin.createFor(account);

  // get required auth factors
  const authFactors = await signin.getAvailableAuthFactors();

  // issue new sign-in token
  const token = generateToken(signin.id, authFactors);
  req.logger.info(`routes:signin.create: new signin token was issued [${signin.id}]`);

  // reset rate limiter
  await rateLimiter.resetLimiter(signinCreationRequestsIpPer15min, req);

  return res.json({
    result: 'ok',
    token,
  });
});

signinRouter.use('/_/email', tokenValidator, emailRoutes);

signinRouter.use('/_/phone', tokenValidator, phoneRoutes);

const signinSessionRequestsIpPerHour = rateLimiter.createLimiter({
  keyPrefix: 'signin_session_requests_ip_per_hour',
  points: 10,
  duration: 60 * 60,
  blockDuration: 60 * 60, // Block for 1 hour, if 10 attempts per 1 hour
});
signinRouter.post('/_/let_me_in', rateLimiter.createMiddleware(
  signinSessionRequestsIpPerHour,
  rateLimiter.createLimiter({
    keyPrefix: 'signin_session_attack_ip_per_day',
    points: 30,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 30 attempts per day
  }),
), [
  body('token').exists().isString(),
  body('extend').exists().isBoolean(),
  requestValidator,
], tokenValidator, async (req, res, next) => {
  // get decoded token and sign-in instance which should have been set by token validator
  const { decodedToken, signin } = req;

  // check if all auth factors are fulfilled
  let invalidToken = false;
  Object.keys(decodedToken.auth).forEach((factor) => {
    if (invalidToken) return;
    if (decodedToken.auth[factor] === null) {
      invalidToken = true;
    }
    // verify each approvals
    try {
      verifyApproval(decodedToken, factor);
    } catch (e) {
      req.logger.error(e);
      invalidToken = true;
    }
  });

  if (invalidToken) {
    return next(Boom.badRequest('routes:signin.errors.invalidToken'));
  }

  if (Array.isArray(req.accountIds) && req.accountIds.includes(signin.accountId)) {
    // currently active account
    return next(Boom.badRequest('routes:signin.errors.alreadySignedIn'));
  }

  // get new account instance
  const account = await models.Account.findByPk(signin.accountId);

  // add account session record and start session
  // this automatically regenerates session id
  await models.SessionAccount.addAccount(req, account, signin);

  const now = moment.utc();

  // make sign-in instance completed
  try {
    signin.completedAt = now;
    await signin.save();
  } catch (e) {
    req.logger.error(e);
    return next(Boom.internal());
  }

  if (req.body.extend === true) {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // ONE WEEK
  } else {
    req.session.cookie.expires = false;
  }

  // update last active date
  req.session.lastActive = now;

  // update last authentication date
  req.session.lastAuth = now;

  // reset rate limiter
  await rateLimiter.resetLimiter(signinSessionRequestsIpPerHour, req);

  return res.json({
    result: 'ok',
  });
});

module.exports = signinRouter;
