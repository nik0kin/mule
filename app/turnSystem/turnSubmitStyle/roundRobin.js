var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
  MuleRules = require('mule-rules'),
  gameHelper = require('./../gameHelper'),
  actionsHelper = require('./../actionsHelper'),
  brain = require('./../brain');


exports.submitTurnQ = function (game, player, gameBoardId, turn, ruleBundle) {
  console.log('Submitting turn (roundRobin) for ' + player)
  console.log(turn)

  var _gameBoard, _historyObject, turnNumber;
  return GameBoard.findByIdWithPopulatedStatesQ(gameBoardId)
    .then(function (gameBoard) {
      _gameBoard = gameBoard;
      return History.findByIdQ(gameBoard.history);
    })
    .then(function (historyObject) {
      turnNumber = historyObject.currentTurn;
      if (historyObject.isPlayersTurn(player)) {
        console.log('advancing turn');
        // progress turn if they are the next player to play
        return historyObject.addRoundRobinPlayerTurnAndSaveQ(player, turn)
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
      _historyObject = historyObject;

      // check if all turns are submitted
      return historyObject.getCanAdvancePlayByMailTurnQ();
    })
    .then(function (canAdvance) {
      if (canAdvance) {
        console.log('advancing round');
        // progress turn if they are
        return exports.progressRoundQ(game, player, _gameBoard, _historyObject, ruleBundle);
      } else {
        console.log('all turns not in: not progressing round count');
      }
    })
    .then(function () {
      return Q(turnNumber);
    })
    .fail(function (err) {
      console.log('roundrobin submit turn fail: ');
      console.log(err);
      throw err;
    });
};

exports.progressTurnQ = function (game, player, gameBoardObject, historyObject) {
  console.log('roundrobin progressTurn:')

  var _savedHistoryObject;

  // do all actions for that player (in history)
  historyObject.getRoundTurnsQ(historyObject.currentRound)
    .then(function (roundTurns) {
      var playerTurns = roundTurns[player];
      return actionsHelper.doActionsQ({
        gameBoard: gameBoardObject,
        history: historyObject
      }, playerTurns.actions, player, game.ruleBundle);
    })
    .then(function () {
      console.log('Turn successful for ' + player + ': ' + historyObject.currentRound);
      historyObject.progressRoundRobinPlayerTurnTicker();
      return historyObject.saveQ();
    })
    .then(function (savedHistoryObject) {
      _savedHistoryObject = savedHistoryObject;

      console.log('bundleProgressTurnQ')
      console.log(game.ruleBundle)
      var bundleCode = MuleRules.getBundleCode(game.ruleBundle.name),
        bundleProgressTurnQ,
        _metaData;
      if (bundleCode && typeof (bundleProgressTurnQ = bundleCode.progressTurn) === 'function') {
        return brain.loadGameStateObjectQ(game)
          .then(function (result) {
            console.log('calling bundleProgressTurnQ');
            actionsHelper.initActions(game.ruleBundle);
            return bundleProgressTurnQ(GameBoard, result)
              .then(function (metaData) {
                _metaData = metaData;
                return History.findByIdQ(result.history._id);
              })
              .then(function (fHistory) {
                //TODO where should progressTurn's meta data go? (in players actions?)
                return fHistory.addRoundRobinMetaAndSaveQ({actions:[{type: 'metadata', metadata: _metaData}] });
              });
          });
      } else {
        return Q(historyObject);
      }
    })
    .then(function () {
      return gameHelper.checkWinConditionQ(game, gameBoardObject._id);
    })
    .then(function () {
      return game.setTurnTimerQ();
    })
    .then(function () {
      return Q(_savedHistoryObject);
    })
    .fail(function (err) {
      console.log('err in roundRobin.progressTurn');
      console.log(err);
    });
};

exports.progressRoundQ = function (game, player, gameBoardObject, gameStateObject, historyObject, ruleBundle) {
  return Q()
    .then(function () {
      console.log('Round successful: ' + historyObject.currentRound);
      return historyObject.incrementRoundQ();
    })
    .then(function () {
      // check if anyone's won?
    });

};