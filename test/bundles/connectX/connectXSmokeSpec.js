var should = require('should'),
  Q = require('q'),
  _ = require('lodash');

var initTestMule = require('../../configUtils').initTestMule;

var dbHelper = require('mule-models/test/dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  multiplayerHelper = require('../../etc/multiplayerHelper'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var createGameParams = {
  name : "test ConnectX",
  ruleBundle : {
    name : 'ConnectX'
  },

  maxPlayers : 2,
  turnProgressStyle: 'waitprogress',
  turnTimeLimit: 150,
  ruleBundleGameSettings: {
    customBoardSettings: {
      connectAmount: 4,
      width: 7,
      height: 6
    }
  }
};

var firstTurn = {
  gameId: undefined,
  actions: [{
    type: 'DropToken',
    params: {
      xDropLocation: 3
    }
  }]
};

var userCreds1 = {username: 'gameCreator89', password : 'OWWOWOWOAKDAS9'},
  userCreds2 = {username: 'gameCreator99', password : 'OWWOWOWOAKDAS9'};

describe('Bundles: ', function () {
  before(initTestMule);
  describe('ConnectX Smoke: ', function () {
    var gameCreatorUserAgent1, gameCreatorUserAgent2;
    var createdGameId;

    after(dbHelper.clearUsersAndGamesCollection);

    beforeEach(function (done) {
      this.timeout(5000);
      loginHelper.registerAndLoginQ(userCreds1)
        .then(function (user1) {
          gameCreatorUserAgent1 = user1;
          return loginHelper.registerAndLoginQ(userCreds2);
        })
        .then(function (user2) {
          gameCreatorUserAgent2 = user2;
          done();
        })
        .fail(testHelper.mochaError(done));
    });

    afterEach(dbHelper.clearGamesCollections);

    it(' startGame should work', function (done) {
      this.timeout(10000);

      gameHelper.createGameQ({agent: gameCreatorUserAgent1, gameConfig: createGameParams})
        .then(function (result) {
          console.log('Created Game');
          createdGameId = result.gameId;
          should(createdGameId).ok;

          return gameHelper.joinGameQ({agent: gameCreatorUserAgent2, gameId: createdGameId});
        })
        .then(function () {
          return gameHelper.readGameBoardQ({agent: gameCreatorUserAgent1, gameId: createdGameId})
        })
        .then(function (board) {
          should(board.board.length).equal(42);
          done();
        });
    });

      it(' should be able to take a set of turns, the same turn in fact', function (done) {
        this.timeout(5000);
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent1, gameConfig: createGameParams})
          .then(function (result) {
            createdGameId = result.gameId;
            firstTurn.gameId = createdGameId;

            return gameHelper.joinGameQ({agent: gameCreatorUserAgent2, gameId: createdGameId});
          })
          .then (function () {
            console.log('Players joined Game');

            // play first turn
            return gameHelper.playTurnQ({agent: gameCreatorUserAgent1, turn: firstTurn});
          })
          .then(function () {
            console.log('1st Turn Played');

            return multiplayerHelper.waitForTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, waitTilTurn: 1})
              .then(function () {
                return gameHelper.playTurnQ({agent: gameCreatorUserAgent2, turn: firstTurn});
              })
          })
          .then(function () {
            console.log('2nd Turn Played');

            return gameHelper.readGameStateQ({agent: gameCreatorUserAgent2, gameId: createdGameId})
          })
          .then(function (gameState) {
            should(gameState.pieces.length).equal(2);

            should(gameState.pieces[0].locationId).equal('3,6');
            should(gameState.pieces[1].locationId).equal('3,5');

            done();
          })
          .fail(testHelper.mochaError(done));
      });
  });
});
