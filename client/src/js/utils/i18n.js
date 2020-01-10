import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const SERVER_URL = 'http://localhost:3000/locales/';
const DEBUG = true;

i18n
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next) // bind react-i18next to the instance
  .init({
    debug: DEBUG,
    fallbackLng: 'en-US',
    load: 'currentOnly',
    ns: ['master', 'pages', 'components'],
    defaultNS: 'master',
    interpolation: {
      escapeValue: false, // not needed for react!!
    },
    backend: {
      loadPath: `${SERVER_URL}{{lng}}/{{ns}}.json`,
    },
    detection: {
      order: ['htmlTag', 'cookie', 'querystring', 'localStorage', 'navigator', 'path', 'subdomain'],
      lookupCookie: 'locale',
    },
  });

export default i18n;
