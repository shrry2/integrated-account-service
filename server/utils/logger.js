/**
 * Logger
 */
const winston = require('winston');

const getLogger = (isDev = false) => {
  // Set log level
  let level = 'info';
  if (isDev) {
    level = 'debug';
  }

  // Set transports
  let transports = [/* TODO: Add stackdriver support on production mode. */];
  if (isDev) {
    transports = [new winston.transports.Console()];
  }

  // Set format
  let format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  );
  if (isDev) {
    format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize({ all: true }),
      winston.format.simple(),
    );
  }

  return winston.createLogger({
    level,
    format,
    transports,
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
