const { Router } = require('express');

const privateApiFilter = require('./private-api-filter');
const publicApiFilter = require('./public-api-filter');

const filters = Router();

// Public API Filter - Routes that have '/_/' in uri
filters.use(/.*\/_\/.*/, publicApiFilter);

// Private API Filter - Routes that have '/-/' in uri
filters.use(/.*\/-\/.*/, privateApiFilter);

module.exports = filters;
