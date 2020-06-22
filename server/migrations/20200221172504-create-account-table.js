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
  return db.createTable('Account', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    signup_id: {
      type: 'string',
      notNull: true,
      foreignKey: {
        name: 'fk_account_signup_id',
        table: 'Signup',
        rules: {
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT',
        },
        mapping: 'id',
      },
    },
    status: {
      type: 'string',
      notNull: true,
      foreignKey: {
        name: 'fk_account_status',
        table: 'AccountStatus',
        rules: {
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        mapping: 'status',
      },
    },
    created_at: {
      type: 'datetime',
      notNull: true,
    },
    updated_at: {
      type: 'datetime',
    },
  });
};

exports.down = function(db) {
  return db.dropTable('Account');
};

exports._meta = {
  "version": 1
};
