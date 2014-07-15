/**
 * js-sdk/models/Historys.js
 *
 */

define([], function () {
  return function (contextPath) {
    var that = {};

    that.indexQ = function () {
      return $.ajax({
        type: "GET",
        url: contextPath+"historys"
      });
    };

    that.readQ = function (gameStateId) {
      return $.ajax({
        type: "GET",
        url: contextPath+"gameStates/" + gameStateId
      })
    };

    that.readGamesStateQ = function (gameId) {
      return $.ajax({
        type: "GET",
        url: contextPath+"games/" + gameId + '/state'
      });
    };

    return that;
  };
});