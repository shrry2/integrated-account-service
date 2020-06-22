const { Model } = require('sequelize');

const getEnvVar = require('../utils/envvar-getter');

const { deleteGCSItem } = require('../middlewares/image');

const CLOUD_BUCKET = getEnvVar('CLOUD_USER_CONTENT_BUCKET');

const PROFILE_PICTURE_LIMIT = 10;

class ProfilePicture extends Model {
  static associate(models) {
    ProfilePicture.belongsTo(models.Account);
    ProfilePicture.hasOne(models.Account, {
      onDelete: 'SET NULL', // for GCS deletion after removing account
      onUpdate: 'CASCADE',
    });
  }

  static async countByAccountId(accountId) {
    return ProfilePicture.count({
      where: {
        accountId,
      },
    });
  }

  static getPublicUrl(id, bucket = CLOUD_BUCKET) {
    if (bucket === 'usercontent.stayt.co') {
      return `https://usercontent.stayt.co/${id}`;
    }

    return `https://storage.cloud.google.com/${bucket}/${id}`;
  }

  static getImgixUrl(id, bucket = CLOUD_BUCKET) {
    if (bucket === 'usercontent.stayt.co') {
      return `https://stayt-user-content.imgix.net/${id}`;
    }

    return null;
  }

  static async checkBeforeUpload(accountId) {
    const profilePicturesCount = await ProfilePicture.countByAccountId(accountId);
    if (profilePicturesCount >= PROFILE_PICTURE_LIMIT) {
      throw new Error('PROFILE_PICTURE_LIMIT_EXCEEDED');
    }
    return true;
  }

  static async addPicture(accountId, bucket, filename) {
    return ProfilePicture.create({
      id: filename,
      accountId,
      bucket,
    });
  }
}

module.exports = (sequelize, DataTypes) => {
  ProfilePicture.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    accountId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    bucket: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    publicUrl: {
      type: new DataTypes.VIRTUAL(DataTypes.STRING, ['id', 'bucket']),
      get() {
        return ProfilePicture.getPublicUrl(this.get('id'), this.get('bucket'));
      },
    },
    imgixUrl: {
      type: new DataTypes.VIRTUAL(DataTypes.STRING, ['id', 'bucket']),
      get() {
        return ProfilePicture.getImgixUrl(this.get('id'), this.get('bucket'));
      },
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
      // delete real file from GCS before removing the record
      beforeDestroy: async (instance) => deleteGCSItem(instance.id, instance.bucket),
    },
  });
  return ProfilePicture;
};
