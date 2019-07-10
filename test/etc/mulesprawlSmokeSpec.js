
var should = require('should'),
  Q = require('q'),
  _ = require('lodash');

var initTestMule = require('../configUtils').initTestMule;

var dbHelper = require('mule-models/test/dbHelper'),
  restHelper = require('mule-utils/lib/testUtils/api/restHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var createGameParams = {
  name : "niks mulesprawl game",
  ruleBundle : {
    name : 'MuleSprawl'
  },

  maxPlayers : 1,
  turnProgressStyle: 'autoprogress',
  turnTimeLimit: 15,
  ruleBundleGameSettings : {
    customBoardSettings : {
      width : 30,
      height : 30
    }
  }
};

var emptyTurn = {
  gameId: undefined,
  playerId: 'p1',
  actions: []
};

var validTurn = {
  gameId: undefined,
  playerId: 'p1',
  actions: [{
    type: 'PlaceCastle',
    params: {
      playerRel: 'p1',
      where: {
        x: undefined,
        y: undefined
      }
    }
  }]
};

describe('ETC: ', function () {
  before(initTestMule);
  describe('MuleSprawl Smoke: ', function () {
    var gameCreatorUserAgent;
    var createdGameId;

    afterEach(dbHelper.clearUsersAndGamesCollection);

    describe('Create MuleSprawl Game: ', function () {
      beforeEach(function (done) {
        this.timeout(5000);
        loginHelper.registerAndLoginQ({username: 'gameCreator89', password : 'OWWOWOWOAKDAS9'})
          .done(function (user1) {
            gameCreatorUserAgent = user1;
            done();
          }, testHelper.mochaError(done))
      });

      afterEach(dbHelper.clearGamesCollections);

      it(' should be able to take a empty turn', function (done) {
        this.timeout(20000);
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent, gameConfig: createGameParams})
          .then(function (result) {
            createdGameId = result.gameId;
            should(createdGameId).ok;

            emptyTurn.gameId = createdGameId;

            // play first turn
            return gameHelper.playTurnQ({agent: gameCreatorUserAgent, turn: emptyTurn});
          })
          .then(function (playTurnResult) {
            done();
          })
          .fail(testHelper.mochaError(done));
      });

      it(' should place a castle and wait til 2nd round and check for 6house/12farmer', function (done) {
        var waitTilRound = 2;
        this.timeout(60000);
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent, gameConfig: createGameParams})
          .then(function (result) {
            createdGameId = result.gameId;
            should(createdGameId).ok;

            // fetch board
            return gameHelper.sendRestRequest({
              agent: gameCreatorUserAgent,
              endpoint: '/games/' + createdGameId + '/board',
              verb: 'get'
            });
          })
          .then(function (boardRequestResult) {
            var board = boardRequestResult.board;
            console.log(board.length + ' pieces');

            // figure where to place castle
            var findCastleSpot = function () {
              var isGrass = function (x, y) {
                var result = _.find(board, function (space) {
                  //console.log(space)
                  return space.id === x + ',' + y;
                });

                return !!result && result.attributes.terrainType === 'grass';
              };

              var w,h;
              for (w=0;w<30;w++) {
                for (h=0;h<30;h++) {
                  var isG1 = isGrass(w,h);
                  var isG2 = isGrass(w+1,h);
                  var isG3 = isGrass(w,h+1);
                  var isG4 = isGrass(w+1,h+1);
                  if (isG1 && isG2 && isG3 && isG4){
                    console.log('found castleSpot: ' + w + ',' + h);
                    return {x:w, y:h};
                  } {
                    console.log('no ' + isG1 + ' ' + isG2 + ' ' + isG3 + ' ' + isG4 + ' ')
                  }
                }
              }
            };
            var castleSpot = findCastleSpot();

            validTurn.gameId = createdGameId;
            validTurn.actions[0].params['where'] = castleSpot;

            // play first turn
            return gameHelper.playTurnQ({agent: gameCreatorUserAgent, turn: validTurn});
          })
          .then(function (playTurnResult) {
            // wait til turn 2
            var getTurn2Q = function () {
              var restartQ = function () {
                return gameHelper.sendRestRequest({
                  agent: gameCreatorUserAgent,
                  endpoint: '/games/' + validTurn.gameId + '/history/' + waitTilRound,
                  verb: 'get'
                })
                .then(function (turn2Result) {
                  if (_.isEmpty(turn2Result)) {
                    return restartQ();
                  } else {
                    return Q(turn2Result);
                  }
                })
                .fail(function () {
                  return restartQ();
                })
              };
              return restartQ();
            };

            return getTurn2Q();
          })
          .then(function (result) {
            console.log('getTurn2Q result:')
            console.log(result);

            return gameHelper.readGameStateQ({
              gameId: createdGameId,
              agent: gameCreatorUserAgent
            })
          })
          .then(function (result) {
            // look at all pieces for 6 houses and 12 farmers
            var expectedHouseCount = 6,
              expectedFarmerCount = 12,
              totalHouseCount = 0,
              totalFarmerCount = 0;

            _.each(result.pieces, function (piece) {
              if (piece.class === 'House') {
                totalHouseCount++;
              }
              if (piece.class === 'Farmer') {
                totalFarmerCount++;
              }
            });

            should(totalHouseCount).eql(expectedHouseCount);
            should(totalFarmerCount).eql(expectedFarmerCount);

            done();
          })
          .fail(testHelper.mochaError(done));
      });

      it(' should work if the player plays at the same time as a forceProgressRound is happening', function (done) {
        this.timeout(60000);
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent, gameConfig: createGameParams})
          .then(function (result) {
            createdGameId = result.gameId;
            should(createdGameId).ok;

            validTurn.gameId = createdGameId;
            validTurn.actions = [];

            var forceTurnProgress = require('../../app/turnSystem/brain').forceTurnProgress;

            return Q.all([
              gameHelper.playTurnQ({agent: gameCreatorUserAgent, turn: validTurn}),
              forceTurnProgress({ _id: createdGameId }, 1, true)
            ])
              .then(function () {
                done()
              })
              .fail(testHelper.mochaError(done));
          })
      });
    });
  });
});
