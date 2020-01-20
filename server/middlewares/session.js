const session = require('express-session');
const { IS_PROD } = require('../constants');

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7; // in milliseconds

// TODO: SET SESSION SECRET
const SESSION_SECRET = 'EXAMPLE_SESSION_SECRET';

// Create session middleware
const sessionMiddleware = session({
  cookie: {
    maxAge: ONE_WEEK,
    sameSite: 'lax',
    secure: IS_PROD,
  },
  name: 'SID',
  resave: false,
  secret: SESSION_SECRET,
  saveUninitialized: false,
});

module.exports = sessionMiddleware;
