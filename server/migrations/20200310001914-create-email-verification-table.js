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

exports.up = function(db, callback) {
  db.createTable('EmailVerification', {
    id: {
      type: 'bigint',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
    },
    email: {
      type: 'string',
      notNull: true,
    },
    verification_code: {
      type: 'string',
      notNull: true,
    },
    context: {
      type: 'string',
      notNull: true,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
    },
    verified_at: {
      type: 'datetime',
    },
  }, addContextForeignKey);

  function addContextForeignKey(err) {
    if (err) { callback(err); return; }
    db.addForeignKey('EmailVerification', 'VerificationContext', 'fk_email_verification_context',
      {
        'context': 'name',
      },
      {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }, callback);
  }
};

exports.down = function(db, callback) {
  db.removeForeignKey('EmailVerification', 'fk_email_verification_context',
    {
      dropIndex: true,
    }, dropTable);

  function dropTable(err) {
    if (err) {
      callback(err);
      return;
    }
    db.dropTable('EmailVerification', callback);
  }
};

exports._meta = {
  "version": 1
};
