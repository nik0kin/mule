var Q = require('q'),
  _ = require('lodash');

var multiplayerHelper = require('../../etc/multiplayerHelper'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var makeCreateXTurn = function (gameId, xPosition) {
  return {
    gameId: gameId,
    actions: [{
      type: 'DropToken',
      params: {
        xDropLocation: xPosition
      }
    }]
  };
};


exports.waitAndSubmitTurnQ = function (params) {
  var promise;
  if (params.waitTilTurn) {
    promise = Q();
  } else {
    promise = multiplayerHelper.waitForTurnQ(params);
  }
  return promise
    .then(function () {
      var newTurn = makeCreateXTurn(params.gameId, params.xPosition);
      return gameHelper.playTurnQ({agent: params.agent, turn: newTurn});
    });
};
