var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
  BasicMoveAction = require('./basicMoveAction');


exports.submitTurnQ = function (player, gameBoardId, turn) {
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
            return exports.progressTurnQ(_gameBoard, historyObject, player);
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
        return exports.progressRoundQ(_gameBoard, historyObject);
      } else {
        console.log('all turns not in: not progressing');
      }
    })
    .fail(function (err) {
      console.log('submit turn fail: ');
      console.log(err);
      throw err;
    });
};

exports.progressTurnQ = function (gameBoardObject, historyObject, player) {
  // do all actions for that player (in history)
  var playerTurns = historyObject.getRoundTurns(historyObject.currentRound)[player];
  var promises = [];

  _.each(playerTurns.actions, function (action, key) {
    var promise = BasicMoveAction.doMoveActionToGameBoardStateQ(gameBoardObject, action)
      .then(function () {
        console.log('R' + historyObject.currentRound + ' - ' + player + ': success action #' + key);
      })
      .fail(function (err) {
        console.log('R' + historyObject.currentRound + ' - ' + player + ': error action #' + key);
        console.log(err);
      });
    promises.push(promise);
  });

  return Q.all(promises)
    .then(function () {
      console.log('Turn successful for ' + player + ': ' + historyObject.currentRound);
      historyObject.progressRoundRobinPlayerTurnTicker();
      return historyObject.saveQ();
    });
    /*.then(function () {
      // check if anyone's won?
    });*/
};

exports.progressRoundQ = function (gameBoardObject, historyObject) {
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