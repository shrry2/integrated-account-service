/**
 * Private API Filter
 */
const Boom = require('@hapi/boom');

const privateApiFilter = (req, res, next) => {
  req.logger.debug('private api filter called.');
  next();
};

module.exports = privateApiFilter;
