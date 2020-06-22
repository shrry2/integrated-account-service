const twilio = require('twilio');
const getEnvVar = require('../utils/envvar-getter');
const { IS_PROD } = require('../constants');

const SEND_ENABLE = true;

const SID = IS_PROD || SEND_ENABLE ? getEnvVar('TWILIO_SID_PRODUCTION') : getEnvVar('TWILIO_SID_TEST');
const AUTH_TOKEN = IS_PROD || SEND_ENABLE ? getEnvVar('TWILIO_AUTH_TOKEN_PRODUCTION') : getEnvVar('TWILIO_AUTH_TOKEN_TEST');

const FROM_NUMBER = IS_PROD || SEND_ENABLE ? '+15109397532' : '+15005550001';

// eslint-disable-next-line new-cap
const client = new twilio(SID, AUTH_TOKEN);

const sendMessage = async (body, to) => client.messages.create({
  body,
  to,
  from: FROM_NUMBER, // From a valid Twilio number
});

module.exports = {
  sendMessage,
};
