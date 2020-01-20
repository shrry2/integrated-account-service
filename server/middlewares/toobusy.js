const toobusy = require('toobusy-js');

const toobusyMiddleware = () => (req, res, next) => {
  if (toobusy()) {
    res
      .status(503)
      .end('errors:tooBusy.message');
  } else {
    next();
  }
};

module.exports = toobusyMiddleware;
