/**
 * Public API Filter
 */
const Boom = require('@hapi/boom');

const publicApiFilter = (req, res, next) => {
  req.logger.debug('public api filter called.');
  next();
};

module.exports = publicApiFilter;
