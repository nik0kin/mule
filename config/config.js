// serious stuff!!!

var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
  development: {
    routesPrefix: '/webservices',
    db: 'mongodb://localhost/mule_dev',
    root: rootPath,
    port: 3130,
    app: {
      name: 'Mule Turnz Platform'
    }
  },
  test: {
    routesPrefix: '',
    db: 'mongodb://localhost/mule_test',
    root: rootPath,
    port: 3130,
    app: {
      name: 'Mule Turnz Platform'
    }
  },
  production: {}
};
