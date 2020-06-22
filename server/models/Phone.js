const { Model } = require('sequelize');

class Phone extends Model {
  static associate(models) {
    Phone.belongsTo(models.Account);
  }

  static exists(phoneNumber) {
    return this.count({ where: { phoneNumber } })
      .then((count) => count !== 0);
  }
}

module.exports = (sequelize, DataTypes) => {
  Phone.init({
    phoneNumber: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    accountId: {
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
  return Phone;
};
