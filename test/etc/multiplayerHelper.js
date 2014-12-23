var _ = require('lodash'),
  Q = require('q');

var gameHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var waitForTurnQ = function (params) {
  var agent = params.agent,
    gameId = params.gameId,
    waitTilTurn = params.waitTilTurn;

  if (!waitTilTurn) {
    return Q();
  }

  var restartQ = function () {
    return gameHelper.sendRestRequest({
      agent: agent,
      endpoint: '/games/' + gameId + '/history/' + waitTilTurn,
      verb: 'get'
    })
    .then(function (turnXResult) {
      if (_.isEmpty(turnXResult)) {
        process.stdout.write('.');
        return restartQ();
      } else {
        return Q(turnXResult);
      }
    })
    .fail(function () {
      return restartQ();
    })
  };
  return restartQ();
};

exports.waitForTurnQ = waitForTurnQ;
