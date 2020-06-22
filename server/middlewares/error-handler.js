/**
 * Error Handler
 */
const Boom = require('@hapi/boom');
const { IS_DEV } = require('../constants');
const isTranslationKey = require('../utils/trans-key-detector');

const errorHandler = (rawError, req, res, next) => {
  if (res.headersSent) {
    return next(rawError);
  }

  const { t } = req;

  let error = Boom.isBoom(rawError) ? rawError : Boom.boomify(rawError);

  if (error.isServer || IS_DEV) {
    // Server Error => Log it!
    // Development environment => Display any errors
    req.logger.error(error);
  }

  if (error.message === 'CSRF Token Error') {
    error.output.payload.message = t('errors:csrf_token_error.message');
  }

  if (rawError.message === 'Unexpected end of JSON input') {
    req.logger.error(rawError);
    error = Boom.badRequest();
  }

  if (error.output.payload.error === 'Internal Server Error') {
    error.output.payload.message = t('errors:Internal Server Error.message');
  }

  const statusCode = error.isBoom
    ? error.output.statusCode
    : error.statusCode;

  res.status(statusCode || 500);

  const { payload } = error.output;

  const localized = {
    title: t(`errors:${payload.error}.title`),
    message: payload.message,
  };

  // try to translate if error message seems to be a translation id
  if (isTranslationKey(payload.message)) {
    localized.message = t(payload.message);
  }

  // custom error message is not set
  if (payload.message === payload.error) {
    localized.message = t(`errors:${payload.error}.message`);
  }

  // Returns JSON if API Request
  if (req.path.indexOf('_/') !== -1 || req.path.indexOf('-/') !== -1) {
    return res.json({
      error: {
        status: statusCode,
        error: payload.error,
        title: localized.title,
        message: localized.message,
      },
    });
  }

  // Render error page
  return res.render('error', {
    title: localized.title,
    meta: {
      description: localized.message,
    },
    statusCode,
    message: localized.message,
    requestId: req.id,
    error: req.app.get('env') === 'development' ? error : null,
  });
};

module.exports = errorHandler;
