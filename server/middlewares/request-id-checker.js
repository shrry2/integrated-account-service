const uuidValidator = require('../../shared/validators').uuid;

module.exports = (req, res, next) => {
  const requestId = req.headers['x-request-id'];

  if (requestId) {
    try {
      uuidValidator(requestId);
    } catch (e) {
      // delete if given request id is not valid as uuid
      delete req.headers['x-request-id'];
    }
  }

  next();
};