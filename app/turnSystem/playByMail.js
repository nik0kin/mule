var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
  actionsHelper = require('./actionsHelper');


exports.submitTurnQ = function (game, player, gameBoardId, turn) {
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
        return exports.progressRoundQ(_gameBoard, historyObject);
      } else {
        console.log('all turns not in: not progressing');
      }
    })
    .fail(function (err) {
      console.log('submit turn fail: ');
      console.log(err);
    });
};

exports.progressRoundQ = function (game, gameBoardObject, historyObject) {
  // do all actions in current round (in history)
  var turns = historyObject.getRoundTurns(historyObject.currentRound);
  var promises = [];
  _.each(turns, function (turn, player) {
    var promise = actionsHelper.doActionsQ({gameBoard: gameBoardObject, history: historyObject}, turn.actions, player);
    promises.push(promise);
  });

  return Q.all(promises)
    .then(function () {
      console.log('Round successful: ' + historyObject.currentRound);
      // increment history.currentRound
      historyObject.currentRound++;
      return historyObject.saveQ();
    })
    .then(function () {
      // check win conditions
    });

};