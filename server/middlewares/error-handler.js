/**
 * Error Handler
 */
const Boom = require('@hapi/boom');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const { t } = req;

  const error = err.statusCode ? err : Boom.boomify(err);

  if (error.message === 'CSRF token missing' || error.message === 'CSRF token mismatch') {
    error.isServer = false;
    error.output = {
      statusCode: 403,
      payload: {
        statusCode: 403,
        error: t('errors:csrf_token_error.title'),
        message: t('errors:csrf_token_error.message'),
      },
    };
  }

  if (error.isServer || req.app.get('env') === 'development') {
    // Server Error => Log it!
    req.logger.error('Error handler captured the error: ', error);
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
    error: req.app.get('env') === 'development' ? error : null,
  });
};

module.exports = errorHandler;
