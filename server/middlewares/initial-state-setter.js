const generateAccountState = require('../utils/account-state-generator');

const setInitialState = async (req, res, next) => {
  if (!req.accounts) {
    // not logged in
    return next();
  }

  // flter non-active but signed-in accounts
  const otherAccounts = req.accounts.filter((account) => account.id !== req.session.accountId);

  // get other accounts attributes
  const accountAttributes = [];
  await Promise.all(otherAccounts.map(async (account) => {
    const object = await account.getObject();
    accountAttributes.push(object);
  }));

  // set initial state
  res.locals.initialState = {
    session: {
      currentAccount: generateAccountState(req.account),
      otherAccounts: accountAttributes.map((attributes) => {
        if (attributes.id === req.session.accountId) {
          return null;
        }
        return generateAccountState(attributes);
      }),
    },
  };

  return next();
};

module.exports = setInitialState;
