/**
 * js-sdk/Games.js
 *
 * Created by niko on 2/5/14.
 */

define(['./Users'], function (Users) {
  return function (contextPath) {
    var that = {};
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

    return that;
  };
});