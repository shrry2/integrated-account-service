const { Model } = require('sequelize');
const nanoid = require('nanoid/async');
const generate = require('nanoid/async/generate');
const moment = require('moment');

const Mailer = require('../email/Mailer');

const MAX_ATTEMPTS = 3;

class EmailVerification extends Model {
  static associate(models) {
    EmailVerification.belongsTo(models.VerificationContext, {
      foreignKey: 'context',
      sourceKey: 'name',
    });
    EmailVerification.belongsTo(models.Account);
  }

  static async issueCodeAndSendMessage(account, context, t, logger, defaultEmailData = {}) {
    let templateName;
    const templateVersion = 1;

    switch (context) {
      case 'signin':
        templateName = 'signin';
        break;
      case 'addition':
        templateName = 'addition_confirmation';
        break;
      default:
        throw new Error('unknown context');
    }

    const transaction = await this.sequelize.transaction();

    try {
      const verificationCode = await generate('0123456789', 6);

      // clean up before issuing new code
      await EmailVerification.destroy({
        where: {
          accountId: account.id,
          context,
          verifiedAt: null,
        },
      });

      // create new instance
      const emailVerification = await EmailVerification.create(
        {
          email: account.email,
          verificationCode,
          context,
          accountId: account.id,
          verifiedAt: null,
        }, {
          transaction,
        },
      );

      const emailData = Object.assign(defaultEmailData, {
        userName: account.displayName,
        code: verificationCode,
      });

      const signupMail = new Mailer(logger);
      await signupMail.prepareTemplate(templateName, templateVersion);
      await signupMail.compileTemplate(t, emailData);

      await signupMail.send(emailVerification.email, account.displayName);

      await transaction.commit();

      return emailVerification;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static findByAccountIdContext(accountId, context) {
    return EmailVerification.findOne({
      where: {
        accountId,
        context,
        verifiedAt: null,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async verifyCode(code) {
    // check max attempts
    if (this.attempts + 1 > MAX_ATTEMPTS) {
      throw new Error('max attempts exceeded');
    }

    // check expiration
    const issueDate = moment(this.createdAt);
    if (moment().diff(issueDate, 'minutes', true) > 5) {
      throw new Error('code expired');
    }

    if (this.verificationCode !== code) {
      // invalid code
      // count up attempts
      await this.increment('attempts');
      throw new Error('invalid code');
    }

    // correct code
    await this.update({ verifiedAt: moment.utc() });
    return true;
  }
}

module.exports = (sequelize, DataTypes) => {
  EmailVerification.init({
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.BIGINT(20).UNSIGNED,
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    verificationCode: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    attempts: {
      allowNull: false,
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    context: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    accountId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    verifiedAt: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    updatedAt: false,
  });
  return EmailVerification;
};
