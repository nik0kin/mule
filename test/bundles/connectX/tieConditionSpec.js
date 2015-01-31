var should = require('should'),
  Q = require('q'),
  _ = require('lodash');

var initTestMule = require('../../configUtils').initTestMule;

var dbHelper = require('mule-models/test/dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  multiplayerHelper = require('../../etc/multiplayerHelper'),
  connectXHelper = require('./helper'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var createGameParams = {
  name : "tie ConnectX",
  ruleBundle : {
    name : 'ConnectX'
  },

  maxPlayers : 2,
  turnProgressStyle: 'waitprogress',
  turnTimeLimit: 150,
  ruleBundleGameSettings: {
    customBoardSettings: {
      connectAmount: 4,
      width: 4,
      height: 4
    }
  }
};

var userCreds1 = {username: 'gameCreator89', password : 'OWWOWOWOAKDAS9'},
  userCreds2 = {username: 'gameCreator99', password : 'OWWOWOWOAKDAS9'};

describe('Bundles: ', function () {
  before(initTestMule);
  describe('ConnectX: ', function () {
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

    it(' winCondition should trigger on a tie', function (done) {
      this.timeout(10000);

      var p1XPositions = [1, 2, 3, 4, 1, 2, 3, 4],
        p2XPositions = [3, 4, 1, 2, 3, 4, 1, 2];

      //create the game with the first user
      gameHelper.createGameQ({agent: gameCreatorUserAgent1, gameConfig: createGameParams})
        .then(function (result) {
          createdGameId = result.gameId;

          return gameHelper.joinGameQ({agent: gameCreatorUserAgent2, gameId: createdGameId});
        }) 
        .then (function () {
          console.log('Players joined Game');

          // play first turn
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, xPosition: p1XPositions[0]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, xPosition: p2XPositions[0]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, xPosition: p1XPositions[1]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, xPosition: p2XPositions[1]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, xPosition: p1XPositions[2]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, xPosition: p2XPositions[2]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, xPosition: p1XPositions[3]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, xPosition: p2XPositions[3]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, xPosition: p1XPositions[4]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, xPosition: p2XPositions[4]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, xPosition: p1XPositions[5]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, xPosition: p2XPositions[5]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, xPosition: p1XPositions[6]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, xPosition: p2XPositions[6]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, xPosition: p1XPositions[7]});
        })
        .then(function () {
          return connectXHelper.waitAndSubmitTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, xPosition: p2XPositions[7]});
        })
        .then(function () {
          // check tie
          return gameHelper.readGameQ({agent: gameCreatorUserAgent2, gameId: createdGameId})
        })
        .then(function (game) {
          should(game.players['p1'].playerStatus).equal('tie');
          should(game.players['p2'].playerStatus).equal('tie');
          done();
        })
        .fail(testHelper.mochaError(done));
    });

  });
});
