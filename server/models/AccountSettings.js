const { Model } = require('sequelize');

const allowedKeys = ['locale', 'timezone'];

class AccountSettings extends Model {
  static associate(models) {
    AccountSettings.belongsTo(models.Account);
  }

  static async prepareByAccountId(accountId, req = null) {
    return AccountSettings.findOrCreate({
      where: { accountId },
      defaults: {
        locale: req ? req.language : 'en-US',
        timezone: 'Asia/Tokyo',
      },
    });
  }

  async setSetting(key, value) {
    if (!allowedKeys.includes(key)) {
      throw new Error('Invalid key');
    }
    return this.update({ [key]: value });
  }
}

module.exports = (sequelize, DataTypes) => {
  AccountSettings.init({
    accountId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    locale: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    timezone: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: false,
    hooks: {
      afterCreate: async (instance) => {
        // clear cache on create
        await instance.sequelize.models.Account.clearCacheById(instance.accountId);
      },
      afterUpdate: async (instance) => {
        // clear cache on update
        await instance.sequelize.models.Account.clearCacheById(instance.accountId);
      },
    },
  });
  return AccountSettings;
};
