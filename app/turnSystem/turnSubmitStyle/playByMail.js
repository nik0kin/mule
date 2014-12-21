var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  GameState = require('mule-models').GameState.Model,
  History = require('mule-models').History.Model,
  bundleHooks = require('../../bundleHooks'),
  actionsHelper = require('./../actionsHelper');


exports.submitTurnQ = function (game, player, gameBoardId, turn, ruleBundle) {
  console.log('Submitting turn (playByMail) for ' + player)
  console.log(turn)

  var _historyObject, turnNumber;
  return GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      return History.findByIdQ(gameBoard.history);
    })
    .then(function (historyObject) {
      turnNumber = historyObject.currentTurn;
      // save the turn
      return historyObject.addPlayByMailPlayerTurnAndSaveQ(player, turn);
    })
    .then(function (historyObject) {
      console.log('successfully submitted turn (playByMail)');
      _historyObject = historyObject;

      // check if all turns are submitted
      return historyObject.getCanAdvancePlayByMailTurnQ();
    })
    .then(function (canAdvance) {
      if (canAdvance) {
        console.log('advancing round');
        // progress turn if they are
        return exports.progressRoundQ(game, player, _historyObject, ruleBundle);
      } else {
        console.log('all turns not in: not progressing');
      }
    })
    .then(function () {
      // return turn played
      return Q(turnNumber);
    })
    .fail(function (err) {
      console.log('submit turn fail: ');
      console.log(err);
    });
};

exports.progressRoundQ = function (game, player, historyObject, ruleBundle) {

  if (historyObject.currentRound > 1500) {
    // do nothing
    return;
  }

  var _metaData;
  // do all actions in current round (in history)
  historyObject.getRoundTurnsQ(historyObject.currentRound)
    .then(function (turns) {
      var turnObject = turns[0],
        promises = [];
      _.each(turnObject.playerTurns, function (turn, player) {
        var promise = actionsHelper.doActionsQ({
          game: game,
          history: historyObject
        }, turn.actions, player, ruleBundle);
        promises.push(promise);
      });
      return Q.all(promises);
    })
    .then(function () {
      // Call ProgressRound Hook and save metadata
      return bundleHooks.progressRoundHookQ(ruleBundle, game);
    })
    .then(function (progressRoundMetadata) {
      if (progressRoundMetadata) {
        // Not sure why I'm refetching history, (history doesnt change? in the bundle hook, so why not use historyObject) - 11/13 bundle API refactor
        return History.findByIdQ(historyObject._id)
          .then(function (fHistory) {
            return fHistory.addPlayByMailMetaAndSaveQ({
              actions:[{type: 'metadata', metadata: progressRoundMetadata}]
            });
          })
      } else {
        return Q(historyObject);
      }
    })
    .then(function (history) {
      console.log('Round successful: ' + history.currentRound);
      return history.incrementRoundQ();
    })
    .then(function () {
      return game.setTurnTimerQ();
    })
    .then(function () {
      // check win conditions
    });

};