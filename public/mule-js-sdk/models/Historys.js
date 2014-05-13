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

    that.readQ = function (gameBoardID) {
      return $.ajax({
        type: "GET",
        url: contextPath+"historys/" + gameBoardID
      })
    };

    that.readGamesHistoryQ = function (gameID) {
      return $.ajax({
        type: "GET",
        url: contextPath+"games/" + gameID + '/history'
      });
    };

    return that;
  };
});