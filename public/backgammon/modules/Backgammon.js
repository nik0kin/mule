
define([], function () {
  return function (gameState, boardDisplayObject) {
    var that = {},
      currentGameState = gameState;

    that.clickSpace = function (space) {
      console.log('clicked space: ' + space);
    };

    that.parseTurn = function (turn) {
      console.log('new turn: ' + turn);
    }

    return that;
  };
});