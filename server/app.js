var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const i18n = require('./utils/i18n');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const publicApiFilter = require('./middlewares/filters/public-api-filter');
const privateApiFilter = require('./middlewares/filters/private-api-filter');

var app = express();

// i18n Setup
const i18next = i18n.init();
app.use(i18n.handle(i18next));

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, '../client/dist')));
// Public API Filter
// the route that matches "/_/" uri
app.use(/.*\/_\/.*/, publicApiFilter);

// Private API Filter
// the route that matches "/-/" uri
app.use(/.*\/-\/.*/, privateApiFilter);

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
