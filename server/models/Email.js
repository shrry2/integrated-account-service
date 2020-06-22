const { Model } = require('sequelize');

class Email extends Model {
  static associate(models) {
    Email.belongsTo(models.Account);
  }

  static exists(email) {
    return this.count({ where: { email } })
      .then((count) => count !== 0);
  }
}

module.exports = (sequelize, DataTypes) => {
  Email.init({
    email: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    accountId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    isPrimary: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
  return Email;
};
