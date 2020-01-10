const validator = require('validator');
let i18next = require('i18next');

const localeList = require('../global/locales');

const localeCodes = [];
const resources = {};
localeList.forEach((lang) => {
  try {
    resources[lang.code] = require(`./messages/${lang.code}.json`);
    localeCodes.push(lang.code);
  } catch (e) {
    console.error(`Failed to load translation resource for ${lang.code}.`, e);
  }
});

if (process.browser) {
  i18next = i18next.default;
}

i18next.init({
  resources,
  ns: ['validations'],
  defaultNS: 'validations',
  initImmediate: false,
  fallbackLng: localeCodes[0],
});

const isString = (value) => {
  return typeof value === 'string';
};

class Validator {
  constructor(localeCode) {
    if(localeCodes.includes(localeCode)) {
      i18next
        .changeLanguage(localeCode)
        .then((t) => {
          this.t = t;
        });
    } else {
      this.t = i18next.t;
    }
  }

  displayName(displayName) {
    if (!isString(displayName)) throw new Error(this.t('invalidString'));
    if (displayName.trim().length === 0) throw new Error(this.t('displayName.empty'));
    if (! validator.isLength(displayName, { min: 0, max: 50 })) throw new Error(this.t('displayName.tooLong'));

    return displayName.trim();
  }

  email(email) {
    if (! isString(email)) throw new Error(this.t('invalidString'));
    if (email.trim().length === 0) throw new Error(this.t('email.empty'));
    if (! validator.isEmail(email)) throw new Error(this.t('email.invalid'));
    if (! validator.isLength(email, { min: 0, max: 256 })) throw new Error(this.t('email.tooLong'));

    return validator.normalizeEmail(email, {
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      gmail_convert_googlemaildotcom: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
    }).trim();
  }

  agreement(agree) {
    if (typeof agree !== 'boolean') throw new Error(this.t('invalidBoolean'));
    if (!agree) throw new Error(this.t('agreement.needAgreement'));

    return true;
  }
}

module.exports = Validator;
