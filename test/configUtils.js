var path = require('path');

var mule = require('../index');

var dbHelper = require('mule-models/test/dbHelper');

var testMuleConfig = {
  minimumGameRoundTimerCheck: 10, //seconds
  minimumAutoCreateGameTimerCheck: 30,
  ruleBundles: {
    'BackGammon': {
      codePath: path.resolve(__dirname + '/games/backgammon/bundleCode')
    },
    'tictactoe': {
      codePath: path.resolve(__dirname + '/games/tictactoe/bundleCode')
    },
    'connectX': {
      codePath: path.resolve(__dirname + '/games/connectx/bundleCode')
    },
    'mulesprawl': {
      codePath: path.resolve(__dirname + '/games/mulesprawl/bundleCode')
    }
  }
};

var testConfig = {
  http: {
    routesPrefix: '',
    port: 8011
  },
  database: {
    db: 'mongodb://localhost/mule_test'
  },
  mule: testMuleConfig,

  logLevel: 4, // Verbose
  logsPath:  path.normalize(__dirname + '/logs')
};

exports.initTestMule = function (done) {
  mule.initQ(testConfig)
    .then(function () {
      dbHelper.init();
      done();
    })
    .fail(function (error) {
      done(error);
    });
};
