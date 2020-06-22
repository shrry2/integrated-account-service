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
  db.addColumn('Account', 'profile_picture_id', {
    type: 'string',
    notNull: false,
  }, addForeignKey);

  function addForeignKey(err) {
    if (err) { callback(err); return; }
    db.addForeignKey('Account', 'ProfilePicture', 'fk_account_profile_picture_id',
      {
        'profile_picture_id': 'id',
      },
      {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }, callback);
  }
};

exports.down = function(db, callback) {
  db.removeForeignKey('Account', 'fk_account_profile_picture_id',
    {
      dropIndex: true,
    }, removeColumn);

  function removeColumn(err) {
    if (err) {
      callback(err);
      return;
    }
    db.removeColumn('Account', 'profile_picture_id', callback);
  }
};

exports._meta = {
  "version": 1
};
