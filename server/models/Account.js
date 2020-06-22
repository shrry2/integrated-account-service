const { Model } = require('sequelize');
const Firestore = require('@google-cloud/firestore');
const redis = require('redis');
const hash = require('object-hash');
const { promisify } = require('util');
const moment = require('moment');

const { IS_PROD } = require('../constants');
const getEnvVar = require('../utils/envvar-getter');
const validators = require('../../shared/validators');

const MEMORY_CACHE_EXPIRY = 60 * 60 * 24; // in seconds

/**
 * Account data is stored multiple places
 * 1. Redis store
 * 2. Google Firestore
 * 3. MySQL Database (source data)
 */

/**
 * Redis Store Setup
 */

// default redis connection info
let redisHost = 'localhost';
let redisPort = 6379;
let db = 2;

// load from environment variables in production environment
if (IS_PROD) {
  redisHost = getEnvVar('REDIS_HOST');
  redisPort = getEnvVar('REDIS_PORT');
  db = getEnvVar('REDIS_DB_INDEX_ACCOUNT_DATA_STORE');
}

const client = redis.createClient({
  host: redisHost,
  port: redisPort,
  enable_offline_queue: false,
  db,
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

/**
 * Firestore Setup
 */
const firestore = new Firestore({
  projectId: 'stayt-account',
  keyFilename: getEnvVar('GOOGLE_APPLICATION_CREDENTIALS'),
});

const fireStoreCollection = firestore.collection('attributes');

class Account extends Model {
  static associate(models) {
    Account.belongsTo(models.Signup, {
      foreignKey: 'signupId',
      as: 'signsign',
    });
    Account.belongsTo(models.AccountStatus, {
      foreignKey: 'status',
    });
    Account.hasMany(models.DisplayName, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Account.hasMany(models.Email, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Account.hasMany(models.Phone, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Account.hasMany(models.EmailVerification, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Account.hasMany(models.ProfilePicture, {
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    Account.belongsTo(models.ProfilePicture, {
      as: 'profilePicture',
    });
    Account.hasOne(models.AccountSettings, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }

  static async clearCacheById(accountId) {
    const account = await Account.findByPk(accountId);
    if (account) {
      account.clearCache();
      return true;
    }
    return false;
  }

  static async findByIdentifier(identifier, location = 'US') {
    if (typeof identifier !== 'string') return null;

    // try to find by phone number

    let normalizedPhoneNumber;
    try {
      normalizedPhoneNumber = validators.formatPhoneNumber(identifier, 'E.164', location);
    } catch (e) {
      normalizedPhoneNumber = false;
    }

    if (normalizedPhoneNumber) {
      const phone = await this.sequelize.models.Phone.findByPk(normalizedPhoneNumber, {
        include: [{
          model: this.sequelize.models.Account,
        }],
      });
      if (phone && phone.Account) {
        return phone.Account;
      }
    }

    // try to find by email

    let normalizedEmail;
    try {
      normalizedEmail = validators.email(identifier);
    } catch (e) {
      // not valid as email
      normalizedEmail = false;
    }

    if (normalizedEmail) {
      // try to find by email
      const email = await this.sequelize.models.Email.findByPk(normalizedEmail, {
        include: [{
          model: this.sequelize.models.Account,
        }],
      });
      if (email && email.Account) {
        return email.Account;
      }
    }

    // could not find account in any way
    return null;
  }

  /**
   * Getters
   */

  // get latest display name
  get displayName() {
    return (async () => {
      const latestDisplayName = await this.sequelize.models.DisplayName.findOne({
        attributes: ['displayName'],
        where: { accountId: this.id },
        order: [['createdAt', 'DESC']],
        limit: 1,
      });
      return latestDisplayName.displayName;
    })();
  }

  // get latest PRIMARY email
  get email() {
    return (async () => {
      const latestPrimaryEmail = await this.sequelize.models.Email.findOne({
        attributes: ['email'],
        where: { accountId: this.id, isPrimary: true },
        order: [['createdAt', 'DESC']],
      });
      return latestPrimaryEmail ? latestPrimaryEmail.email : null;
    })();
  }

  // get latest phone
  get phone() {
    return (async () => {
      const latestPhone = await this.sequelize.models.Phone.findOne({
        attributes: ['phoneNumber'],
        where: { accountId: this.id },
        order: [['createdAt', 'DESC']],
      });
      return latestPhone ? latestPhone.phoneNumber : null;
    })();
  }

  get profilePicture() {
    return (async () => {
      if (this.profilePictureId === null) return null;
      if (this.ProfilePicture) {
        return this.ProfilePicture.publicUrl;
      }
      const profilePicture = await this.sequelize.models.ProfilePicture.findOne({
        where: {
          id: this.profilePictureId,
        },
      });
      if (profilePicture && profilePicture.accountId === this.id) {
        return profilePicture;
      }
      return null;
    })();
  }

  /**
   * Instance methods
   */

  /**
   * get account attributes as object
   * try getting from memory store firstly
   * if not found, try getting from firestore secondy,
   * if not found in both, get them from db and update cache
   */
  async getObject() {
    let source;

    // try to get from memory store
    let attributes = await this.getFromMemoryStore();

    if (attributes) {
      // cache found in memory
      source = 'memory';
    } else {
      // no cache in memory store
      // try to get from firestore
      attributes = await this.getFromFireStore();
      source = 'firestore';
      if (attributes) {
        // cache was not found only in memory cache
        // so create it in memory store
        this.updateMemoryStoreCache(attributes);
      }
    }

    if (!attributes || hash(attributes) !== this.hash) {
      // could not get cache or hashes don't match
      source = 'db';
      // generate object from db
      attributes = await this.generateObject();
      // update hash
      this.updateCache(attributes);
    } else {
      // update memory cache expiry
      client.expire(this.id, MEMORY_CACHE_EXPIRY);
    }

    return {
      ...attributes,
      meta: {
        hash: hash(attributes),
        source,
      },
    };
  }

  async generateObject() {
    const profilePicture = await this.profilePicture;
    const settings = this.AccountSetting;

    return {
      id: this.id,
      displayName: await this.displayName,
      email: await this.email,
      phone: await this.phone,
      profilePictureId: profilePicture ? profilePicture.id : null,
      profilePicture: profilePicture ? profilePicture.publicUrl : null,
      profilePictureImgix: profilePicture ? profilePicture.imgixUrl : null,
      status: this.status,
      memberSince: this.createdAt,
      settings: {
        locale: settings.locale || null,
        timezone: settings.timezone || null,
      },
    };
  }

  async getFromMemoryStore() {
    // try to get from memory store
    let attributes = null;
    try {
      const attributesString = await getAsync(this.id);
      attributes = JSON.parse(attributesString);
      // parse date string to date object
      attributes.memberSince = moment(attributes.memberSince).toDate();
    } catch (e) {
      // could not get from memory store
    }
    return attributes;
  }

  async getFromFireStore() {
    // get from firestore
    const doc = await fireStoreCollection.doc(this.id).get();
    if (doc.exists) {
      const attributes = doc.data();
      // transform timestamp to date object
      attributes.memberSince = attributes.memberSince.toDate();
      return attributes;
    }
    // could not get from any data store
    return null;
  }

  async updateMemoryStoreCache(attributes = null) {
    if (!attributes) {
      // eslint-disable-next-line no-param-reassign
      attributes = await this.generateObject();
    }
    // update memory store
    const attributesString = JSON.stringify(attributes);
    await setAsync(this.id, attributesString, 'EX', MEMORY_CACHE_EXPIRY);
  }

  async updateFireStoreCache(attributes = null) {
    if (!attributes) {
      // eslint-disable-next-line no-param-reassign
      attributes = await this.generateObject();
    }
    // update firestore
    const result = await fireStoreCollection.doc(this.id).set(attributes);
    if (!result) {
      throw new Error('could not update firestore cache');
    }
  }

  /**
   * update cache
   * @returns {Promise<void>}
   */
  async updateCache(attributes = null) {
    if (!attributes) {
      // eslint-disable-next-line no-param-reassign
      attributes = await this.generateObject();
    }
    await this.updateMemoryStoreCache(attributes);
    await this.updateFireStoreCache(attributes);

    // I don't know why this.update() does not work properly
    // use class method instead
    Account.update({
      hash: hash(attributes),
    }, {
      where: {
        id: this.id,
      },
    });
  }

  /**
   * set cache hash null so that it will not be loaded from cache
   */
  clearCache() {
    Account.update({
      hash: null,
    }, {
      where: {
        id: this.id,
      },
    });
  }

  async setProfilePicture(profilePicture) {
    if (profilePicture === null) {
      this.profilePictureId = null;
    } else {
      if (!(profilePicture instanceof this.sequelize.models.ProfilePicture)) {
        throw new Error('models:Account.setProfilePicture: given argument is not a instance of ProfilePicture model');
      }
      if (profilePicture.accountId !== this.id) {
        throw new Error('NOT_OWNED_BY_THE_USER');
      }
      this.profilePictureId = profilePicture.id;
    }
    return this.save();
  }
}

module.exports = (sequelize, DataTypes) => {
  Account.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    signupId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    hash: {
      type: DataTypes.STRING,
    },
    profilePictureId: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    underscored: true,
    freezeTableName: true,
    hooks: {
      beforeUpdate: (account) => {
        // clear cache on update
        if (account.previous('hash') === account.hash) {
          // eslint-disable-next-line no-param-reassign
          account.hash = null;
        }
      },
    },
  });
  return Account;
};
