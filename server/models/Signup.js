const { Model } = require('sequelize');
const nanoid = require('nanoid/async');
const generate = require('nanoid/async/generate');
const moment = require('moment');

const sms = require('../sms/index');
const Mailer = require('../email/Mailer');

class Signup extends Model {
  static associate(models) {
    Signup.hasOne(models.Account, {
      // onDelete: 'RESTRICT',
    });
  }

  static async findByContact(contact) {
    return this.findOne({ where: { contact } });
  }

  static async createSignup(req, signupData) {
    let transaction;
    try {
      transaction = await this.sequelize.transaction();

      const {
        displayName,
        contactType,
        contact,
      } = signupData;

      // create new instance
      const signup = await this.create(
        {
          id: await nanoid(40),
          displayName,
          contactType,
          contact,
          verificationKey: 'temporary',
          verificationIssuedAt: moment.utc(),
          completedAt: null,
        }, {
          transaction,
        },
      );

      // issue verification key
      await signup.issueKeyAndSendMessage(req, transaction);

      await transaction.commit();

      return signup;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async generateAccountId() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let account = null;
    let accountId = '';
    let count = 0;
    do {
      if (count > 5) {
        throw new Error('generateAccountId: too many retry');
      }

      // eslint-disable-next-line no-await-in-loop
      accountId = `A${await generate(chars, count > 3 ? 10 : 9)}`;
      // eslint-disable-next-line no-await-in-loop
      account = await this.sequelize.models.Account.findByPk(accountId);
      count += 1;
    } while (account !== null);

    return accountId;
  }

  /**
   * Instance Methods
   */

  /**
   * Check if 5 minutes passed since last code issue
   * @returns {boolean}
   */
  reissueAvailable() {
    const prevIssueDate = moment(this.get('verificationIssuedAt'));
    return moment().diff(prevIssueDate, 'minutes', true) > 5;
  }

  /**
   * Check if less than 3 minutes since code issue (sms)
   * @returns {boolean}
   */
  codeAvailable() {
    const issueDate = moment(this.get('verificationIssuedAt'));
    return moment().diff(issueDate, 'minutes', true) <= 3;
  }

  /**
   * Check if less than 2 hours since key issue (email)
   * @returns {boolean}
   */
  keyAvailable() {
    const issueDate = moment(this.get('verificationIssuedAt'));
    return moment().diff(issueDate, 'hours', true) <= 2;
  }

  /**
   * Issue new code and send sms or email
   * @param req required to use translator and some variables
   * @param [transaction] optional
   * @returns {Promise} Promise object of updating database
   */
  async issueKeyAndSendMessage(req, transaction = undefined) {
    const t = transaction || await this.sequelize.transaction();

    try {
      let verificationKey;
      switch (this.contactType) {
        case 'mobilePhone': {
          verificationKey = await generate('0123456789', 6);
          // send sms
          const body = req.t('sms:verificationCode', { code: verificationKey });
          await sms.sendMessage(body, this.contact);
          break;
        }
        case 'email': {
          verificationKey = await nanoid(60);
          // send email
          const setupURL = `${req.app.get('baseURL')}signup/verify/${this.get('id')}?key=${verificationKey}`;

          const signupMail = new Mailer(req.logger);
          await signupMail.prepareTemplate('signup', 1);
          await signupMail.compileTemplate(req.t, { userName: this.displayName, setupURL });

          await signupMail.send(this.contact, this.displayName);
          break;
        }
        default:
          throw new Error('invalid contact type');
      }

      await this.update({
        verificationKey,
        verificationIssuedAt: moment.utc(),
      }, { transaction: t });

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

  async validateVerificationKey(verificationKey) {
    if (typeof verificationKey !== 'string') {
      throw new Error('entered verification key is not string');
    }

    if (this.completedAt) {
      throw new Error('signup has already been completed');
    }

    switch (this.contactType) {
      case 'mobilePhone': {
        if (!this.codeAvailable()) {
          throw new Error('key is already expired');
        }

        const splitted = this.verificationKey.split('_');
        const validCode = splitted[0];
        const tryCount = splitted.length === 1 ? 0 : Number(splitted[splitted.length - 1]);

        if (tryCount > 3) {
          throw new Error('max retry count (3) exceeded');
        }

        if (validCode === verificationKey) {
          return true;
        }

        await this.update({ verificationKey: `${validCode}_${tryCount + 1}` });

        return false;
      }
      case 'email': {
        if (!this.keyAvailable()) {
          throw new Error('key is already expired');
        }

        return this.verificationKey === verificationKey;
      }
      default:
        throw new Error('invalid contact type');
    }
  }

  async complete() {
    if (this.completedAt !== null) {
      throw new Error('signupAlreadyDone');
    }

    let transaction;
    try {
      transaction = await this.sequelize.transaction();

      const {
        Account,
        DisplayName,
        Phone,
        Email,
      } = this.sequelize.models;

      // create new account
      const account = await Account.create({
        id: await Signup.generateAccountId(),
        signupId: this.id,
        status: 'active',
        updated_at: moment.utc(),
      });

      // insert display name
      await DisplayName.create({
        accountId: account.id,
        displayName: this.displayName,
      });

      switch (this.contactType) {
        // insert mobile phone number
        case 'mobilePhone':
          await Phone.create({
            accountId: account.id,
            phoneNumber: this.contact,
          });
          break;
        // insert email
        case 'email':
          await Email.create({
            accountId: account.id,
            email: this.contact,
            isPrimary: true,
          });
          break;
        default:
          throw new Error('invalid contact type');
      }

      this.update({ completedAt: moment.utc() });

      await transaction.commit();

      return account;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = (sequelize, DataTypes) => {
  Signup.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    displayName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    contactType: {
      allowNull: false,
      type: DataTypes.STRING(20),
      validate: {
        isIn: [['mobilePhone', 'email']],
      },
    },
    contact: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    verificationKey: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    verificationIssuedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    completedAt: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    updatedAt: false,
  });
  return Signup;
};
