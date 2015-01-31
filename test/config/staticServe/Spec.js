var path = require('path'),
  should = require('should'),
  request = require('supertest');

var mule = require('../../../index');

var testConfig = {
  http: {
    routesPrefix: '',
    serveStaticFolders: {
      '/static/test': path.join(__dirname, 'testFolder')
    },
    port: 8011
  },
  database: {
    db: 'mongodb://localhost/mule_test'
  },
  mule: {
    minimumGameRoundTimerCheck: 10, //seconds
    minimumAutoCreateGameTimerCheck: 30,
    ruleBundles: {}
  },

  logLevel: 4, // Verbose
  logsPath:  path.normalize(__dirname + '/logs')
};

var initTestMule = function (done) {
  mule.initQ(testConfig)
    .then(function () {
      done();
    })
    .fail(function (error) {
      done(error);
    });
};

var muleServerUrl = 'http://localhost:8011';

// Currently we have trouble testing multiple configs, since mocha doesnt drop loaded modules inbetween test files
describe.skip('Config', function () {
  before(initTestMule);
  describe('Serve Static Folders', function () {
    it('should work', function (done) {
      this.timeout(100000);
      request(muleServerUrl)
        .get('/static/test/index.html')
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          should(res.text).eql('<html>TEST</html>');
          done();
        });
    });
  });
});
