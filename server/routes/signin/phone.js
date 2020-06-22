const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const { body } = require('express-validator');

const rateLimiter = require('../../middlewares/rate-limiter');
const requestValidator = require('../../middlewares/request-validator');
const models = require('../../models');

const { updateToken, extendToken, validateAuthFactor } = require('./utils');

const signinPhoneRouter = Router();

signinPhoneRouter.post('/issue', rateLimiter.createMiddleware(
  rateLimiter.createLimiter({
    keyPrefix: 'signin_send_sms_requests_ip_per_day',
    points: 10,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 10 attempts per day
  }),
), [
  body('token').exists().isString(),
  requestValidator,
], async (req, res, next) => {
  // get decoded token and instance which should have been set by token validator
  const { decodedToken, signin } = req;

  // check if phone is available as auth factor
  if (!Object.prototype.hasOwnProperty.call(decodedToken.auth, 'phone')) {
    req.logger.error('routes:signin.phone.issue: phone is not available as an auth factor');
    return next(Boom.badRequest());
  }

  // send SMS
  try {
    const account = await models.Account.findByPk(signin.accountId);
    const accountAttributes = await account.getObject();
    await models.PhoneVerification.issueCodeAndSendMessage(accountAttributes, 'signin', req.t);
  } catch (e) {
    req.logger.error(e);
    return next(Boom.internal());
  }

  // update token
  const newToken = extendToken(decodedToken);

  return res.json({
    result: 'ok',
    token: newToken,
  });
});

signinPhoneRouter.post('/verify', rateLimiter.createMiddleware(
  rateLimiter.createLimiter({
    keyPrefix: 'signin_verify_email_attempts_ip_per_day',
    points: 20,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 20 attempts per day
  }),
), [
  body('token').exists().isString(),
  body('code').exists().isNumeric().isLength({ min: 6, max: 6 }),
  requestValidator,
], async (req, res, next) => {
  // get decoded token and instance which should have been set by token validator
  const { decodedToken, signin } = req;

  // validate auth factor
  try {
    validateAuthFactor(decodedToken, 'phone');
  } catch (e) {
    if (e.message === 'already verified') {
      req.logger.info('routes:signin.phone.verify: phone is already verified');
      return res.json({ result: 'ok', token: req.body.token });
    }
    req.logger.error(e);
    return next(Boom.badRequest());
  }

  // verify code
  const verification = await models.PhoneVerification.findByAccountIdContext(signin.accountId, 'signin');
  if (!verification) {
    return next(Boom.badRequest('routes:signin.email.verify.pleaseReissue'));
  }

  try {
    await verification.verifyCode(req.body.code);
  } catch (e) {
    switch (e.message) {
      case 'max attempts exceeded':
        return next(Boom.badRequest('routes:signin.email.verify.maxAttemptsError'));
      case 'invalid code':
        return next(Boom.badRequest('routes:signin.email.verify.invalidCodeError'));
      case 'code expired':
        return next(Boom.badRequest('routes:signin.email.verify.expiredCodeError'));
      default:
        req.logger.error(e);
        return next(Boom.internal());
    }
  }

  // generate new token
  const newToken = updateToken(decodedToken, 'phone');

  return res.json({
    result: 'ok',
    token: newToken,
  });
});

module.exports = signinPhoneRouter;
