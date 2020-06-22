const { Model } = require('sequelize');

class VerificationContext extends Model {
  static associate(models) {
    VerificationContext.hasMany(models.EmailVerification, {
      foreignKey: 'context',
      sourceKey: 'name',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  }
}

module.exports = (sequelize, DataTypes) => {
  VerificationContext.init({
    name: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    underscored: true,
    freezeTableName: true,
    timestamps: false,
  });

  return VerificationContext;
};
