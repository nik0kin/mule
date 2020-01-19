var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
  Logger = require('mule-utils').logging,
  config = require('../../../config'),
  bundleHooks = require('../../bundleHooks'),
  gameHelper = require('../gameHelper'),
  actionsHelper = require('../actionsHelper');


exports.submitTurnQ = function (game, player, gameBoardId, turn, ruleBundle) {
  Logger.log('Submitting turn (playByMail) for ' + player, game._id, turn);

  var _historyObject, turnNumber;
  return GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      return History.findByIdQ(gameBoard.history);
    })
    .then(function (historyObject) {
      turnNumber = historyObject.currentRound;
      // save the turn
      return historyObject.addPlayByMailPlayerTurnAndSaveQ(player, turn);
    })
    .then(function (historyObject) {
      Logger.log('successfully submitted turn (playByMail)', game._id);
      _historyObject = historyObject;

      // check if all turns are submitted
      return historyObject.getCanAdvancePlayByMailTurnQ();
    })
    .then(function (canAdvance) {
      if (canAdvance) {
        Logger.log('advancing round', game._id);
        // progress turn if they are
        return exports.progressRoundQ(game, player, _historyObject, ruleBundle);
      } else {
        Logger.log('all turns not in: not progressing', game._id);
      }
    })
    .then(function () {
      // return turn played
      return Q(turnNumber);
    })
    .fail(function (err) {
      Logger.log('playByMail submit turn fail: ', game._id, err);
      throw err;
    });
};

exports.progressRoundQ = function (game, player, historyObject, ruleBundle) {
  var muleConfig = config.getConfig();
  var maxAllowedPlayByMailRounds = muleConfig.mule.maxAllowedPlayByMailRounds || 1500;

  if (historyObject.currentRound > maxAllowedPlayByMailRounds) {
    // do nothing
    return;
  }

  var _metaData;
  // do all actions in current round (in history)
  return historyObject.getRoundTurnsQ(historyObject.currentRound)
    .then(function (turns) {
      Logger.log('Starting PlayByMail Round: ' + historyObject.currentRound, game._id);

      var turnObject = turns[0],
        promises = [];
      _.each(turnObject.playerTurns, function (turn, player) {
        var promise = function () {
          return actionsHelper.doActionsQ({
            game: game,
            history: historyObject
          }, turn.actions, player, ruleBundle);
        };
        promises.push(promise);
      });
      return runPromisesSequentially(promises);
    })
    .then(function () {
      Logger.log('All Actions Complete - PlayByMail Round: ' + historyObject.currentRound, game._id);

      // Call ProgressRound Hook and save metadata
      return bundleHooks.progressRoundHookQ(ruleBundle, game);
    })
    .then(function (progressRoundMetadata) {
      if (progressRoundMetadata) {
        // Not sure why I'm refetching history, (history doesnt change? in the bundle hook, so why not use historyObject) - 11/13 bundle API refactor
        return History.findByIdQ(historyObject._id)
          .then(function (fHistory) {
            return fHistory.addPlayByMailMetaAndSaveQ({
              actions: [{ type: 'metadata', metadata: progressRoundMetadata }]
            });
          });
      } else {
        return Q(historyObject);
      }
    })
    .then(function (history) {
      Logger.log('Round successful: ' + history.currentRound, game._id);
      return history.incrementRoundQ();
    })
    .then(function (savedHistory) {
      return gameHelper.checkWinConditionQ({ game: game, history: savedHistory, ruleBundle: ruleBundle });
    })
    .then(function () {
      return game.setTurnTimerQ();
    });

};

function runPromisesSequentially(promiseArray) {
  return promiseArray.reduce(Q.when, Q());
}
