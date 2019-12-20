const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const config = require('config').get('database');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const init = (app) => {
  sequelize
    .authenticate()
    .then(() => {
      app.logger.info('Database connection has been successfully established.');
      // eslint-disable-next-line no-param-reassign
      app.db = db;
    })
    .catch((err) => {
      app.logger.error('Database connection error: ', err);
      process.exit(1);
    });
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.init = init;

module.exports = db;
