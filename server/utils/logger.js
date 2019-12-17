/**
 * Logger
 */
const { createLogger, format, transports } = require('winston');

const getLogger = (isDev = false) => {
  // Set log level
  const logLevel = isDev ? 'debug' : 'info';

  // Set transports
  let logTransports = [/* TODO: Add stackdriver support on production mode. */];
  if (isDev) {
    logTransports = [new transports.Console()];
  }

  // Set format
  let logFormat = format.combine(
    format.timestamp(),
    format.json(),
  );
  if (isDev) {
    logFormat = format.combine(
      format.timestamp(),
      format.colorize({ all: true }),
      format.simple(),
    );
  }

  return createLogger({
    level: logLevel,
    format: logFormat,
    transports: logTransports,
    defaultMeta: { service: 'account-server-backend' },
  });
};

const middleware = (app) => {
  const logger = getLogger(app.get('env') === 'development');
  // eslint-disable-next-line no-param-reassign
  app.logger = logger;

  return (req, res, next) => {
    req.logger = logger.child({ requestId: req.id });
    next();
  };
};

module.exports = middleware;
