/**
 * test/dbHelper.js
 *
 * Created by niko on 1/28/14.
 */

var Q = require('q');

require ('../server.js');

var Game = require('../app/models/Game/index'),
  gamesHelper = require('../app/controllers/games/crud/helper'),
  User = require('../app/models/User'),
  users = require('../app/controllers/users/crud/helper');


exports.clearUsersAndGamesCollectionQ = function () {
  return Q.all([User.removeQ({}), Game.removeQ({})]);
};
exports.clearUsersAndGamesCollection = function (done) {
  exports.clearUsersAndGamesCollectionQ()
    .done(function (value) {
      done();
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
