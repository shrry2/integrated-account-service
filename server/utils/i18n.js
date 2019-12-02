const path = require('path');
const i18next = require('i18next');
const middleware = require('i18next-express-middleware');
const backend = require('i18next-sync-fs-backend');

const init = () => {
  i18next
    .use(backend)
    .use(middleware.LanguageDetector)
    .init({
      ns: ['master'],
      defaultNS: 'master',
      backend: {
        loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
      },
      debug: true,
      initImmediate: false,
      detection: {
        order: ['cookie', 'header'],
        caches: ['cookie'],
        lookupCookie: 'locale',
        lookupHeader: 'accept-language',
      },
      fallbackLng: 'en',
      preload: ['en', 'ja'],
    });

  return i18next;
};

const handle = (i18n) => {
  return middleware.handle(i18n);
};

module.exports = {
  init,
  handle,
};
