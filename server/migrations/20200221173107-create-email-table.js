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
  return db.createTable('Email', {
    account_id: {
      type: 'string',
      notNull: true,
      foreignKey: {
        name: 'fk_email_account_id',
        table: 'Account',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        mapping: 'id',
      },
    },
    email: {
      type: 'string',
      primaryKey: true,
      notNull: true,
    },
    is_primary: {
      type: 'boolean',
      notNull: true,
      defaultValue: false,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
    },
  });
};

exports.down = function(db) {
  return db.dropTable('Email');
};

exports._meta = {
  "version": 1
};
