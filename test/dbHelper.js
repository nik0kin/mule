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
  return Q.promise(function (resolve, reject) {
    users.createUserHelper(userParameters, function (err, user) {
      if (err)
        reject(err);
      else
        resolve(user)
    })
  });
};

exports.addGameQ = function (userParameters) {
  return gamesHelper.createQ(userParameters);
};