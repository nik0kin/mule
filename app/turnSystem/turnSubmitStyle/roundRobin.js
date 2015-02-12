var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  History = require('mule-models').History.Model,
  Logger = require('mule-utils').logging,
  gameHelper = require('./../gameHelper'),
  actionsHelper = require('./../actionsHelper'),
  bundleHooks = require('../../bundleHooks'),
  brain = require('./../brain');


exports.submitTurnQ = function (game, player, gameBoardId, turn, ruleBundle) {
  Logger.log('Submitting turn (roundRobin) for ' + player, game._id, turn);

  var gso, turnNumber;
  return brain.loadGameStateObjectQ(game)
    .then(function (gameStateObject) {
      gso = gameStateObject;

      turnNumber = gso.history.currentTurn;
      if (gso.history.isPlayersTurn(player)) {
        Logger.log('advancing turn', game._id);
        // progress turn if they are the next player to play
        return gso.history.addRoundRobinPlayerTurnAndSaveQ(player, turn)
          .then(function () {
            return exports.progressTurnQ(gso, player);
          });
      } else {
        Logger.err('Not your turn!', game._id);
        throw 'Not your turn!';
      }
    })
    .then(function (historyObject) {
      Logger.log('successfully submitted turn (roundRobin)', game._id);
      gso.history = historyObject;
      // check if all turns are submitted
      return gso.history.getCanAdvanceRoundRobinTurnQ();
    })
    .then(function (canAdvance) {
      if (canAdvance) {
        Logger.log('advancing round', game._id);
        // progress turn if they are
        return exports.progressRoundQ(gso, player);
      } else {
        Logger.log('all turns not in: not progressing round count', game._id);
      }
    })
    .then(function () {
      return Q(turnNumber);
    })
    .fail(function (err) {
      Logger.log('roundrobin submit turn fail: ', game._id, err);
      throw err;
    });
};

exports.progressTurnQ = function (gso, player) {
  Logger.log('roundrobin progressTurn:', gso.game._id);
  var _savedHistoryObject;

  // do all actions for that player (in history)
  return gso.history.getRoundTurnsQ(gso.history.currentRound)
    .then(function (roundTurns) { // EFF should it use roundturns here?
      var playerOrder = gso.history.getPlayersOrderNumber(player);
      var playerTurn = roundTurns[playerOrder].playerTurns[player];
      return actionsHelper.doActionsQ({
          game: gso.game,
          history: gso.history
      }, playerTurn.actions, player, gso.ruleBundle)
        .fail(function (err) {
          throw 'doActionsQ fail: ' + JSON.stringify(err);
        });
    })
    .then(function () {
      Logger.log('Turn successful for ' + player + ': ' + gso.history.currentRound, gso.game._id);
      gso.history.progressRoundRobinPlayerTurnTicker();
      return gso.history.saveQ();
    })
    .then(function (savedHistoryObject) {
      _savedHistoryObject = savedHistoryObject;

      Logger.log('bundleProgressTurnQ: ' + gso.ruleBundle.name, gso.game._id);
      var metaData;
      // TODO this really needs to go before "Turn successful"
      return bundleHooks.progressTurnHookQ(gso)
        .then(function (metaData) {
          if (metaData) {
            _metaData = metaData;
            return History.findByIdQ(gso.history._id)
              .then(function (fHistory) {
                //TODO where should progressTurn's meta data go? (in players actions?)
                return fHistory.addRoundRobinMetaAndSaveQ({actions:[{type: 'metadata', metadata: _metaData}] });
              });
          } else {
            return History.findByIdQ(gso.history._id)
              .then(function (fHistory) {
                fHistory.currentTurn++;
                return fHistory.saveQ();
              });
          }
        });
    })
    .then(function () {
      return gameHelper.checkWinConditionQ(gso);
    })
    .then(function (savedHistoryObject) {
      if (savedHistoryObject) {
        // savedHistoryObject will exist if checkWinCondition had a wincondition and it resaved its History and Game objects
        _savedHistoryObject = savedHistoryObject;
      }

      return gso.game.setTurnTimerQ();
    })
    .then(function () {
      return Q(_savedHistoryObject);
    })
    .fail(function (err) {
      Logger.err('err in roundRobin.progressTurn', gso.game._id, err);
      throw 'err in roundRobin.progressTurn ' + JSON.stringify(err);
    });
};

exports.progressRoundQ = function (gso, player) {
  return Q()
    .then(function () {
      Logger.log('Round successful: ' + gso.history.currentRound, gso.game._id);
      return gso.history.incrementRoundQ();
    })
    .then(function () {
      // check if anyone's won?
      //   - only if theres a round end check opposed to a turn end check
    });

};
