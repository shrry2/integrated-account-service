/**
 * Private API Filter
 */
const Boom = require('@hapi/boom');

const privateApiFilter = (req, res, next) => {
  console.log('private api filter called.');
  next();
};

module.exports = privateApiFilter;
