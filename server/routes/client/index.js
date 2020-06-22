const Router = require('express-promise-router');

const dashboardRoutes = require('./dashboard');

const clientRouter = Router();

clientRouter.use('/dashboard', dashboardRoutes);

module.exports = clientRouter;
