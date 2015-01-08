var _ = require('lodash'),
  Q = require('q');

var Game = require('mule-models').Game.Model,
  Logger = require('mule-utils').logging,
  turnBrain = require('../brain');

var MS_PER_SEC = 1000;

var timeoutId, firstLoad = true, minTimerCheck;

exports.initTurnTimerChecks = function (minimumTimerCheck) {
  minimumTimerCheck = minimumTimerCheck || minTimerCheck;

  if (firstLoad) {
    firstLoad = false;
    minTimerCheck = minimumTimerCheck;
    return exports.checkForExpiredTurns();
  }
  timeoutId = setTimeout(exports.checkForExpiredTurns, minimumTimerCheck * MS_PER_SEC);
};

exports.checkForExpiredTurns = function () {
  Game.findQ({nextTurnTime: {$lte: new Date()}})
    .then(function (result) {
      Logger.log('Checking for expired games');

      var promiseArray = [];
      _.each(result, function (game) {
        if (game.turnProgressStyle === 'autoprogress') {
          promiseArray.push(turnBrain.forceTurnProgress(game));
        }
      });
      Logger.log('Expired game count: ' + promiseArray.length);
      return Q.all(promiseArray);
    })
    .done(function () {
      exports.initTurnTimerChecks();
    });
};
