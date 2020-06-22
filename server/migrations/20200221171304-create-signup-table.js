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
  return db.createTable('Signup', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    display_name: {
      type: 'string',
      notNull: true,
    },
    contact_type: {
      type: 'string',
      notNull: true,
      length: 20,
    },
    contact: {
      type: 'string',
      notNull: true,
    },
    verification_key: {
      type: 'string',
      notNull: true,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
    },
    completed_at: 'datetime',
  });
};

exports.down = function(db) {
  return db.dropTable('Signup');
};

exports._meta = {
  "version": 1
};
