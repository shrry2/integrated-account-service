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
  db.createTable('SessionAccount', {
    id: {
      type: 'bigint',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
    },
    session_id: {
      type: 'string',
      notNull: true,
    },
    account_id: {
      type: 'string',
      notNull: true,
    },
    signin_id: {
      type: 'string',
      notNull: true,
      unique: true,
    },
  }, addAccountIdForeignKey);

  function addAccountIdForeignKey(err) {
    if (err) { callback(err); return; }
    db.addForeignKey('SessionAccount', 'Account', 'fk_session_account_account_id',
      {
        'account_id': 'id',
      },
      {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }, addSigninIdForeignkey);
  }

  function addSigninIdForeignkey(err) {
    if (err) { callback(err); return; }
    db.addForeignKey('SessionAccount', 'Signin', 'fk_session_account_signin_id',
      {
        'signin_id': 'id',
      },
      {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }, callback);
  }
};

exports.down = function(db, callback) {
  db.removeForeignKey('SessionAccount', 'fk_session_account_signin_id',
    {
      dropIndex: true,
    }, removeAccountIdForeignKey);

  function removeAccountIdForeignKey(err) {
    if (err) {
      callback(err);
      return;
    }
    db.removeForeignKey('SessionAccount', 'fk_session_account_account_id',
      {
        dropIndex: true,
      }, dropTable);
  }

  function dropTable(err) {
    if (err) {
      callback(err);
      return;
    }
    db.dropTable('SessionAccount', callback);
  }
};

exports._meta = {
  "version": 1
};
