const config = require('config');
const path = require('path');
const staticMiddleware = require('express').static;

const { SERVER_URL } = require('../constants');

const serveStatic = (app) => {
  const staticFileRealPath = path.join(__dirname, '../../client/dist');
  app.use('/static', staticMiddleware(staticFileRealPath));

  const localeFileMiddlePath = path.join(__dirname, '../../client/locales');
  app.use('/locales', staticMiddleware(localeFileMiddlePath));

  app.use((req, res, next) => {
    const host = config.get('staticHost') || `${SERVER_URL}/static`;
    res.locals.bundleUrl = `${host}bundles/${config.get('bundleContentHash')}/`;
    next();
  });
};

module.exports = serveStatic;
