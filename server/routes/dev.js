const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const Mailer = require('../email/Mailer');

const devRouter = Router();

const models = require('../models');

devRouter.use((req, res, next) => {
  // disable all functions other than development environment
  if (req.app.get('env') !== 'development') {
    next(Boom.notFound());
  }

  next();
});

devRouter.get('/getuser', async (req, res) => {
  const account = await models.Account.findByPk('A3X0MM34OY');
  const accountObject = await account.getAttributes();
  res.json(accountObject);
});

devRouter.post('/csrftest', (req, res, next) => {
  res.send('ok');
});

devRouter.get('/email/:templateName', async (req, res) => {
  const mail = new Mailer(req.logger);
  await mail.prepareTemplate(req.params.templateName);

  if (req.query.lang) {
    await req.i18n.changeLanguage(req.query.lang);
  }

  await mail.compileTemplate(req.t, {
    userName: 'ユーザー名',
    setupURL: 'https://google.com',
    code: '123456',
  });

  if (req.query.text) {
    res.send(mail.compiledText);
  } else {
    res.send(mail.compiledHtml);
  }
});

module.exports = devRouter;
