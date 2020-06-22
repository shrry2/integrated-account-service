const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const { body, oneOf } = require('express-validator');

const moment = require('moment-timezone');

const models = require('../../../models');
const requestValidator = require('../../../middlewares/request-validator');

const locales = require('../../../../shared/global/locales');

const contactRouter = Router();

contactRouter.get(
  '/email/list',
  async (req, res) => {
    const emails = await models.Email.findAll({
      where: {
        accountId: req.account.id,
      },
    });

    const output = emails.map((email) => ({
      email: email.email,
      isPrimary: email.isPrimary,
      createdAt: email.createdAt,
    }));

    res.json(output);
  },
);

contactRouter.get(
  '/phone/list',
  async (req, res) => {
    const phones = await models.Phone.findAll({
      where: {
        accountId: req.account.id,
      },
    });

    const output = phones.map((phone) => ({
      phoneNumber: phone.phoneNumber,
      createdAt: phone.createdAt,
    }));

    res.json(output);
  },
);

module.exports = contactRouter;
