/**
 * test/controllers/games/joinGameSpec.js
 *
 * Created by niko on 1/28/14.
 */

var Q = require('q'),
  should = require('should'),
  _ = require('underscore');

var app = require('../../../server')
Game = require('../../../app/models/Game/index'),
  User = require('../../../app/models/User'),
  dbHelper = require('../../dbHelper'),
  testHelper = require('../../helper');

describe('Models: ', function () {
  describe('Game: ', function () {
    var ourPlayerID;
    var ourGame;

    beforeEach(function (done) {
      var ourUserParams = {username : "joe", password : "blow"};
      var ourGameParams = {
        "name": "fun game 3v3",
        "numberOfPlayers" : 3,
        "width" : 40,
        "height" : 40,
        "fog" : 'false',
        "turnStyle" : "realtime"
      };
      //clear databases TODO this could be prettier
      dbHelper.clearUsersAndGamesCollectionQ()
        .done(function () {
          dbHelper.addUserQ(ourUserParams)
            .done(function (user) {
              should(user._id).ok;
              ourPlayerID = user._id;
              dbHelper.addGameQ(ourGameParams)
                .done(function (game) {
                  var ourGameID = game._id;
                  Game.findByIdQ(ourGameID)
                    .done(function (game) {
                      should(game).ok;
                      ourGame = game;
                      done()
                    }, testHelper.mochaError(done));
                }, testHelper.mochaError(done));
            }, testHelper.mochaError(done));
        }, testHelper.mochaError(done));
    });

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('.joinGameQ(playerID)', function () {
      it('should update a empty Game with one more player', function (done) {
        ourGame.joinGameQ(ourPlayerID)
          .done(function (value) {
            dbHelper.getGameQ(ourGame._id)
              .done(function (result) {
                should(result).ok;
                should(result.players).ok;
                should(_.keys(result.players).length).eql(1);
                done()
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      /*
       it('should update a non-empty Game with one more player', function (done) {
       //make 2 user and join
       //join on our user
       done()
       });

       it('should REJECT an attempt join a full game', function (done) {
       //make 3 users and join

       //join on our user
       done()
       });

       it('should REJECT an attempt join a game you are already in', function (done) {
       //join a game

       //try to join a game again
       done()
       });*/
    });
  });
});

