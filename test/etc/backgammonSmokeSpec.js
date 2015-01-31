var should = require('should'),
  Q = require('q'),
  _ = require('lodash');

var initTestMule = require('../configUtils').initTestMule;

var dbHelper = require('mule-models/test/dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  multiplayerHelper = require('./multiplayerHelper'),
  bgTestHelper = require('./bgTestHelper'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var createGameParams = {
  name : "test Backgammon",
  ruleBundle : {
    name : 'Backgammon'
  },

  maxPlayers : 2,
  turnProgressStyle: 'waitprogress',
  turnTimeLimit: 150,
  ruleBundleGameSettings: {
    customBoardSettings: {}
  }
};

var userCreds1 = {username: 'gameCreator89', password : 'OWWOWOWOAKDAS9'},
  userCreds2 = {username: 'gameCreator99', password : 'OWWOWOWOAKDAS9'};

describe('ETC: ', function () {
  before(initTestMule);

  describe('Backgammon Smoke: ', function () {
    var gameCreatorUserAgent1, gameCreatorUserAgent2;
    var createdGameId;

    afterEach(dbHelper.clearUsersAndGamesCollection);

    describe('Create Backgammon Game: ', function () {
      beforeEach(function (done) {
        this.timeout(5000);
        loginHelper.registerAndLoginQ(userCreds1)
          .then(function (user1) {
            gameCreatorUserAgent1 = user1;
            return loginHelper.registerAndLoginQ(userCreds2)
          })
          .then(function (user2) {
            gameCreatorUserAgent2 = user2;
            done();
          })
          .fail(testHelper.mochaError(done));
      });

      afterEach(dbHelper.clearGamesCollections);

      it(' should be able to take a set of turns', function (done) {
        this.timeout(5000);
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent1, gameConfig: createGameParams})
          .then(function (result) {
            createdGameId = result.gameId;
            should(createdGameId).ok;

            return gameHelper.joinGameQ({agent: gameCreatorUserAgent2, gameId: createdGameId});
          })
          .then (function () {
            console.log('Players joined Game');

            // play first turn
            return bgTestHelper.readRollAndBoardThenPlayDumbTurnQ({agent: gameCreatorUserAgent1, playerRel: 'p1', gameId: createdGameId});
          })
          .then(function () {
            console.log('1st Turn Played');

            return multiplayerHelper.waitForTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, waitTilTurn: 1})
              .then(function (turn1) {
                should.exist(turn1.playerTurns['p1'].actions[0].metadata);
                return bgTestHelper.readRollAndBoardThenPlayDumbTurnQ({agent: gameCreatorUserAgent2, playerRel: 'p2', gameId: createdGameId});
              })
          })
          .then(function () {
            console.log('2nd Turn Played');
            return multiplayerHelper.waitForTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, waitTilTurn: 2})
              .then(function (turn2) {
                should.exist(turn2.playerTurns['p2'].actions[0].metadata);
              });
          })
          .then(function () {
            done();
          })
          .fail(testHelper.mochaError(done));
      });
    });
  });
});
