const csurf = require('csurf');

const csrfMiddleware = csurf({
  cookie: true,
  value: (req) => req.headers['x-csrf-token'],
});

module.exports = csrfMiddleware;
