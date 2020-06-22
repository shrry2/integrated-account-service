const { Model } = require('sequelize');
const nanoid = require('nanoid/async');
const generate = require('nanoid/async/generate');
const moment = require('moment');

const sms = require('../sms/index');

const MAX_ATTEMPTS = 3;

class PhoneVerification extends Model {
  static associate(models) {
    PhoneVerification.belongsTo(models.VerificationContext, {
      foreignKey: 'context',
      sourceKey: 'name',
    });
    PhoneVerification.belongsTo(models.Account);
  }

  static async issueCodeAndSendMessage(account, context, t) {
    switch (context) {
      case 'signin':
      case 'addition':
        break;
      default:
        throw new Error('unknown context');
    }

    const transaction = await this.sequelize.transaction();

    try {
      const verificationCode = await generate('0123456789', 6);

      // clean up before issuing new code
      await PhoneVerification.destroy({
        where: {
          accountId: account.id,
          context,
          verifiedAt: null,
        },
      });

      // create new instance
      const phoneVerification = await PhoneVerification.create(
        {
          phoneNumber: account.phone,
          verificationCode,
          context,
          accountId: account.id,
          verifiedAt: null,
        }, {
          transaction,
        },
      );

      const body = t('sms:verificationCode', { code: verificationCode });
      await sms.sendMessage(body, account.phone);

      await transaction.commit();

      return phoneVerification;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static findByAccountIdContext(accountId, context) {
    return PhoneVerification.findOne({
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
  PhoneVerification.init({
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.BIGINT(20).UNSIGNED,
    },
    phoneNumber: {
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
  return PhoneVerification;
};
