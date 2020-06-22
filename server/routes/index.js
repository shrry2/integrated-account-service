const { Router } = require('express');
const setAccount = require('../middlewares/session-account-setter');
const i18n = require('../utils/i18n');
const setInitialState = require('../middlewares/initial-state-setter');

const signupRoutes = require('./signup');
const signinRoutes = require('./signin');
const localesRoutes = require('./locales');
const emailRoutes = require('./email');
const devRoutes = require('./dev');
const clientRoutes= require('./client');

const indexRouter = Router();

indexRouter.use(setAccount);
indexRouter.use(setInitialState);

indexRouter.get('/', (req, res, next) => {
  if (req.account) {
    res.render('dashboard');
  } else {
    res.render('indexNotLoggedin', { title: 'AmID' });
  }
});

indexRouter.get([
  '/profile',
  '/profile/display-name',
  '/profile/legal-name',
  '/profile/profile-picture',
  '/settings',
  '/contact',
  '/auth-and-security',
], (req, res) => {
  if (req.account) {
    res.render('dashboard');
  } else {
    res.render('indexNotLoggedin', { title: 'AmID' });
  }
});

indexRouter.use('/signup', signupRoutes);

indexRouter.use('/signin', signinRoutes);

indexRouter.use('/_/locales', localesRoutes);

indexRouter.use('/email', emailRoutes);

indexRouter.use('/dev', devRoutes);

indexRouter.use('/_/client', clientRoutes);

module.exports = indexRouter;
