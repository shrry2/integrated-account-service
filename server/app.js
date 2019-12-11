/**
 * The Great Entry Point of the App
 */

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const Boom = require('@hapi/boom');
const helmet = require('helmet');
const uuidv4 = require('uuid/v4');
const addRequestId = require('express-request-id');
const config = require('config');

const i18n = require('./utils/i18n');
const errorHandler = require('./middlewares/error-handler');

const publicApiFilter = require('./middlewares/filters/public-api-filter');
const privateApiFilter = require('./middlewares/filters/private-api-filter');

const indexRouter = require('./routes/index');

const app = express();

// Add Request ID
app.use(addRequestId());

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Logger
app.use(logger('dev'));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Host Static Files
app.use('/static', express.static(path.join(__dirname, '../client/dist')));

// Security
app.use(helmet({
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: true,
}));
const staticFileCdnUrl = 'https://static.SERVICE-NAME.com/';
app.use((req, res, next) => {
  res.locals.nonce = uuidv4();
  next();
});
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", config.get('staticHost')],
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`, 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/'],
    styleSrc: ["'self'", 'https://fonts.googleapis.com/'],
    fontSrc: ['https://fonts.gstatic.com/'],
    imgSrc: ["'self'", 'data:', config.get('staticHost')],
    frameSrc: ['https://www.google.com/recaptcha/'],
    workerSrc: ["'none'"],
    blockAllMixedContent: true,
    upgradeInsecureRequests: true,
  },
}));

// i18n
const i18next = i18n.init();
app.use(i18n.handle(i18next));

// Public API Filter - Routes that have '/_/' in uri
app.use(/.*\/_\/.*/, publicApiFilter);

// Private API Filter - Routes that have '/-/' in uri
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
