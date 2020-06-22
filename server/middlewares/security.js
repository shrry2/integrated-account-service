const hpp = require('hpp');
const helmet = require('helmet');
const uuidv4 = require('uuid/v4');
const Boom = require('@hapi/boom');
const { IS_DEV } = require('../constants');

const csrf = require('./csrf');

const securityMiddleware = (app) => {
  // Prevent HTTP Parameter pollution
  app.use(hpp());

  // Never expose important information to hackers
  app.disable('x-powered-by');

  // Add X-XSS-Protection header to prevent reflected XSS attacks.
  app.use(helmet.xssFilter());

  // Add X-Frame-Options header to prevent clickjacking
  app.use(helmet.frameguard('deny'));

  // Add X-Download-Options header to prevent Internet Explorer from executing
  // downloads in your site’s context.
  app.use(helmet.ieNoOpen());

  // Add X-Content-Type-Options header not to Sniff Mimetype middleware
  app.use(helmet.noSniff());

  // Content Security Policy (CSP)

  // Set CSP Nonce for every requests
  app.use((req, res, next) => {
    res.locals.nonce = uuidv4();
    next();
  });

  const cspConfig = {
    directives: {
      // Fallback for unspecified directives
      defaultSrc: ["'self'"],

      // Valid sources of JavaScript.
      scriptSrc: [
        "'self'",
        'www.google-analytics.com',
        'https://www.google.com/recaptcha/',
        'https://www.gstatic.com/recaptcha/',
        // Attach the nonce generated above
        (request, response) => `'nonce-${response.locals.nonce}'`,
      ],

      // The origins of image are open to all servers
      imgSrc: ['https:', 'http:', "'self'", 'data:', 'blob:'],

      // Valid sources of stylesheets
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com/'],

      // Applies to XMLHttpRequest (AJAX), WebSocket or EventSource.
      // If not allowed the browser emulates a 400 HTTP status code.
      connectSrc: ["'self'"],

      // Valid sources of fonts
      fontSrc: ['https://fonts.gstatic.com/'],

      // Valid sources of frames
      frameSrc: ['https://www.google.com/recaptcha/'],

      // lists the URLs for workers and embedded frame contents
      childSrc: ['https:', 'http:'],

      // allows control over Flash and other plugins.
      objectSrc: ["'none'"],

      // restricts the origins allowed to deliver video and audio.
      mediaSrc: ["'none'"],

      workerSrc: ["'none'"],
    },
    // reportOnly: app.get('env') === 'development',
    blockAllMixedContent: true,
    upgradeInsecureRequests: true,
  };

  app.use(helmet.contentSecurityPolicy(cspConfig));

  // load CSRF middleware
  app.use(csrf);

  // set csrf token to view locals
  app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  // csrf token error handler
  app.use((err, req, res, next) => {
    if (req.csrfToken) {
      res.locals.csrfToken = req.csrfToken();
    }

    // catch only csrf token error
    if (err.code === 'EBADCSRFTOKEN') {
      // if in dev env and csrf check disable flag is on,
      // ignore csrf check error
      if (IS_DEV && req.query.nocsrf === '1') {
        return next();
      }

      return next(Boom.forbidden('CSRF Token Error'));
    }
    return next(err);
  });
};

module.exports = securityMiddleware;
