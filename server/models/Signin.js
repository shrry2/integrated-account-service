const { Model } = require('sequelize');
const generate = require('nanoid/async/generate');
const moment = require('moment');

const generateId = async () => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return generate(alphabet, 40);
};

class Signin extends Model {
  static associate(models) {
    Signin.belongsTo(models.Account);
  }

  static async createForSignup(account, signupId) {
    if (!(account instanceof this.sequelize.models.Account)) {
      throw new Error('models:Signin.createForSignup: given value is not a instance of Account model');
    }

    return Signin.create({
      id: await generateId(),
      accountId: account.id,
      token: `signup_${signupId}`,
      completedAt: moment.utc(),
    });
  }

  static async createFor(account) {
    if (!(account instanceof this.sequelize.models.Account)) {
      throw new Error('models:Signin.create: given value is not a instance of Account model');
    }

    return Signin.create({
      id: await generateId(),
      accountId: account.id,
    });
  }

  async getAvailableAuthFactors() {
    const factors = [];

    const account = await this.sequelize.models.Account.findByPk(this.accountId);

    if (!account) return factors;

    if (await account.email) {
      factors.push('email');
    }

    if (await account.phone) {
      factors.push('phone');
    }

    return factors;
  }
}

module.exports = (sequelize, DataTypes) => {
  Signin.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    accountId: {
      allowNull: false,
      type: DataTypes.STRING,
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
  return Signin;
};
