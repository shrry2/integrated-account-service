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
  db.createTable('PhoneVerification', {
    id: {
      type: 'bigint',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
    },
    account_id: {
      type: 'string',
      notNull: true,
    },
    phone_number: {
      type: 'string',
      notNull: true,
    },
    verification_code: {
      type: 'string',
      notNull: true,
    },
    attempts: {
      type: 'int',
      notNull: true,
      defaultValue: 0,
      unsigned: true,
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
    db.addForeignKey('PhoneVerification', 'VerificationContext', 'fk_phone_verification_context',
      {
        'context': 'name',
      },
      {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }, addAccountIdForeignKey);
  }

  function addAccountIdForeignKey(err) {
    if (err) { callback(err); return; }
    db.addForeignKey('PhoneVerification', 'Account', 'fk_phone_verification_account_id',
      {
        'account_id': 'id',
      },
      {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }, callback);
  }
};

exports.down = function(db, callback) {
  db.removeForeignKey('PhoneVerification', 'fk_phone_verification_account_id',
    {
      dropIndex: true,
    }, deleteContextForeignKey);

  function deleteContextForeignKey(err) {
    if (err) {
      callback(err);
      return;
    }
    db.removeForeignKey('PhoneVerification', 'fk_phone_verification_context',
      {
        dropIndex: true,
      }, dropTable);
  }

  function dropTable(err) {
    if (err) {
      callback(err);
      return;
    }
    db.dropTable('PhoneVerification', callback);
  }
};

exports._meta = {
  "version": 1
};
