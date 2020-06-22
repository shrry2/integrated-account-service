const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

const { IS_PROD } = require('../constants');
const getEnvVar = require('../utils/envvar-getter');

// default redis connection info
let redisHost = 'localhost';
let redisPort = 6379;
let db = 1;
let sessionSecret = 'EXAMPLE_SESSION_SECRET';

// load from environment variables in production environment
if (IS_PROD) {
  redisHost = getEnvVar('REDIS_HOST');
  redisPort = getEnvVar('REDIS_PORT');
  db = getEnvVar('REDIS_DB_INDEX_SESSION_STORE');
  sessionSecret = getEnvVar('SESSION_SECRET');
}

const redisClient = redis.createClient({
  host: redisHost,
  port: redisPort,
  enable_offline_queue: false,
  db,
});

// Create session middleware
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  cookie: {
    // maxAge: # Default to non-persistent cookie for security reasons
    sameSite: 'lax',
    secure: IS_PROD,
  },
  name: 'SID',
  resave: false,
  secret: sessionSecret,
  saveUninitialized: false,
});

module.exports = sessionMiddleware;
