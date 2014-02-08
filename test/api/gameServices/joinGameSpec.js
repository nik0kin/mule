/**
 * joinGameSpec.js
 *   @nikpoklitar
 */

var should = require('should'),
  _ = require('underscore');

require('../../../server.js');

var params = require('./joinGameParams'),
  dbHelper = require('../../dbHelper'),
  restHelper = require('../restHelper'),
  testHelper = require('../../mochaHelper'),
  loginHelper = require('../loginHelper')('http://localhost:3130'),
  gameHelper = require('../gameHelper');

describe('API: ', function () {
  describe('Game Services: ', function () {
    var gameCreatorUserAgent;
    var createdGameID;

    var ourUserAgent;

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('Join Game: ', function () {
      before(function (done) {
        //create both users
        loginHelper.registerAndLoginQ({username: 'gameCreator89', password : 'OWWOWOWOAKDAS9'})
          .done(function (user1) {
            gameCreatorUserAgent = user1;

            loginHelper.registerAndLoginQ({username: 'NIKOLAS', password : 'poklitar'})
              .done(function (user2) {
                ourUserAgent = user2;
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done))
      });

      beforeEach(function (done) {
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent, gameConfig : params.validGameConfig})
          .done(function (result) {
            createdGameID = result.gameID;
            should(createdGameID).ok;
            done();
          }, testHelper.mochaError(done));
      });

      it('should return json' , function (done) {
        restHelper.expectJson({ done: done, userAgent: ourUserAgent, endpoint: '/games/' + createdGameID + '/join', verb: 'post' });
      });

      it('basic should work' , function (done) {
        gameHelper.joinGameQ({agent : ourUserAgent, gameID : createdGameID})
          .done(function (result) {
            should(result).ok;
            should(result.status).eql(0);
            gameHelper.readGameQ({agent : ourUserAgent, gameID : createdGameID})
              .done(function (game) {
                should(game).ok;
                should(game.players).ok;
                should(game.players['p2']).ok;
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      it('gameStatus should change if two more people join a three player game', function (done) {
        loginHelper.registerAndLoginQ({username: 'anohterUser', password : 'poklitar'})
          .done(function (newUserAgent) {
            gameHelper.joinGameQ({agent : newUserAgent, gameID : createdGameID})
              .done(function (result) {
                should(result).ok;
                should(result.status).eql(0);
                gameHelper.joinGameQ({agent : ourUserAgent, gameID : createdGameID, expectedStatusCode : 200})
                  .done(function (result) {
                    should(result).ok;
                    should(result.status).eql(0);
                    gameHelper.readGameQ({agent : ourUserAgent, gameID : createdGameID})
                      .done( function (result2) {
                        should(result2.players).ok
                        should(_.size(result2.players)).eql(3);
                        should(result2.gameStatus).eql('inProgress');
                        done();
                      }, testHelper.mochaError(done));
                  }, testHelper.mochaError(done));
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      describe('reject if' , function () {
        it('should reject an invalid gameID' , function (done) {
          gameHelper.joinGameQ({agent : ourUserAgent, gameID : 'THISWONTWORK', expectedStatusCode : 403})
            .done(function (result) {
              should(result).ok;
              should(result.status).eql(-1);
              gameHelper.readGameQ({agent : ourUserAgent, gameID : createdGameID})
                .done( function (result) {
                  should(result.players).ok
                  should(_.size(result.players)).eql(1);
                  done();
                }, testHelper.mochaError(done));
            }, testHelper.mochaError(done));
        });
        it('should reject if you are already the game' , function (done) {
          //just gonna use the 'gameCreatorUserAgent' here for less code
          gameHelper.joinGameQ({agent : gameCreatorUserAgent, gameID : createdGameID, expectedStatusCode : 403})
            .done(function (result) {
              should(result).ok;
              should(result.status).eql(-1);
              gameHelper.readGameQ({agent : gameCreatorUserAgent, gameID : createdGameID})
                .done( function (result2) {
                  should(result2.players).ok
                  should(_.size(result2.players)).eql(1);
                  done();
                }, testHelper.mochaError(done));
            }, testHelper.mochaError(done));
        });
        it('should reject if its full' , function (done) {
          loginHelper.registerAndLoginQ({username: 'anohterUser', password : 'poklitar'})
            .done(function (newUserAgent) {
              gameHelper.joinGameQ({agent : newUserAgent, gameID : createdGameID})
                .done(function (result) {
                  should(result).ok;
                  should(result.status).eql(0);
                  loginHelper.registerAndLoginQ({username: 'anohterUser2', password : 'wowzers13'})
                    .done(function (newUserAgent2) {
                      gameHelper.joinGameQ({agent : newUserAgent2, gameID : createdGameID})
                        .done(function (result) {
                          should(result).ok;
                          should(result.status).eql(0);
                          gameHelper.joinGameQ({agent : ourUserAgent, gameID : createdGameID, expectedStatusCode : 403})
                            .done(function (result) {
                              should(result).ok;
                              should(result.status).eql(-1);
                              gameHelper.readGameQ({agent : ourUserAgent, gameID : createdGameID})
                                .done( function (result2) {
                                  should(result2.players).ok
                                  should(_.size(result2.players)).eql(3);
                                  done();
                                }, testHelper.mochaError(done));
                            }, testHelper.mochaError(done));
                        }, testHelper.mochaError(done));
                    }, testHelper.mochaError(done));
                }, testHelper.mochaError(done));
            }, testHelper.mochaError(done));
        });
        /*it('should reject if its not a joinable game (inProgress or finished)' , function () {
         //TODO once games can 'Start'
         });*/
      });

    });

  });
});