const { Router } = require('express');

const signupRoutes = require('./signup');

const indexRouter = Router();

/* GET home page. */
indexRouter.get('/', (req, res, next) => {
  res.render('index', { title: 'ACCOUNT SERVER' });
});

indexRouter.use('/signup', signupRoutes);

module.exports = indexRouter;
