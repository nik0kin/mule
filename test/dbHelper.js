/**
 * test/dbHelper.js
 *
 * Created by niko on 1/28/14.
 */

var Q = require('q');

var app = require ('../server.js');

var Game = require('../app/models/Game/index'),
  gamesHelper = require('../app/controllers/games/helper'),
  User = require('../app/models/User'),
  users = require('../app/controllers/users');


exports.clearUsersAndGamesCollectionQ = function () {
  return Q.all([User.collection.removeQ, Game.collection.removeQ]);
};
exports.clearUsersAndGamesCollection = function (done) {
  exports.clearUsersAndGamesCollectionQ()
    .done(function (value) {
      done()
    }, function (err) {
      done(err);
    });
};

exports.addUserQ = function (userParameters) {
 return users.createQ(userParameters);
};

exports.getUserQ = function (userID) {
  return users.readQ(userID);
};


exports.addGameQ = function (createGameParameters, creator) {
  return gamesHelper.createQ({validatedParams: createGameParameters, "creator": creator});
};

exports.getGameQ = function (gameID) {
  return gamesHelper.readQ(gameID);
};
