'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('ProfilePicture', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    account_id: {
      type: 'string',
      notNull: false,
      foreignKey: {
        name: 'fk_profile_picture_account_id',
        table: 'Account',
        rules: {
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        mapping: 'id',
      },
    },
    bucket: {
      type: 'string',
      notNull: true,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
    },
  });
};

exports.down = function(db) {
  return db.dropTable('ProfilePicture');
};

exports._meta = {
  "version": 1
};
