const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const { body, oneOf } = require('express-validator');

const models = require('../../../models');
const rateLimiter = require('../../../middlewares/rate-limiter');
const requestValidator = require('../../../middlewares/request-validator');

const sessionRouter = Router();

/**
 * Account States Responder
 */
sessionRouter.get('/states', async (req, res) => {
  res.json({
    result: 'ok',
    ...res.locals.initialState.session,
  });
});

/**
 * Switch account
 */
const switchAccountFailedRequestsLimiter = rateLimiter.createLimiter({
  keyPrefix: 'dashboard_session_switch_account_failed_requests_ip_per_day',
  points: 30,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24, // Block for 1 day, if 30 attempts per day
});
sessionRouter.post('/switch_account', rateLimiter.createMiddleware(switchAccountFailedRequestsLimiter), oneOf([
  body('accountId').exists().isString().isLength({ min: 10, max: 15 }),
]), requestValidator, async (req, res, next) => {
  const targetAccountId = req.body.accountId;
  // check if requested account id is listed in signed-in accounts
  if (!req.accountIds.includes(targetAccountId)) {
    req.logger.warn('Requested to switch to non-listed account.', {
      currentAccountId: req.session.accountId,
      targetAccountId,
    });
    return next(Boom.badRequest());
  }

  // switch session account id
  req.session.accountId = targetAccountId;

  // reset rate limiter
  rateLimiter.resetLimiter(switchAccountFailedRequestsLimiter, req);

  res.json({
    result: 'ok',
    currentAccountId: targetAccountId,
  });
});

/**
 * Sign out
 */
const signoutFailedRequestsLimiter = rateLimiter.createLimiter({
  keyPrefix: 'dashboard_session_signout_failed_requests_ip_per_day',
  points: 30,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24, // Block for 1 day, if 30 attempts per day
});
sessionRouter.post('/signout', rateLimiter.createMiddleware(signoutFailedRequestsLimiter), oneOf([
  body('from').exists().isIn(['current', 'all']),
  body('from').isString().isLength({ min: 10, max: 15 }),
]), requestValidator, async (req, res, next) => {
  const transaction = await models.sequelize.transaction();

  // get target string (current, all or target account id)
  const { from } = req.body;

  try {
    // sign out (remove session account record)
    await models.SessionAccount.signout(req, from, transaction);

    // get currently available accounts
    const accounts = await models.SessionAccount.getAccountsBySessionId(req.session.id);

    if (!req.session || !accounts || accounts.length <= 0) {
      // signed out from all accounts
      // reset rate limiter
      rateLimiter.resetLimiter(signoutFailedRequestsLimiter, req);
      // commit the transaction
      await transaction.commit();
      return res.json({
        result: 'ok',
      });
    }

    // regenerate session id
    await models.SessionAccount.regenerateSessionId(req, transaction);

    // TODO: Consider how to treat no active account situation
    // if signed out from current account
    if (!accounts.find((account) => account.id === req.session.accountId)) {
      // set first listed one as current account
      req.session.accountId = accounts[0].id;
    }

    // commit the transaction
    await transaction.commit();

    // reset rate limiter
    rateLimiter.resetLimiter(signoutFailedRequestsLimiter, req);

    return res.json({
      result: 'ok',
    });
  } catch (e) {
    await transaction.rollback();

    switch (e.message) {
      case 'ACCOUNT_NOT_LISTED':
        req.logger.warn('Requested sign-out to unlisted session.', {
          sessionId: req.session.id,
          targetAccountId: req.body.from,
        });
        return next(Boom.badRequest());
      default:
        throw e;
    }
  }
});

module.exports = sessionRouter;
