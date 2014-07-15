var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  GameState = require('mule-models').GameState.Model,
  History = require('mule-models').History.Model,
  MuleRules = require('mule-rules'),
  actionsHelper = require('./../actionsHelper'),
  brain = require('./../brain');


exports.submitTurnQ = function (game, player, gameBoardId, turn, ruleBundle) {
  console.log('Submitting turn (playByMail) for ' + player)
  console.log(turn)

  var _gameBoard, _gameState;
  return GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      _gameBoard = gameBoard;
      return GameState.findByIdQ(gameBoard.gameState);
    })
    .then(function (foundGameState) {
      _gameState = foundGameState;
      return History.findByIdQ(_gameBoard.history);
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
        return exports.progressRoundQ(game, player, _gameBoard, _gameState, historyObject, ruleBundle);
      } else {
        console.log('all turns not in: not progressing');
      }
    })
    .fail(function (err) {
      console.log('submit turn fail: ');
      console.log(err);
    });
};

exports.progressRoundQ = function (game, player, gameBoardObject, gameStateObject, historyObject, ruleBundle) {

  if (historyObject.currentRound > 1000) {
    // do nothing
    return;
  }

  // do all actions in current round (in history)
  var turns = historyObject.getRoundTurns(historyObject.currentRound);
  var promises = [], _metaData;
  _.each(turns, function (turn, player) {
    if (player !== 'meta') {
      var promise = actionsHelper.doActionsQ({gameState: gameStateObject, gameBoard: gameBoardObject, history: historyObject}, turn.actions, player, ruleBundle);
      promises.push(promise);
    }
  });

  return Q.all(promises)
    .then(function () {
      var bundleCode = MuleRules.getBundleCode(ruleBundle.name),
        bundleProgressRoundQ;
      if (bundleCode && typeof (bundleProgressRoundQ = bundleCode.progressRound) === 'function') {
        return brain.loadGameStateObjectQ(game)
          .then(function (result) {
            console.log('calling bundleProgreesQ');
            actionsHelper.initActions(game.ruleBundle);
            return bundleProgressRoundQ(GameState, result)
              .then(function (metaData) {
                _metaData = metaData;
                return History.findByIdQ(result.history._id);
              })
              .then(function (fHistory) {
                return fHistory.addPlayerTurnAndSaveQ('meta', {actions:[{type: 'metadata', metadata: _metaData}] });
              });
          });
      } else {
        return Q(historyObject);
      }
    })
    .then(function (history) {
      console.log('Round successful: ' + history.currentRound);
      // increment history.currentRound
      history.currentRound++;
      return history.saveQ();
    })
    .then(function () {
      return game.setTurnTimerQ();
    })
    .then(function () {
      // check win conditions
    });

};