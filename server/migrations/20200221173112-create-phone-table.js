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
  return db.createTable('Phone', {
    account_id: {
      type: 'string',
      notNull: true,
      foreignKey: {
        name: 'fk_phone_account_id',
        table: 'Account',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        mapping: 'id',
      },
    },
    phone_number: {
      type: 'string',
      primaryKey: true,
      notNull: true,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
    },
  });
};

exports.down = function(db) {
  return db.dropTable('Phone');
};

exports._meta = {
  "version": 1
};
