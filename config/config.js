
var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
  development: {
    db: 'mongodb://localhost/mule_dev',
    root: rootPath,
    port: 3130,
    app: {
      name: 'Mule Turnz Platform'
    }
  },
  test: {
    db: 'mongodb://localhost/mule_test',
    root: rootPath,
    port: 7357,
    app: {
      name: 'Mule Turnz Platform'
    }
  },
  production: {}
};
