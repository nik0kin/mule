/**
 * Games API: createSpec
 */

var initTestMule = require('../../../configUtils').initTestMule;

var _ = require('lodash'),
  should = require('should'),
  Q = require('q');

var loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  dbHelper = require('mule-models/test/dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  testParams = require('./createParams'),
  gameAPIHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var loggedInAgent;

describe('API', function () {
  before(initTestMule);
  describe('Games: ', function () {
    before(function (done) {
      this.timeout(3000);
      loginHelper.registerAndLoginQ()
        .then(function (agent) {
          loggedInAgent = agent;
          done();
        }, testHelper.mochaError(done));
    });

    after(dbHelper.clearUsersAndGamesCollection);

    describe('POST /games', function () {
      var invalidGameId = '53030c89296d98e92a9b2635' // but valid mongodb id

      it('return 404 to non existant gameid (but valid mongodb id)', function (done) {
        gameAPIHelper.readGameQ({gameId: invalidGameId, agent: loggedInAgent, expectedStatusCode: 404})
          .done(function (result) {
            console.log(result);
            done();
          }, testHelper.mochaError(done));
      });
    });
  });
});
