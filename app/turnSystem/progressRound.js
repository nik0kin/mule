
var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
  BasicMoveAction = require('./basicMoveAction');

module.exports = function progressRoundQ(gameBoard) {
  // do all actions in current round (in history)
  return History.findByIdQ(gameBoard.history)
    .then(function (history) {
      var turns = history.getRoundTurns(history.currentRound);
      var promises = [];
      _.each(turns, function (turn, player) {
        _.each(turn.actions, function (action, key) {
          var promise = BasicMoveAction.doMoveActionToGameBoardStateQ(gameBoard, action)
            .then(function () {
              console.log('R' + history.currentRound + ' - ' + player + ': success action #' + key);
            })
            .fail(function (err) {
              console.log('R' + history.currentRound + ' - ' + player + ': error action #' + key);
              console.log(err);
            });
          promises.push(promise);

        });
      });

      return Q.all(promises)
        .then(function () {
          console.log('incremenetin')
          // increment history.currentRound
          history.currentRound++;
          return history.saveQ();
        });
    })
    .then(function () {
      // check if anyone's won?

    });

};