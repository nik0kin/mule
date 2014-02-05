/**
 * js-sdk/Games.js
 *
 * Created by niko on 2/5/14.
 */

define(function () {
  return function (contextPath) {
    var that = {};

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