/**
 * Controllers->Games->CRUD-> getUsersGames
 *
 * - filters by given userID
 *
 * Created by niko on 2/6/14.
 */

var _ = require('underscore'),
  mongoose = global.getMongoose(),
  Q = require('q'),
  winston = require('winston');

var utils = require('mule-utils/jsonUtils'),
  GameCrud = require('./helper'),
  User = require('mule-models').User.Model,
  gameUtils = require('mule-utils/generalGameUtils');

module.exports = function getUsersGamesQ(userID) {
  return Q.promise(function (resolve, reject) {
    User.findByIdQ(userID)
      .done(function () {
        //check every game
        GameCrud.indexQ()
          .done(function (games) {
            //and make an array
            var usersGamesArray = [];

            _.each(games, function (value) {
              if (gameUtils.doesGameContainPlayerID(userID,value)) {
                usersGamesArray.push(value)
              }
            });

            resolve(usersGamesArray);
          }, reject);
      }, reject);
  });
};
