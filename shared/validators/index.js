const validator = require('validator');
const libphonenumber = require('libphonenumber-js/max');

const locales = require('../global/locales');
const localeCodes = [];
locales.forEach((locale) => {
  localeCodes.push(locale.code);
});

const isString = (value) => {
  return typeof value === 'string';
};

let validators = {};

validators.notEmpty = (value, trim = true) => {
  if (! isString(value)) throw new Error('invalidString');
  if (trim) value = value.trim();
  if (value.length === 0) throw new Error('empty');

  return value;
};

/**
 * Display Name Validator
 *
 * Rules:
 * Type: string
 * Max length: 50
 * No Empty
 *
 * @param displayName
 * @returns {String|string}
 */
validators.displayName = (displayName) => {
  if (! isString(displayName)) throw new Error('invalidString');
  if (displayName.trim().length === 0) throw new Error('displayName.empty');
  if (! validator.isLength(displayName, { min: 0, max: 50 })) throw new Error('displayName.tooLong');

  return displayName.trim();
};

/**
 * Email Validator
 *
 * Rules:
 * Type: string (Email structure)
 * Max length: 256
 * No Empty
 *
 * @param email
 * @returns {string}
 */
validators.email = (email) => {
  if (! isString(email)) throw new Error('invalidString');
  if (email.trim().length === 0) throw new Error('email.empty');
  if (! validator.isEmail(email)) throw new Error('email.invalid');
  if (! validator.isLength(email, { min: 0, max: 256 })) throw new Error('email.tooLong');

  return validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    gmail_convert_googlemaildotcom: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  }).trim();
};

/**
 * Agreement Checker
 *
 * Rules:
 * Type: boolean
 * Only true value is accepted
 *
 * @param agree
 * @returns {boolean}
 */
validators.agreement = (agree) => {
  if (typeof agree !== 'boolean') throw new Error('invalidBoolean');
  if (!agree) throw new Error('agreement.needAgreement');

  return true;
};

/**
 * Locale Code
 *
 * check if the value has good locale code format using regexp
 * such as: en-US and ja-JP
 *
 * @param localeCode
 * @returns {string}
 */
validators.localeCode = (localeCode) => {
  if (typeof localeCode !== 'string') throw new Error('invalidString');
  const regexp = /^[a-z]{2}-[A-Z]{2}$/;
  if (! regexp.test(localeCode)) throw new Error('localeCode.invalidFormat');

  return localeCode;
};

/**
 * Available Locale Code
 *
 * check if the value is good as a locale code
 * and listed in the locales list
 *
 * @param localeCode
 */
validators.availableLocaleCode = (localeCode) => {
  try {
    validators.localeCode(localeCode);
  } catch (e) {
    throw e;
  }

  if (localeCodes.indexOf(localeCode) === -1) throw new Error('localeCode.notAvailable');

  return localeCode;
};

/**
 * Translation Namespace
 *
 * only allowed alphabet and underscores
 *
 * @param ns
 * @returns {string}
 */
validators.translationNamespace = (ns) => {
  const regexp = /^[a-zA-Z][a-zA-Z_]*[a-zA-Z]$/;
  if (! regexp.test(ns)) throw new Error('translationNamespace.invalidFormat');

  return ns;
};


validators.uuid = (uuid) => {
    if (! validator.isUUID(uuid)) throw new Error('uuid.invalid');

    return uuid;
};

validators.mobilePhone = (phoneNumber, defaultCountry = null) => {
  if (typeof phoneNumber !== 'string') phoneNumber = phoneNumber + '';

  if (phoneNumber.length === 0) {
    throw new Error('mobilePhone.empty');
  }

  const { parsePhoneNumberFromString } = libphonenumber;
  let phoneNumberParsed;
  if (typeof defaultCountry === 'string' && defaultCountry.length === 2) {
    phoneNumberParsed = parsePhoneNumberFromString(phoneNumber, defaultCountry);
  } else {
    phoneNumberParsed = parsePhoneNumberFromString(phoneNumber);
  }

  if (!phoneNumberParsed) {
    throw new Error('mobilePhone.unrecognizable');
  }

  if (!phoneNumberParsed.isValid()) {
    throw new Error('mobilePhone.invalid');
  }

  const type = phoneNumberParsed.getType();
  if (type !== 'MOBILE' && type !=='FIXED_LINE_OR_MOBILE') {
    throw new Error('mobilePhone.notMobile');
  }

  // determine normalized format according to default country
  if (phoneNumberParsed.country === defaultCountry) {
    return phoneNumberParsed.formatNational();
  }

  return phoneNumberParsed.formatInternational();
};

validators.formatPhoneNumber = (phoneNumber, format = 'E.164', country = null) => {
  if (typeof phoneNumber !== 'string') phoneNumber = phoneNumber + '';

  const { parsePhoneNumberFromString } = libphonenumber;

  let phoneNumberParsed;
  if (typeof country === 'string' && country.length === 2) {
    phoneNumberParsed = parsePhoneNumberFromString(phoneNumber, country);
  } else {
    phoneNumberParsed = parsePhoneNumberFromString(phoneNumber);
  }

  return phoneNumberParsed.format(format);
};

module.exports = validators;
