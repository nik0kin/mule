/**
 * joinGameSpec.js
 */

var should = require('should'),
  _ = require('lodash');

var initTestMule = require('../../configUtils').initTestMule;

var params = require('./joinGameParams'),
  dbHelper = require('mule-models/test/dbHelper'),
  restHelper = require('mule-utils/lib/testUtils/api/restHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper');
/*
describe('API: ', function () {
  before(initTestMule);
  describe('Game Services: ', function () {
    var gameCreatorUserAgent;
    var createdGameId;

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
            createdGameId = result.gameId;
            should(createdGameId).ok;
            done();
          }, testHelper.mochaError(done));
      });

      it('should return json' , function (done) {
        restHelper.expectJson({ done: done, userAgent: ourUserAgent, endpoint: '/games/' + createdGameId + '/join', verb: 'post' });
      });

      it('basic should work' , function (done) {
        gameHelper.joinGameQ({agent : ourUserAgent, gameId : createdGameId})
          .done(function (result) {
            should(result).ok;
            should(result.status).eql(0);
            gameHelper.readGameQ({agent : ourUserAgent, gameId : createdGameId})
              .done(function (game) {
                should(game).ok;
                should(game.players).ok;
                should(game.players['p2']).ok;
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      it('gameStatus should change if two more people join a three player game', function (done) {
        this.timeout(10000);
        loginHelper.registerAndLoginQ({username: 'anohterUser', password : 'poklitar'})
          .done(function (newUserAgent) {
            gameHelper.joinGameQ({agent : newUserAgent, gameId : createdGameId})
              .done(function (result) {
                should(result).ok;
                should(result.status).eql(0);
                gameHelper.joinGameQ({agent : ourUserAgent, gameId : createdGameId, expectedStatusCode : 200})
                  .done(function (result) {
                    should(result).ok;
                    should(result.status).eql(0);
                    gameHelper.readGameQ({agent : ourUserAgent, gameId : createdGameId})
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
        it('should reject an invalid gameId' , function (done) {
          gameHelper.joinGameQ({agent : ourUserAgent, gameId : 'THISWONTWORK', expectedStatusCode : 403})
            .done(function (result) {
              should(result).ok;
              should(result.status).eql(-1);
              gameHelper.readGameQ({agent : ourUserAgent, gameId : createdGameId})
                .done( function (result) {
                  should(result.players).ok
                  should(_.size(result.players)).eql(1);
                  done();
                }, testHelper.mochaError(done));
            }, testHelper.mochaError(done));
        });
        it('should reject if you are already the game' , function (done) {
          //just gonna use the 'gameCreatorUserAgent' here for less code
          gameHelper.joinGameQ({agent : gameCreatorUserAgent, gameId : createdGameId, expectedStatusCode : 403})
            .done(function (result) {
              should(result).ok;
              should(result.status).eql(-1);
              gameHelper.readGameQ({agent : gameCreatorUserAgent, gameId : createdGameId})
                .done( function (result2) {
                  should(result2.players).ok
                  should(_.size(result2.players)).eql(1);
                  done();
                }, testHelper.mochaError(done));
            }, testHelper.mochaError(done));
        });
        it('should reject if its full' , function (done) {
          this.timeout(5000);
          loginHelper.registerAndLoginQ({username: 'anohterUser', password : 'poklitar'})
            .done(function (newUserAgent) {
              gameHelper.joinGameQ({agent : newUserAgent, gameId : createdGameId})
                .done(function (result) {
                  should(result).ok;
                  should(result.status).eql(0);
                  loginHelper.registerAndLoginQ({username: 'anohterUser2', password : 'wowzers13'})
                    .done(function (newUserAgent2) {
                      gameHelper.joinGameQ({agent : newUserAgent2, gameId : createdGameId})
                        .done(function (result) {
                          should(result).ok;
                          should(result.status).eql(0);
                          gameHelper.joinGameQ({agent : ourUserAgent, gameId : createdGameId, expectedStatusCode : 403})
                            .done(function (result) {
                              should(result).ok;
                              should(result.status).eql(-1);
                              gameHelper.readGameQ({agent : ourUserAgent, gameId : createdGameId})
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
/*
      });

    });

  });
});
*/
