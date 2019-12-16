/**
 * Set nonce for CSP headers
 */
const uuidv4 = require('uuid/v4');

module.exports = () => (req, res, next) => {
  res.locals.nonce = uuidv4();
  req.logger.debug('set nonce', { nonce: res.locals.nonce });
  next();
};
