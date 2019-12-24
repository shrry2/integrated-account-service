const config = require('config');
const hpp = require('hpp');
const helmet = require('helmet');
const uuidv4 = require('uuid/v4');

const securityMiddleware = (app) => {
  const IS_DEV = app.get('env') === 'development';

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
    req.logger.debug('set nonce', { nonce: res.locals.nonce });
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

      // The origins of images are open to all servers
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
};

module.exports = securityMiddleware;
