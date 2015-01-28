var path = require('path');

var mule = require('../index');

var dbHelper = require('mule-models/test/dbHelper');

var testMuleConfig = {
  minimumGameRoundTimerCheck: 10, //seconds
  minimumAutoCreateGameTimerCheck: 30,
  ruleBundles: {
    'CheCkers': {},
    'BackGammon': {},
    'VIKINGS': {},
    'tictactoe': {},
    'monopoly': {},
    'connectX': {},
    'mulesprawl': {}
  }
};

var testConfig = {
  http: {
    routesPrefix: '',
    port: 3130
  },
  database: {
    db: 'mongodb://localhost/mule_test'
  },
  mule: testMuleConfig,

  logsPath:  path.normalize(__dirname + '/logs')
};

exports.initTestMule = function (done) {
  mule.initQ(testConfig)
    .then(function () {
      dbHelper.init();
      done();
    });
};
