
var should = require('should'),
  Q = require('q'),
  _ = require('lodash');

var initTestMule = require('../configUtils').initTestMule;

var dbHelper = require('mule-models/test/dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  multiplayerHelper = require('./multiplayerHelper'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var createGameParams = {
  name : "test TicTacToe",
  ruleBundle : {
    name : 'TicTacToe'
  },

  maxPlayers : 2,
  turnProgressStyle: 'waitprogress',
  turnTimeLimit: 15,
  ruleBundleGameSettings: {
    customBoardSettings: {}
  }
};

var userCreds1 = {username: 'gameCreator89', password : 'OWWOWOWOAKDAS9'},
  userCreds2 = {username: 'gameCreator99', password : 'OWWOWOWOAKDAS9'};

var player1Turns = [{
  actions: [{
    type: 'BasicCreate',
    params: {
      whereId: 'topLeft'
    }
  }]
}, {
  actions: [{
    type: 'BasicCreate',
    params: {
      whereId: 'topMiddle'
    }
  }]
}, {
  actions: [{
    type: 'BasicCreate',
    params: {
      whereId: 'bottomRight' //dumb move!!
    }
  }]
}];

var player2Turns = [{
  actions: [{
    type: 'BasicCreate',
    params: {
      whereId: 'middleLeft'
    }
  }]
}, {
  actions: [{
    type: 'BasicCreate',
    params: {
      whereId: 'middleMiddle'
    }
  }]
}, {
  actions: [{
    type: 'BasicCreate',
    params: {
      whereId: 'middleRight'
    }
  }]
}];

describe('ETC: ', function () {
  before(initTestMule);
  describe('TicTacToe Smoke: ', function () {
    var gameCreatorUserAgent1, gameCreatorUserAgent2;
    var createdGameId;

    afterEach(dbHelper.clearUsersAndGamesCollection);

    describe('Create TicTacToe Game: ', function () {
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

            player1Turns[0].gameId = createdGameId;
            player2Turns[0].gameId = createdGameId;
            return gameHelper.joinGameQ({agent: gameCreatorUserAgent2, gameId: createdGameId});
          })
          .then (function () {
            console.log('Players joined Game');
            // play first turn
            return gameHelper.playTurnQ({agent: gameCreatorUserAgent1, turn: player1Turns[0]});
          })
          .then(function (playTurn1Result) {
            console.log('1st Turn Played');
            // wait for 1st turn
            return multiplayerHelper.waitForTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, waitTilTurn: 1});
          })
          .then(function (turn1) {
            console.log('1st Turn Progressed');
            // play second turn
            return gameHelper.playTurnQ({agent: gameCreatorUserAgent2, turn: player2Turns[0]});
          })
          .then(function (playTurn2Result) {
            console.log('2nd Turn Played');
            done();
          })
          .fail(testHelper.mochaError(done));
      });

      it(' should not work when placing a token on someone elses occupied space', function (done) {
        this.timeout(5000);
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent1, gameConfig: createGameParams})
          .then(function (result) {
            createdGameId = result.gameId;
            should(createdGameId).ok;

            player1Turns[0].gameId = createdGameId;
            player2Turns[0].gameId = createdGameId;
            return gameHelper.joinGameQ({agent: gameCreatorUserAgent2, gameId: createdGameId});
          })
          .then (function () {
            console.log('Players joined Game');
            // play first turn
            return gameHelper.playTurnQ({agent: gameCreatorUserAgent1, turn: player1Turns[0]});
          })
          .then(function (playTurn1Result) {
            console.log('1st Turn Played');
            // wait for 1st turn
            return multiplayerHelper.waitForTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, waitTilTurn: 1});
          })
          .then(function (turn1) {
            console.log('1st Turn Progressed');
            // replay the same turn as player 1 played
            return gameHelper.playTurnQ({agent: gameCreatorUserAgent2, turn: player1Turns[0], expectedStatusCode: 400});
          })
          .then(function (playTurn2Result) {
            console.log('2nd Turn Denied');
            done();
          })
          .fail(testHelper.mochaError(done));
      });

      it(' should work for a full game with win/lose', function (done) {
        this.timeout(5000);

        var playSetOfTurnsQ = function (turnNumber) {
          return multiplayerHelper.waitForTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, waitTilTurn: turnNumber * 2})
            .then(function () {
              // play player 1 turn
              return gameHelper.playTurnQ({agent: gameCreatorUserAgent1, turn: player1Turns[turnNumber]});
            })
            .then(function () {
              return multiplayerHelper.waitForTurnQ({agent: gameCreatorUserAgent2, gameId: createdGameId, waitTilTurn: turnNumber * 2 + 1});
            })
            .then(function () {
              // play player 2 turn
              return gameHelper.playTurnQ({agent: gameCreatorUserAgent2, turn: player2Turns[turnNumber]});
            });
        };

        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent1, gameConfig: createGameParams})
          .then(function (result) {
            createdGameId = result.gameId;
            should(createdGameId).ok;

            _(3).times(function (i) {
              player1Turns[i].gameId = createdGameId;
              player2Turns[i].gameId = createdGameId;
            });
            return gameHelper.joinGameQ({agent: gameCreatorUserAgent2, gameId: createdGameId});
          })
          .then (function () {
            console.log('Players joined Game');

            return playSetOfTurnsQ(0);
          })
          .then(function () {
            console.log('first set played');
            return playSetOfTurnsQ(1);
          })
          .then(function () {
            console.log('second set played');
            return playSetOfTurnsQ(2);
          })
          .then(function () {
            console.log('third set played');

            return multiplayerHelper.waitForTurnQ({agent: gameCreatorUserAgent1, gameId: createdGameId, waitTilTurn: 6})
              .then(function () {
                return gameHelper.readGameQ({agent: gameCreatorUserAgent1, gameId: createdGameId})
              })
          })
          .then(function (game) {
            should(game.players['p2'].playerStatus).equal('won');
            should(game.players['p1'].playerStatus).equal('lost');
            console.log('player 2 won!')

            done();
          })
          .fail(testHelper.mochaError(done));
      });
    });
  });
});
