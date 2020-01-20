import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import BackendAdapter from 'i18next-multiload-backend-adapter';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const SERVER_URL = 'http://localhost:3000/_/locales';
const DEBUG = true;

i18n
  .use(BackendAdapter)
  .use(LanguageDetector)
  .use(initReactI18next) // bind react-i18next to the instance
  .init({
    debug: DEBUG,
    fallbackLng: 'en-US',
    load: 'currentOnly',
    ns: ['common', 'client_master', 'pages', 'components', 'validators'],
    defaultNS: 'client_master',
    interpolation: {
      escapeValue: false, // not needed for react!!
    },
    backend: {
      backend: XHR,
      backendOption: {
        loadPath: `${SERVER_URL}?lng={{lng}}&ns={{ns}}`,
        allowMultiLoading: true,
      }
    },
    detection: {
      order: ['htmlTag', 'cookie', 'querystring', 'localStorage', 'navigator', 'path', 'subdomain'],
      lookupCookie: 'locale',
    },
  });

export default i18n;
