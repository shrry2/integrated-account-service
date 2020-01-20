const config = require('config');
const path = require('path');
const staticMiddleware = require('express').static;
const Boom = require('@hapi/boom');

const { SERVER_URL } = require('../constants');

const serveStatic = (app) => {
  const staticFileRealPath = path.join(__dirname, '../../client/dist');
  app.use('/static', staticMiddleware(staticFileRealPath));

  app.use((req, res, next) => {
    const host = config.get('staticHost') || `${SERVER_URL}/static`;
    res.locals.bundleUrl = `${host}bundles/${config.get('bundleContentHash')}/`;
    next();
  });
};

module.exports = serveStatic;
