/**
 * Controllers->Games->CRUD-> getUsersGames
 *
 * - filters by given userId
 */

var _ = require('lodash');

var utils = require('mule-utils/jsonUtils'),
  GameCrud = require('./helper'),
  User = require('mule-models').User.Model,
  gameUtils = require('mule-utils/generalGameUtils');

var getUsersGamesQ = function (userId) {
  return User.findByIdQ(userId)
    .then(function () {
      //check every game
      return GameCrud.indexQ();
    })
    .then(function (games) {
      //and make an array
      var usersGamesArray = [];

      _.each(games, function (value) {
        if (gameUtils.doesGameContainPlayerId(userId, value)) {
          usersGamesArray.push(value);
        }
      });

      return usersGamesArray;
    });
};

module.exports = getUsersGamesQ;
