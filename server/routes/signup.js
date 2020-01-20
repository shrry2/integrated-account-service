const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const validators = require('../../shared/validators');
const { body, validationResult } = require('express-validator');

const signupRouter = Router();

signupRouter.get('/', (req, res, next) => {
  const { t } = req;
  res.render('signup', {
    bodyClass: 'signup-page',
    title: t('pages:signup.title'),
    pageScript: 'signup.js',
  });
});

signupRouter.post('/_/request_setup_email', [
  body('displayName').exists(),
  body('email').exists(),
], async (req, res, next) => {
  const { t } = req;

  // validate user input
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(Boom.badRequest('errors:missingRequiredData', validationErrors.array()));
  }

  let displayName;
  try {
    displayName = validators.displayName(req.body.displayName);
  } catch (error) {
    return next(Boom.badRequest(`validators:${error.message}`));
  }

  let email;
  try {
    email = validators.email(req.body.email);
  } catch (error) {
    return next(Boom.badRequest(`validators:${error.message}`));
  }

  console.log(displayName);
  console.log(email);

  return res.json(req.body);
});

signupRouter.get('/sessiontest', (req, res, next) => {
  console.log(req.session);
  if (req.session.views) {
    req.session.views++;
    res.setHeader('Content-Type', 'text/html');
    res.write('<p>views: ' + req.session.views + '</p>');
    res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>');
    res.end();
  } else {
    req.session.views = 1;
    res.end('welcome to the session demo. refresh!');
  }
});

signupRouter.post('/csrftest', (req, res, next) => {
  res.send('ok');
});

module.exports = signupRouter;
