/**
 * The Great Entry Point of the App
 */

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const Boom = require('@hapi/boom');
const addRequestId = require('express-request-id');

const { IS_PROD, FORCE_SENTRY_ENABLED } = require('./constants');
const sentry = require('./utils/sentry');
const i18n = require('./utils/i18n');
const secureApp = require('./middlewares/security');
const errorHandler = require('./middlewares/error-handler');
const tooBusy = require('./middlewares/toobusy');

const filters = require('./middlewares/filters');

const allRoutes = require('./routes');

const db = require('./models');

const app = express();

const logger = require('./utils/logger')(app);

// Add Request ID
app.use(addRequestId());

// Init Sentry in production mode or force sentry mode
if (IS_PROD || FORCE_SENTRY_ENABLED) {
  app.use(sentry.middleware(app));
}

// Initialize logger and start logging
app.use(logger);

// i18n
const i18next = i18n.init();
app.use(i18n.handle(i18next));

app.use(tooBusy());

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Host Static Files
app.use('/static', express.static(path.join(__dirname, '../client/dist')));

// Initialize database
db.init(app);

// Security
secureApp(app);

// Filters
app.use(filters);

// Routing
app.use('/', allRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(Boom.notFound());
});

// sentry error handler
if (IS_PROD || FORCE_SENTRY_ENABLED) {
  app.use(sentry.errorHandler());
}

// error handler
app.use(errorHandler);

module.exports = app;
