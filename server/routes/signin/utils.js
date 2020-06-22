const CryptoJS = require('crypto-js');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const Boom = require('@hapi/boom');

const models = require('../../models');

const getEnvVar = require('../../utils/envvar-getter');

const SIGNIN_JWT_SECRET = getEnvVar('SIGNIN_JWT_SECRET');
const SIGNIN_AUTHFACTOR_SECRET = getEnvVar('SIGNIN_AUTHFACTOR_SECRET');

const JWT_ISS = 'https://amid.cc/';
const JWT_SUB = 'SigninToken';

const generateToken = (jti, authFactors) => {
  const auth = {};
  authFactors.forEach((factor) => {
    auth[factor] = null;
  });

  return jwt.sign({
    jti,
    iss: JWT_ISS,
    sub: JWT_SUB,
    auth,
  }, SIGNIN_JWT_SECRET, { expiresIn: '3m' });
};

const verifyToken = (token) => jwt.verify(token, SIGNIN_JWT_SECRET, {
  iss: JWT_ISS,
  sub: JWT_SUB,
});

const tokenValidator = async (req, res, next) => {
  req.logger.debug('token validator called');

  if (typeof req.body.token !== 'string') {
    return next(Boom.badData());
  }

  // verify token
  let decodedToken;
  try {
    decodedToken = verifyToken(req.body.token);
  } catch (e) {
    if (e.message === 'jwt expired') {
      return next(Boom.badRequest('tokenExpired'));
    }
    req.logger.error(e);
    return next(Boom.badRequest('routes:signin.errors.invalidToken'));
  }

  // set decoded token
  req.decodedToken = decodedToken;
  req.logger.debug(decodedToken);

  // get signin instance
  const signin = await models.Signin.findByPk(decodedToken.jti);
  if (!signin) {
    // no sign-in instance with the jti
    return next(Boom.badRequest());
  }
  if (signin.completedAt) {
    // sign-in already completed
    return next(Boom.badRequest());
  }

  // set sign-in instance
  req.signin = signin;

  return next();
};

const generateApproval = (jti, factor) => {
  const now = moment().utc().format('X');
  const certificate = `${jti}_${factor}_${now}`;
  return CryptoJS.AES.encrypt(certificate, SIGNIN_AUTHFACTOR_SECRET).toString();
};

const verifyApproval = (decodedToken, factor) => {
  const bytes = CryptoJS.AES.decrypt(decodedToken.auth[factor], SIGNIN_AUTHFACTOR_SECRET);
  const certificate = bytes.toString(CryptoJS.enc.Utf8);
  const elements = certificate.split('_');

  console.log(elements);

  if (elements.length !== 3) {
    throw new Error('Certificate is not valid format');
  }
  if (elements[0] !== decodedToken.jti) {
    throw new Error('Token id mismatch');
  }
  if (elements[1] !== factor) {
    throw new Error('Auth factor mismatch');
  }
  // check approved date
  const approved = moment.unix(Number(elements[2])).utc();
  const iatDate = moment.unix(Number(decodedToken.iat)).utc();
  if (approved.isBefore(iatDate)) {
    throw new Error('Approved date is before token issue');
  }
  const expDate = moment.unix(Number(decodedToken.exp)).utc();
  if (approved.isAfter(expDate)) {
    throw new Error('Approved date is after token expires');
  }
};

const updateToken = (prevDecodedToken, factor) => {
  const approval = generateApproval(prevDecodedToken.jti, factor);
  const newAuth = Object.assign(prevDecodedToken.auth, { [factor]: approval });

  return jwt.sign({
    jti: prevDecodedToken.jti,
    iss: JWT_ISS,
    sub: JWT_SUB,
    auth: newAuth,
    iat: prevDecodedToken.iat,
  }, SIGNIN_JWT_SECRET, { expiresIn: '3m' });
};

const extendToken = (prevDecodedToken) => jwt.sign({
  jti: prevDecodedToken.jti,
  iss: JWT_ISS,
  sub: JWT_SUB,
  auth: prevDecodedToken.auth,
  iat: prevDecodedToken.iat,
}, SIGNIN_JWT_SECRET, { expiresIn: '5m' });

const validateAuthFactor = (decodedToken, factor) => {
  if (typeof decodedToken.auth !== 'object') {
    throw new Error('auth field of token is invalid format');
  }
  // check if it is available as auth factor
  if (!Object.prototype.hasOwnProperty.call(decodedToken.auth, factor)) {
    throw new Error(`${factor} is not available as an auth factor`);
  }
  // check if it is not approved yet
  if (decodedToken.auth[factor] !== null) {
    throw new Error('already verified');
  }
};

module.exports = {
  tokenValidator,
  generateToken,
  verifyToken,
  generateApproval,
  verifyApproval,
  updateToken,
  extendToken,
  validateAuthFactor,
};
