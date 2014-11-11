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

  var gso, turnNumber;
  return brain.loadGameStateObjectQ(game)
    .then(function (gameStateObject) {
      gso = gameStateObject;

      turnNumber = gso.history.currentTurn;
      if (gso.history.isPlayersTurn(player)) {
        console.log('advancing turn');
        // progress turn if they are the next player to play
        return gso.history.addRoundRobinPlayerTurnAndSaveQ(player, turn)
          .then(function () {
            return exports.progressTurnQ(gso, player);
          });
      } else {
        console.log('Not your turn!');
        throw 'Not your turn!';
      }
    })
    .then(function (historyObject) {
      console.log('successfully submitted turn (roundRobin)');
      gso.history = historyObject;

      // check if all turns are submitted
      return gso.history.getCanAdvanceRoundRobinTurnQ();
    })
    .then(function (canAdvance) {
      if (canAdvance) {
        console.log('advancing round');
        // progress turn if they are
        return exports.progressRoundQ(gso, player);
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

exports.progressTurnQ = function (gso, player) {
  console.log('roundrobin progressTurn:');
  var _savedHistoryObject;

  // do all actions for that player (in history)
  return gso.history.getRoundTurnsQ(gso.history.currentRound)
    .then(function (roundTurns) { // EFF should it use roundturns here?
      var playerOrder = gso.history.getPlayersOrderNumber(player);
      var playerTurn = roundTurns[playerOrder].playerTurns[player];
      return actionsHelper.doActionsQ({
          gameState: gso.gameState,
          gameBoard: gso.gameBoard,
          history: gso.history
      }, playerTurn.actions, player, gso.ruleBundle)
        .fail(function (err) {
          throw 'doActionsQ fail: ' + JSON.stringify(err);
        });
    })
    .then(function () {
      console.log('Turn successful for ' + player + ': ' + gso.history.currentRound);
      gso.history.progressRoundRobinPlayerTurnTicker();
      return gso.history.saveQ();
    })
    .then(function (savedHistoryObject) {
      _savedHistoryObject = savedHistoryObject;

      console.log('bundleProgressTurnQ: ' + gso.ruleBundle.name);
      var bundleCode = MuleRules.getBundleCode(gso.ruleBundle.name),
        bundleProgressTurnQ,
        _metaData;
      if (bundleCode && typeof (bundleProgressTurnQ = bundleCode.progressTurn) === 'function') {
        console.log('calling bundleProgressTurnQ');
        actionsHelper.initActions(gso.ruleBundle);
        return bundleProgressTurnQ(GameBoard, gso)
          .then(function (metaData) {
            _metaData = metaData;
            return History.findByIdQ(gso.history._id);
          })
          .then(function (fHistory) {
            //TODO where should progressTurn's meta data go? (in players actions?)
            return fHistory.addRoundRobinMetaAndSaveQ({actions:[{type: 'metadata', metadata: _metaData}] });
          });
      } else {
        return Q(historyObject);
      }
    })
    .then(function () {
      return gameHelper.checkWinConditionQ(gso);
    })
    .then(function () {
      return gso.game.setTurnTimerQ();
    })
    .then(function () {
      return Q(_savedHistoryObject);
    })
    .fail(function (err) {
      console.log('err in roundRobin.progressTurn');
      console.log(err);
    });
};

exports.progressRoundQ = function (gso, player) {
  return Q()
    .then(function () {
      console.log('Round successful: ' + gso.history.currentRound);
      return gso.history.incrementRoundQ();
    })
    .then(function () {
      // check if anyone's won?
      //   - only if theres a round end check opposed to a turn end check
    });

};