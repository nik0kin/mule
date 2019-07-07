
'INVALID GAME ID'

var should = require('should'),
  _ = require('lodash');

var initTestMule = require('../../configUtils').initTestMule;

var dbHelper = require('mule-models/test/dbHelper'),
  restHelper = require('mule-utils/lib/testUtils/api/restHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper'),
  createGameParams = require('./startGameParams');

describe('API: ', function () {
  before(initTestMule);
  describe('Game Services: ', function () {
    var gamerUserAgent;
    var createdGameId;

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('PlayTurn MuleSprawl Game: ', function () {
      before(function (done) {
        // create one user
        loginHelper.registerAndLoginQ({username: 'gamer123', password : 'OWWOWOWOAKDAS9'})
          .done(function (user1) {
            gamerUserAgent = user1;
            done();
          }, testHelper.mochaError(done))
      });

      it('playTurn on a non existant game shouldnt work',function (done) {
        // join a non existant game
        gameHelper.playTurnQ({
          agent: gamerUserAgent,
          turn : { actions: [], gameId: '404_id' },
          expectedStatusCode: 400
        })
          .done(function (result) {
            done();
          }, testHelper.mochaError(done));
      });
    });
  });
});
