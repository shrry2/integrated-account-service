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
  return db.createTable('AccountSettings', {
    account_id: {
      type: 'string',
      primaryKey: true,
      notNull: true,
      foreignKey: {
        name: 'fk_account_settings_account_id',
        table: 'Account',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        mapping: 'id',
      },
    },
    locale: {
      type: 'string',
      notNull: true,
    },
    timezone: {
      type: 'string',
      notNull: true,
    },
    updated_at: {
      type: 'datetime',
      notNull: true,
    },
  });
};

exports.down = function(db) {
  return db.dropTable('AccountSettings');
};

exports._meta = {
  "version": 1
};
