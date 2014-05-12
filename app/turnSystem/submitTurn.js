
var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
  progressRoundQ = require('./progressRound');


module.exports = function submitTurnQ(player, gameBoardId, turn) {
  console.log('in submiting for ' + player)
  console.log(turn)

  var _gameBoard;
  return GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      return gameBoard.populateQ('spaces');
    })
    .then(function (gameBoard) {
      return gameBoard.populateQ('pieces');
    })
    .then(function (gameBoard) {
      _gameBoard = gameBoard;
      return History.findByIdQ(gameBoard.history);
    })
    .then(function (historyObject) {
      // save the turn
      return historyObject.addPlayerTurnAndSaveQ(player, turn);
    })
    .then(function (historyObject) {
      console.log('successfully submited turn');

      // check if all turns are submitted
      if (historyObject.getCanAdvanceTurn()) {
        console.log('advancing round');
        // progress turn if they are
        return progressRoundQ(_gameBoard);
      } else {
        console.log('all turns not in: not progressing');
      }
    })
    .fail(function (err) {
      console.log('submit turn fail: ');
      console.log(err);
    });
};