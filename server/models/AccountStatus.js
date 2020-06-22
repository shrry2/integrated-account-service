const { Model } = require('sequelize');

class AccountStatus extends Model {
  static associate(models) {
    AccountStatus.hasMany(models.Account, {
      foreignKey: 'status',
      // sourceKey: 'status',
      onDelete: 'RESTRICT',
    });
  }
}

module.exports = (sequelize, DataTypes) => {
  AccountStatus.init({
    status: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    available: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    underscored: true,
    freezeTableName: true,
    timestamps: false,
  });

  return AccountStatus;
};
