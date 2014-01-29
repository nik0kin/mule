/**
 * test/controllers/games/joinGameSpec.js
 *
 * Created by niko on 1/28/14.
 */

var Q = require('q'),
  should = require('should');

var app = require('../../../server')
  Game = require('../../../app/models/Game/index'),
  User = require('../../../app/models/User'),
  dbHelper = require('../../dbHelper');

describe('Models: ', function () {
  describe('Game: ', function () {
    var ourPlayerID;
    var ourGame;

    beforeEach(function (done) {
      var ourUserParams = {username : "joe", password : "blow"};
      var ourGameParams = {
        "name": "fun game 3v3",
        "numberOfPlayers" : 6,
        "width" : 40,
        "height" : 40,
        "fog" : 'false',
        "turnStyle" : "realtime"
      };
      //clear databases TODO this could be prettier
      dbHelper.clearUsersAndGamesCollectionQ()
        .done(function () {
          // and then make a user and a game
          dbHelper.addUserQ(ourUserParams)
            .done(function (user) {
              ourPlayerID = user._id;
              dbHelper.addGameQ(ourGameParams)
                .done(function (game) {
                  var ourGameID = game._id;
                  Game.findByIdQ(ourGameID)
                    .done(function (game) {
                      should(game).ok;
                      ourGame = game;
                      done()
                    }, function (err) {
                      done(err);
                    });
                }, function (err) {
                  done(err);
                });
            }, function (err) {
              done(err);
            });
        }, function (err) {
          done(err);
        });
    });

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('.joinGameQ(playerID)', function () {
      it('should update a empty Game with one more player', function (done) {
        ourGame.joinGameQ(ourPlayerID)
          .done(function (value) {
            done();
          }, function (err) {
            done(err);
          });
      });

/*
      it('should update a non-empty Game with one more player', function (done) {
done()
      });

      it('should REJECT an attempt join a full game', function (done) {
done()
      });

      it('should REJECT an attempt join a game you are already in', function (done) {
done()
      });*/
    });
  });
});