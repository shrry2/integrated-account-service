/**
 * Public API Filter
 */
const Boom = require('@hapi/boom');
const validators = require('../../../shared/validators');

const { Request } = require('../../models');

const publicApiFilter = async (req, res, next) => {
  req.logger.debug('public api filter called.');
  // check if request id is good as uuid
  try {
    validators.uuid(req.id);
  } catch (e) {
    return next(Boom.badRequest('Request ID is invalid format.'));
  }

  return next();
};

module.exports = publicApiFilter;
