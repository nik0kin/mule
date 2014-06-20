var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
  MuleRules = require('mule-rules'),
  actionsHelper = require('./../actionsHelper'),
  brain = require('./../brain');


exports.submitTurnQ = function (game, player, gameBoardId, turn, ruleBundle) {
  console.log('Submitting turn (playByMail) for ' + player)
  console.log(turn)

  var _gameBoard;
  return GameBoard.findByIdWithPopulatedStatesQ(gameBoardId)
    .then(function (gameBoard) {
      _gameBoard = gameBoard;
      return History.findByIdQ(gameBoard.history);
    })
    .then(function (historyObject) {
      // save the turn
      return historyObject.addPlayerTurnAndSaveQ(player, turn);
    })
    .then(function (historyObject) {
      console.log('successfully submitted turn (playByMail)');

      // check if all turns are submitted
      if (historyObject.getCanAdvancePlayByMailRound()) {
        console.log('advancing round');
        // progress turn if they are
        return exports.progressRoundQ(game, player, _gameBoard, historyObject, ruleBundle);
      } else {
        console.log('all turns not in: not progressing');
      }
    })
    .fail(function (err) {
      console.log('submit turn fail: ');
      console.log(err);
    });
};

exports.progressRoundQ = function (game, player, gameBoardObject, historyObject, ruleBundle) {
  // do all actions in current round (in history)
  var turns = historyObject.getRoundTurns(historyObject.currentRound);
  var promises = [];
  _.each(turns, function (turn, player) {
    var promise = actionsHelper.doActionsQ({gameBoard: gameBoardObject, history: historyObject}, turn.actions, player, ruleBundle);
    promises.push(promise);
  });

  return Q.all(promises)
    .then(function () {
      var bundleProgressRoundQ = MuleRules.getBundleCode(ruleBundle.name).progressRound;
      if (typeof bundleProgressRoundQ === 'function')
        return brain.loadGameStateObjectQ(game)
          .then(function (result) {
            console.log('calling bundleProgreesQ');
            return bundleProgressRoundQ(result);
          });
    })
    .then(function () {
      console.log('Round successful: ' + historyObject.currentRound);
      // increment history.currentRound
      historyObject.currentRound++;
      return historyObject.saveQ();
    })
    .then(function () {
      return game.setTurnTimerQ();
    })
    .then(function () {
      // check win conditions
    });

};