/**
 * Server Constants
 */

const IS_DEV = process.env.NODE_ENV === 'development';

const IS_PROD = !IS_DEV;

const SERVER_URL = IS_DEV
  ? 'http://localhost:3000'
  : '/';

const FORCE_SENTRY_ENABLED = false;

module.exports = {
  IS_DEV,
  IS_PROD,
  SERVER_URL,
  FORCE_SENTRY_ENABLED,
};
