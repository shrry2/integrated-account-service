const moment = require('moment');

const models = require('../models');

const sessionAccountMiddleware = async (req, res, next) => {
  if (!req.session) {
    // not signed in -> skip
    return next();
  }

  // get all accounts of current session
  const accounts = await models.SessionAccount.getAccountsBySessionId(req.session.id);
  if (!Array.isArray(accounts) || accounts.length === 0) {
    // no available account
    delete req.session.accountId;
    return next();
  }

  // generate array of account id list
  const accountIds = Array.from(accounts, (account) => account.id);
  req.logger.debug(`Available account IDs: ${accountIds}`);

  // check if there is current account
  if (req.session.accountId) {
    // check if current account id is listed in session accounts list
    if (!accountIds.includes(req.session.accountId)) {
      // current account is not listed in session accounts
      req.logger.error('Current account is not listed in current session accounts');
      delete req.session.accountId;
    }
  }

  if (!req.session.accountId) {
    // no current account
    // set first one as current account
    const [firstListedAccountId] = accountIds;
    req.session.accountId = firstListedAccountId;
  }

  req.logger.debug(`Current account ID: ${req.session.accountId}`);

  // set account instances to session object
  req.accounts = accounts;
  // set only ids
  req.accountIds = accountIds;

  // get current account's instance
  const currentAccount = accounts.find((account) => account.id === req.session.accountId);

  // fix language settings according to current account setting
  // except for sign in / sign up page
  const shouldIgnore = () => {
    if (req.path.startsWith('/signin')) return true;
    if (req.path.startsWith('/signup')) return true;
    return !!req.path.startsWith('/_/locales');
  };
  if (!shouldIgnore() && typeof currentAccount.AccountSetting.locale === 'string') {
    const preferredLocale = currentAccount.AccountSetting.locale;
    if (typeof req.cookies.locale === 'string' && req.cookies.locale !== preferredLocale) {
      await req.i18n.changeLanguage(preferredLocale);
      req.cookies.locale = preferredLocale;
    }
  }

  // get attribute obeject
  req.account = await currentAccount.getObject();
  req.account.instance = currentAccount;

  // update last active date
  req.session.lastActive = moment.utc();

  return next();
};

module.exports = sessionAccountMiddleware;
