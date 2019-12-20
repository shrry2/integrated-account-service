const Sentry = require('@sentry/node');
const config = require('config');

const middleware = (app) => {
  Sentry.init({ dsn: config.get('sentryDsn') });
  app.use(Sentry.Handlers.requestHandler());

  // Return the middleware that sets the request ID to the report
  return (req, res, next) => {
    if (req.id) {
      Sentry.configureScope((scope) => {
        scope.setTag('request_id', req.id);
      });
    }
    next();
  };
};

const { errorHandler } = Sentry.Handlers;

module.exports = {
  middleware,
  errorHandler,
};
