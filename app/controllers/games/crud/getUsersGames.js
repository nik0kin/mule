/**
 * Controllers->Games->CRUD-> getUsersGames
 *
 * - filters by given userID
 *
 * Created by niko on 2/6/14.
 */

var _ = require('underscore'),
  mongoose = require('mongoose'),
  Q = require('q'),
  winston = require('winston');

var utils = require('mule-utils/jsonUtils'),
  Game = mongoose.model('Game');

module.exports = function getUsersGamesQ(userID) {
  return Q.promise(function (resolve, reject) {
    resolve(['yay']);
  });
};
