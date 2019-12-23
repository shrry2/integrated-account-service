import * as Sentry from '@sentry/browser';
import './components/LanguageSelector';

// TODO: ENABLE ON PRODUCTION MODE
const REPORT_ERROR = false;
if (REPORT_ERROR) {
  Sentry.init({ dsn: 'https://4da6d8ca8edf4fe4964eee2c12370c7b@sentry.io/1864481' });
}
