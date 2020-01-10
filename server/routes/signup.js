const Router = require('express-promise-router');

const signupRouter = Router();

signupRouter.get('/', (req, res, next) => {
  const { t } = req;
  res.render('signup', {
    bodyClass: 'signup-page',
    title: t('pages:signup.title'),
    pageScript: 'signup.js',
  });
});

signupRouter.get('/_/request_setup_email', (req, res, next) => {
  res.json({ result: 'ok' });
});

module.exports = signupRouter;
