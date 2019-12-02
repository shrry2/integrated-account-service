/**
 * The Great Entry Point of the App
 */

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const Boom = require('@hapi/boom');

const i18n = require('./utils/i18n');
const errorHandler = require('./middlewares/error-handler');

const publicApiFilter = require('./middlewares/filters/public-api-filter');
const privateApiFilter = require('./middlewares/filters/private-api-filter');

const indexRouter = require('./routes/index');

const app = express();

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// some tedious but useful stuffs
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, '../client/dist')));

// i18n Setup
const i18next = i18n.init();
app.use(i18n.handle(i18next));

// Public API Filter - Routees that has '/_/' in uri
app.use(/.*\/_\/.*/, publicApiFilter);

// Private API Filter - Routees that has '/-/' in uri
app.use(/.*\/-\/.*/, privateApiFilter);

// Routing
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(Boom.notFound());
});

// error handler
app.use(errorHandler);

module.exports = app;
