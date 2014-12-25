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

    that.readQ = function (gameId) {
      return $.ajax({
        type: "GET",
        url: contextPath+"games/" + gameId
      });
    };

    that.readUsersGamesQ = function (userId) {
      return $.ajax({
        type: "GET",
        url: contextPath+"users/" + userId + '/games'
      });
    };

    that.readMyGamesQ = function () {
      return that.readUsersGamesQ(Users.getLoggedInUserId());
    };

    ////// GAME SERVICES //////

    that.joinGameQ = function (gameId) {
      return $.ajax({
        type: "POST",
        url: contextPath+"games/" + gameId + '/join'
      });
    };

    ///// other //////

    that.getPlayersMapQ = function (game) {
      var map = _.clone(game.players),
        promiseArray = [];

      _.each(map, function (player, playerRel) {
        promiseArray.push(Users.readCacheQ(player.playerId)
          .then(function (user) {
            map[playerRel].name = user.username;
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