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
    var gameCreatorUserAgent;
    var createdGameId;

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('Create MuleSprawl Game: ', function () {
      before(function (done) {
        //one both users
        loginHelper.registerAndLoginQ({username: 'gameCreator89', password : 'OWWOWOWOAKDAS9'})
          .done(function (user1) {
            gameCreatorUserAgent = user1;
            done();
          }, testHelper.mochaError(done))
      });

      it('basic should work',function (done) {
        this.timeout(15000);
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent, gameConfig : createGameParams})
          .done(function (result) {
            createdGameId = result.gameId;
            should(createdGameId).ok;
            done();
          }, testHelper.mochaError(done));
      });
    });
  });
});
