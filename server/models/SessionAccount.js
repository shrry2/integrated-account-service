const { Model } = require('sequelize');
const util = require('util');

class SessionAccount extends Model {
  static associate(models) {
    SessionAccount.belongsTo(models.Account);
    SessionAccount.belongsTo(models.Signin);
  }

  static async addAccount(req, account, signin) {
    if (!(account instanceof this.sequelize.models.Account)) {
      throw new Error('models:SessionAccount.addAccount: given value is not a instance of Account model');
    }

    if (!(signin instanceof this.sequelize.models.Signin)) {
      throw new Error('models:SessionAccount.addAccount: given value is not a instance of Signin model');
    }

    let sessionId = null;
    if (req.accounts) {
      // session already exists
      // check if already signed-in
      if (req.accountIds.includes(account.id)) {
        throw new Error('Already signed in to this account');
      }
      // regenerate id
      sessionId = await SessionAccount.regenerateSessionId(req);
    } else {
      // start new session
      sessionId = req.session.id;
    }

    // set current account id
    req.session.accountId = account.id;

    // create record
    return SessionAccount.create({
      sessionId,
      accountId: account.id,
      signinId: signin.id,
    });
  }

  static async findBySessionId(sessionId) {
    return SessionAccount.findAll({
      where: { sessionId },
    });
  }

  static async findByAccountId(accountId) {
    return SessionAccount.findAll({
      where: { accountId },
    });
  }

  static async regenerateSessionId(req, transaction) {
    const t = transaction || await SessionAccount.sequelize.transaction();
    try {
      const prevSessionId = req.session.id;

      // regenerate id
      await util.promisify(req.session.regenerate).bind(req.session)();

      const newSessionId = req.session.id;

      req.logger.debug(`Session ID regenerated. Prev: ${prevSessionId} New: ${newSessionId}`);

      // update db
      await SessionAccount.update({
        sessionId: newSessionId,
      }, {
        where: {
          sessionId: prevSessionId,
        },
        transaction: t,
      });

      if (!transaction) {
        await t.commit();
      }

      return newSessionId;
    } catch (e) {
      if (!transaction) {
        await t.rollback();
      }
      throw e;
    }
  }

  static async getAccountsBySessionId(sessionId) {
    const sessionAccounts = await SessionAccount.findAll({
      where: { sessionId },
    });
    if (!sessionAccounts) {
      return null;
    }

    // get all account instance
    const accounts = [];
    await Promise.all(sessionAccounts.map(async (sessionAccount) => {
      const account = await SessionAccount.sequelize.models.Account.findOne({
        where: { id: sessionAccount.accountId },
        include: [{
          model: SessionAccount.sequelize.models.ProfilePicture,
          required: false,
        }, {
          model: SessionAccount.sequelize.models.AccountSettings,
          required: false,
        }],
      });
      if (account) {
        accounts.push(account);
      } else {
        // account not exists
        sessionAccount.destroy();
      }
    }));

    return accounts;
  }

  static async signout(req, from, transaction) {
    const t = transaction || await SessionAccount.sequelize.transaction();

    try {
      switch (from) {
        case 'all':
          // destroy all accounts with current session id
          await SessionAccount.destroy({
            where: { sessionId: req.session.id },
            transaction: t,
          });
          break;
        case 'current':
          // destroy account which has current account id and current session id
          await SessionAccount.destroy({
            where: {
              sessionId: req.session.id,
              accountId: req.session.accountId,
            },
            transaction: t,
          });
          // delete account id from session
          delete req.session.accountId;
          break;
        default:
          // remove account from session by account id
          // check if specified account id is listed in signed-in accounts
          if (!req.accountIds.includes(from)) {
            throw new Error('ACCOUNT_NOT_LISTED');
          }
          await SessionAccount.destroy({
            where: {
              sessionId: req.session.id,
              accountId: from,
            },
            transaction: t,
          });
          // delete account id from session if deleted one is current one
          if (req.session.accountId === from) {
            delete req.session.accountId;
          }
          break;
      }

      const sessionAccounts = await SessionAccount.findBySessionId(req.session.id);
      if (!sessionAccounts || sessionAccounts.length <= 0) {
        // no accounts -> destroy session
        await util.promisify(req.session.destroy).bind(req.session)();
      }

      if (!transaction) {
        await t.commit();
      }
    } catch (e) {
      if (!transaction) {
        await t.rollback();
      }
      throw e;
    }
  }
}

module.exports = (sequelize, DataTypes) => {
  SessionAccount.init({
    id: {
      type: DataTypes.BIGINT(20).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    sessionId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    accountId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    signinId: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    underscored: true,
    freezeTableName: true,
    timestamps: false,
  });
  return SessionAccount;
};
