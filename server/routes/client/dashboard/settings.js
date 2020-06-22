const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const { body, oneOf } = require('express-validator');

const moment = require('moment-timezone');

const models = require('../../../models');
const requestValidator = require('../../../middlewares/request-validator');

const locales = require('../../../../shared/global/locales');

const settingsRouter = Router();

settingsRouter.put(
  '/locale',
  body('locale').exists().isString().isLength({ min: 2, max: 8 }),
  requestValidator,
  async (req, res, next) => {
    const filteredLocale = locales.find((locale) => locale.code === req.body.locale);

    if (!filteredLocale) {
      return next(Boom.badRequest());
    }

    const instances = await models.AccountSettings.prepareByAccountId(req.account.id, req);
    if (!Array.isArray(instances) || instances.length !== 2) {
      req.logger.error('found or created instances are not array or there are not one items', { instances });
      return next(Boom.internal());
    }
    const accountSettings = instances[0];
    await accountSettings.setSetting('locale', filteredLocale.code);
    return res.json({ result: 'ok' });
  },
);

settingsRouter.get(
  '/timezone/list',
  async (req, res) => {
    const timezones = moment.tz.names();
    return res.json(timezones);
  },
);

settingsRouter.put(
  '/timezone',
  body('timezone').exists().isString().isLength({ min: 2, max: 255 }),
  requestValidator,
  async (req, res, next) => {
    const timezones = moment.tz.names();
    const preferredTimezone = req.body.timezone;

    if (!timezones.includes(preferredTimezone)) {
      return next(Boom.badRequest());
    }

    const instances = await models.AccountSettings.prepareByAccountId(req.account.id, req);
    if (!Array.isArray(instances) || instances.length !== 2) {
      req.logger.error('found or created instances are not array or there are not one items', { instances });
      return next(Boom.internal());
    }
    const accountSettings = instances[0];
    await accountSettings.setSetting('timezone', preferredTimezone);
    return res.json({ result: 'ok' });
  },
);

module.exports = settingsRouter;
