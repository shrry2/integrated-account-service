const path = require('path');
const i18next = require('i18next');
const middleware = require('i18next-express-middleware');
const backend = require('i18next-sync-fs-backend');

const localeList = require('../../shared/global/locales');

const localeCodes = [];
localeList.forEach((lang) => {
  localeCodes.push(lang.code);
});

const init = () => {
  i18next
    .use(backend)
    .use(middleware.LanguageDetector)
    .init({
      ns: ['master', 'errors', 'pages'],
      defaultNS: 'master',
      backend: {
        loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
      },
      // debug: true,
      initImmediate: false,
      detection: {
        order: ['cookie', 'header'],
        caches: ['cookie'],
        lookupCookie: 'locale',
        lookupHeader: 'accept-language',
      },
      fallbackLng: localeCodes[0],
      preload: localeCodes,
      saveMissing: true,
      saveMissingTo: 'all',
    });

  return i18next;
};

const handle = (i18n) => middleware.handle(i18n);

module.exports = {
  init,
  handle,
};
