var _ = require('lodash'),
  Q = require('q');

var Game = require('mule-models').Game.Model,
  turnBrain = require('../brain');

var MIN_TIMER_CHECK = 10, //seconds
  MS_PER_SEC = 1000;

var timeoutId, firstLoad = true;

exports.initTurnTimerChecks = function () {
  if (firstLoad) {
    firstLoad = false;
    return exports.checkForExpiredTurns();
  }
  timeoutId = setTimeout(exports.checkForExpiredTurns, MIN_TIMER_CHECK * MS_PER_SEC)
};

exports.checkForExpiredTurns = function () {
  Game.findQ({nextTurnTime: {$lte: new Date()}})
    .then(function (result) {
      console.log('checking for expired games');

      var promiseArray = [];
      _.each(result, function (game) {
        if (game.turnProgressStyle === 'autoprogress')
          promiseArray.push(turnBrain.forceTurnProgress(game));
      });
      console.log('amt: ' + promiseArray.length);
      return Q.all(promiseArray);
    })
    .done(function () {
      exports.initTurnTimerChecks();
    });
};