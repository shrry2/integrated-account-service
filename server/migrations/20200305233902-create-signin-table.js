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
  return db.createTable('Signin', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    account_id: {
      type: 'string',
      notNull: true,
      foreignKey: {
        name: 'fk_signin_account_id',
        table: 'Account',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        mapping: 'id',
      },
    },
    created_at: {
      type: 'datetime',
      notNull: true,
    },
    completed_at: 'datetime',
  });
};

exports.down = function(db) {
  return db.dropTable('Signin');
};

exports._meta = {
  "version": 1
};
