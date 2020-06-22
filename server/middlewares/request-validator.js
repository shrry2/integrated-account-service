const Boom = require('@hapi/boom');
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  req.logger.debug('Request validator called.');

  const errors = validationResult(req);

  // no validation errors -> pass to next route
  if (errors.isEmpty()) {
    return next();
  }

  // validation error found -> stop processing the request
  return next(Boom.badData('errors:missingRequiredData', errors.array()));
};
