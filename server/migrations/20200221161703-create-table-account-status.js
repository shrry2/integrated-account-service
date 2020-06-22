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
  return db.createTable('AccountStatus', {
    status: {
      type: 'string',
      primaryKey: true,
    },
    available: {
      type: 'boolean',
      notNull: true,
      defaultValue: true,
    },
  });
};

exports.down = function(db) {
  return db.dropTable('AccountStatus');
};

exports._meta = {
  "version": 1
};
