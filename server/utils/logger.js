/**
 * Logger
 */
const { createLogger, format, transports } = require('winston');
const { IS_DEV } = require('../constants');

const getLogger = () => {
  // Set log level
  const logLevel = IS_DEV ? 'debug' : 'info';

  // Set transports
  let logTransports = [/* TODO: Add stackdriver support on production mode. */];
  if (IS_DEV) {
    logTransports = [new transports.Console()];
  }

  // Set format
  let logFormat = format.combine(
    format.timestamp(),
    format.json(),
  );
  if (IS_DEV) {
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
  const logger = getLogger();
  // eslint-disable-next-line no-param-reassign
  app.logger = logger;
  app.logger.info('Logger initialized and logging started.');

  return (req, res, next) => {
    req.logger = logger.child({ requestId: req.id });
    next();
  };
};

module.exports = middleware;
