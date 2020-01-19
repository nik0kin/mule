var _ = require('lodash'),
  Q = require('q');

var Game = require('mule-models').Game.Model,
  GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
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
  Game.findQ({ nextTurnTime: { $lte: new Date() } })
    .then(function (result) {
      Logger.log('Checking for expired games');

      var promiseArray = [];
      _.each(result, function (game) {
        if (game.gameStatus === 'finished') return;

        if (game.turnProgressStyle === 'autoprogress') {
          promiseArray.push(
            getTurnToForceQ(game)
              .then(function (turnNumberToForce) {
                return turnBrain.forceTurnProgress(game, turnNumberToForce);
              }, function (error) {
                Logger.err('Something went wrong when forcing turn progress for game id=' + game._id, game._id, error);
              })
          );
        }
      });
      Logger.log('Expired game count: ' + promiseArray.length);
      return Q.all(promiseArray);
    })
    .done(function () {
      exports.initTurnTimerChecks();
    });
};

function getTurnToForceQ(game) {
  return Q.promise(function (resolve, reject) {
    GameBoard.
      find({ _id: game.gameBoard }).
      select('history').
      exec(function (err, partialGameBoard) {
        if (err) {
          return reject(err);
        }
        History.
          find({ _id: partialGameBoard[0].history }).
          select('currentTurn').
          exec(function (err, partialHistory) {
            if (err) {
              return reject(err);
            }
            resolve(partialHistory[0].currentTurn);
          })
      })
  });
}
