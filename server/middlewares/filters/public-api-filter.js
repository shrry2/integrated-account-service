/**
 * Public API Filter
 */
const Boom = require('@hapi/boom');

const publicApiFilter = (req, res, next) => {
  console.log('public api filter called.');
  next();
};

module.exports = publicApiFilter;
