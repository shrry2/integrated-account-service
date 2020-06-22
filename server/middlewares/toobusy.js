const toobusy = require('toobusy-js');

const toobusyMiddleware = () => (req, res, next) => {
  if (toobusy()) {
    res
      .status(503)
      .end('The server is too busy. Please try again later.');
  } else {
    next();
  }
};

module.exports = toobusyMiddleware;
