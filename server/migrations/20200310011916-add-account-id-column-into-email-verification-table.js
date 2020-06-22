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
  db.addColumn('EmailVerification', 'account_id', {
    type: 'string',
    notNull: true,
  }, addForeignKey);

  function addForeignKey(err) {
    if (err) { callback(err); return; }
    db.addForeignKey('EmailVerification', 'Account', 'fk_email_verification_account_id',
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
  db.removeForeignKey('EmailVerification', 'fk_email_verification_account_id',
    {
      dropIndex: true,
    }, removeColumn);

  function removeColumn(err) {
    if (err) {
      callback(err);
      return;
    }
    db.removeColumn('EmailVerification', 'account_id', callback);
  }
};

exports._meta = {
  "version": 1
};
