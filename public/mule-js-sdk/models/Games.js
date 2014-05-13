/**
 * js-sdk/models/Games.js
 *
 * Created by niko on 2/5/14.
 */

define(['./Users', '../q'], function (Users, Q) {
  return function (contextPath) {
    var that = {};

    if (typeof Users != 'object')
      Users = Users(contextPath);

    that.indexQ = function () {
      return $.ajax({
        type: "GET",
        url: contextPath+"games"
      });
    };

    that.createQ = function (params) {
      return $.ajax({
        type: "POST",
        url: contextPath+"games",
        data: params
      });
    };

    that.readQ = function (gameID) {
      return $.ajax({
        type: "GET",
        url: contextPath+"games/" + gameID
      });
    };

    that.readUsersGamesQ = function (userID) {
      return $.ajax({
        type: "GET",
        url: contextPath+"users/" + userID + '/games'
      });
    };

    that.readMyGamesQ = function () {
      return that.readUsersGamesQ(Users.getLoggedInUserID());
    };

    ////// GAME SERVICES //////

    that.joinGameQ = function (gameID) {
      return $.ajax({
        type: "POST",
        url: contextPath+"games/" + gameID + '/join'
      });
    };

    ///// other //////

    that.getPlayersMapQ = function (game) {
      var map = _.clone(game.players),
        promiseArray = [];

      _.each(map, function (player, relId) {
        promiseArray.push(Users.readCacheQ(player.playerID)
          .then(function (user) {
            map[relId].name = user.username;
          })
        );
      });

      return Q.all(promiseArray)
        .then(function () {
          return Q(map);
        });
    };

    return that;
  };
});