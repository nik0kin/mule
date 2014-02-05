/**
 * test/controllers/games/joinGameSpec.js
 *
 * Created by niko on 1/28/14.
 */

var Q = require('q'),
  should = require('should'),
  _ = require('underscore');

var app = require('../../../server');

var Game = require('../../../app/models/Game/index'),
  User = require('../../../app/models/User'),
  dbHelper = require('../..//dbHelper'),
  testHelper = require('../../mochaHelper'),
  validParams = require('../../validParams/gameConfig');

describe('Models: ', function () {
  describe('Game: ', function () {
    var ourPlayer;
    var ourGame;

    beforeEach(function (done) {
      var ourUserParams = {username : "joe", password : "blow"};
      var ourGameParams = validParams.validGameParams[0];
      ourGameParams.dontJoinCreator = true;

      //clear databases TODO this could be prettier
      dbHelper.clearUsersAndGamesCollectionQ()
        .done(function () {
          dbHelper.addUserQ(ourUserParams)
            .done(function (user) {
              should(user._id).ok;
              ourPlayer = user;
              dbHelper.addGameQ(ourGameParams)
                .done(function (game) {
                  var ourGameID = game._id;
                  Game.findByIdQ(ourGameID)
                    .done(function (game) {
                      should(game).ok;
                      ourGame = game;
                      done();
                    }, testHelper.mochaError(done));
                }, testHelper.mochaError(done));
            }, testHelper.mochaError(done));
        }, testHelper.mochaError(done));
    });

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('.joinGameQ(playerID)', function () {
      it('should update a empty Game with one more player', function (done) {
        ourGame.joinGameQ(ourPlayer)
          .done(function (value) {
            dbHelper.getGameQ(ourGame._id)
              .done(function (result) {
                should(result).ok;
                should(result.players).ok;
                should(_.keys(result.players).length).eql(1);
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      it('should update a non-empty Game with one more player', function (done) {
        //make another user and join
        dbHelper.addUserQ({username : "USER2", password : "iamaprohacker"})
          .done(function (user) {
            ourGame.joinGameQ(user)
              .done(function (result) {
                // then join on our user
                ourGame.joinGameQ(ourPlayer)
                  .done(function (value) {
                    dbHelper.getGameQ(ourGame._id)
                      .done(function (result) {
                        should(result).ok;
                        should(result.players).ok;
                        should(_.size(result.players)).eql(2);
                        var keys = _.keys(result.players);
                        should(result.players[keys[0]].playerID).not.eql(result.players[keys[1]].playerID);
                        done();
                      }, testHelper.mochaError(done));
                  }, testHelper.mochaError(done));
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      it('should REJECT an attempt join a full game', function (done) {
        //make 2 users and join
        dbHelper.addUserQ({username : "USER3", password : "iamapr0hacker"})
          .done(function (user) {
            ourGame.joinGameQ(user)
              .done(function (result) {
                dbHelper.addUserQ({username : "USER2", password : "iamaprohacker"})
                  .done(function (user) {
                    ourGame.joinGameQ(user)
                      .done(function (result) {
                        // then join on our user
                        ourGame.joinGameQ(ourPlayer)
                          .done(testHelper.mochaError(done), function (err) {
                            should(err).eql('Game Full');
                            done();
                          });
                      }, testHelper.mochaError(done));
                  }, testHelper.mochaError(done));
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      it('should REJECT an attempt join a game you are already in', function (done) {
        //join a game
        ourGame.joinGameQ(ourPlayer)
          .done(function (value) {
            //try to join a game again
            ourGame.joinGameQ(ourPlayer)
              .done(testHelper.mochaError(done), function (err) {
                should(err).eql('Player is already in Game');
                done();
              });
          }, testHelper.mochaError(done));
      });
    });
  });
});

