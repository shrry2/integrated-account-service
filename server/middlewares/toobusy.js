const toobusy = require('toobusy-js');
const Boom = require('@hapi/boom');

const toobusyMiddleware = () => (req, res, next) => {
  const { t } = req;

  if (toobusy()) {
    next(Boom.serverUnavailable(t('errors:tooBusy.message')));
  } else {
    next();
  }
};

module.exports = toobusyMiddleware;
