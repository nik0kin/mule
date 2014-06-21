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

    /////////// hacky way for turns read by client

    var turnsRead;

    that.markAllTurnsRead = function (history) {
      turnsRead = {};
      _.each(history.turns, function (playerTurns, player) {
        turnsRead[player] = [];
        _.each(playerTurns, function (turn) {
          turnsRead[player].push(true);
        });
      });
      console.log(turnsRead);
    };

    that.getLastUnreadTurn = function (history) {
      var _turn = false;

      _.each(history.turnOrder, function (value) {
        if (_turn || value === 'meta') return;

        var lastTurnNumber = turnsRead[value].length;
        console.log('las ' + lastTurnNumber)
        if (history.turns[value][lastTurnNumber]) {
          _turn = history.turns[value][lastTurnNumber];
          turnsRead[value].push(true);
          console.log('read ' + value + '\'s turn: ' + lastTurnNumber)
        }

      });

      return _turn;
    };

    that.getLastRoundMeta = function (history) {
      return history.turns['meta'][history.currentRound - 2];
    };

    return that;
  };
});