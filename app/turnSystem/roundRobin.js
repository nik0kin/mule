var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
  gameHelper = require('./gameHelper'),
  actionsHelper = require('./actionsHelper');


exports.submitTurnQ = function (game, player, gameBoardId, turn, ruleBundle) {
  console.log('Submitting turn (roundRobin) for ' + player)
  console.log(turn)

  var _gameBoard;
  return GameBoard.findByIdWithPopulatedStatesQ(gameBoardId)
    .then(function (gameBoard) {
      _gameBoard = gameBoard;
      return History.findByIdQ(gameBoard.history);
    })
    .then(function (historyObject) {
      if (historyObject.isPlayersTurn(player)) {
        console.log('advancing turn');
        // progress turn if they are the next player to play
        return historyObject.addPlayerTurnAndSaveQ(player, turn)
          .then(function () {
            return exports.progressTurnQ(game, player, _gameBoard, historyObject);
          });
      } else {
        console.log('Not your turn!');
        throw 'Not your turn!';
      }
    })
    .then(function (historyObject) {
      console.log('successfully submitted turn (roundRobin)');

      // check if all turns are submitted
      if (historyObject.getCanAdvancePlayByMailRound()) {
        console.log('advancing round');
        // progress turn if they are
        return exports.progressRoundQ(game, player, _gameBoard, historyObject, ruleBundle);
      } else {
        console.log('all turns not in: not progressing round count');
      }
    })
    .fail(function (err) {
      console.log('submit turn fail: ');
      console.log(err);
      throw err;
    });
};

exports.progressTurnQ = function (game, player, gameBoardObject, historyObject) {
  // do all actions for that player (in history)
  var playerTurns = historyObject.getRoundTurns(historyObject.currentRound)[player];

  var _savedHistoryObject;
  return actionsHelper.doActionsQ({gameBoard: gameBoardObject, history: historyObject}, playerTurns.actions, player)
    .then(function () {
      console.log('Turn successful for ' + player + ': ' + historyObject.currentRound);
      historyObject.progressRoundRobinPlayerTurnTicker();
      return historyObject.saveQ();
    })
    .then(function (savedHistoryObject) {
      _savedHistoryObject = savedHistoryObject;
      return gameHelper.checkWinConditionQ(game, gameBoardObject._id);
    })
    .then(function () {
      return Q(_savedHistoryObject);
    });
};

exports.progressRoundQ = function (game, player, gameBoardObject, historyObject, ruleBundle) {
  return Q()
    .then(function () {
      console.log('Round successful: ' + historyObject.currentRound);
      // increment history.currentRound
      historyObject.currentRound++;
      return historyObject.saveQ();
    })
    .then(function () {
      // check if anyone's won?
    });

};