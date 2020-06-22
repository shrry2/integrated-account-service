const Router = require('express-promise-router');
const Boom = require('@hapi/boom');

const sessionRoutes = require('./session');
const profileRoutes = require('./profile');
const settingsRoutes = require('./settings');
const contactRoutes = require('./contact');

const dashboardRouter = Router();

const authRequired = (req, res, next) => {
  if (!req.account) {
    return next(Boom.unauthorized());
  }
  return next();
};

dashboardRouter.use(authRequired);

dashboardRouter.use('/session', sessionRoutes);
dashboardRouter.use('/profile', profileRoutes);
dashboardRouter.use('/settings', settingsRoutes);
dashboardRouter.use('/contact', contactRoutes);

module.exports = dashboardRouter;
