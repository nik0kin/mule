/**
 * js-sdk/models/Historys.js
 *
 */

define([], function () {
  return function (contextPath) {
    var that = {};

    that.readQ = function (turnId) {
      return $.ajax({
        type: "GET",
        url: contextPath+"turns/" + turnId
      })
    };

    that.readGamesTurnQ = function (gameId, turnNumber) {
      return $.ajax({
        type: "GET",
        url: contextPath+"games/" + gameId + '/history/' + turnNumber
      });
    };

    return that;
  };
});