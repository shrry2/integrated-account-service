const Router = require('express-promise-router');

const signupRouter = Router();

signupRouter.get('/', (req, res, next) => {
  const { t } = req;
  res.render('signup', { title: t('pages:signup.title'), pageScript: 'signup.js' });
});

module.exports = signupRouter;
