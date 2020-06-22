const { Model } = require('sequelize');

class DisplayName extends Model {
  static associate(models) {
    DisplayName.belongsTo(models.Account);
  }

  static async countByAccountId(accountId) {
    return DisplayName.count({
      where: {
        accountId,
      },
    });
  }
}

module.exports = (sequelize, DataTypes) => {
  DisplayName.init({
    id: {
      type: DataTypes.BIGINT(20).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    displayName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    updatedAt: false,
    hooks: {
      afterCreate: async (instance, options) => {
        // clear cache on update
        await instance.sequelize.models.Account.clearCacheById(instance.accountId);
      },
    },
  });
  return DisplayName;
};
