const Router = require('express-promise-router');

const signupRouter = Router();

signupRouter.get('/', (req, res, next) => {
  res.render('signup');
});

module.exports = signupRouter;
