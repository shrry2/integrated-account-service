const { Router } = require('express');

const signupRoutes = require('./signup');
const localesRoutes = require('./locales');

const indexRouter = Router();

/* GET home page. */
indexRouter.get('/', (req, res, next) => {
  res.render('index', { title: 'ACCOUNT SERVER' });
});

indexRouter.use('/signup', signupRoutes);

indexRouter.use('/_/locales', localesRoutes);

module.exports = indexRouter;
