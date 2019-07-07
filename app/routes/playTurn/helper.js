var _ = require('lodash');

var turnBrain = require('../../turnSystem/brain'),
  addJob = require('../../jobQueue').addJob,
  Logger = require('mule-utils').logging,
  actionsHelper = require('../../turnSystem/actionsHelper'),
  RuleBundle = require('mule-models').RuleBundle.Model,
  Game = require('mule-models').Game.Model;

exports.playTurnQ = function (gameId, playerRel, userId, actions) {
  return addJob(gameId, function() {
    return playTurnJob(gameId, playerRel, userId, actions);
  });
}

function playTurnJob(gameId, playerRel, userId, actions) {
  var _game,
    _ruleBundle,
    playerRelId;

  if (!gameId) {
    throw {err: 'MISSING GAME ID'};
  }

  if (!_.isArray(actions)) {
    throw {err: 'MISSING ACTIONS ARRAY'};
  }

  return Game.findByIdQ(gameId)
    .then (function (game) {
      if (!game) {
        throw {err: 'INVALID GAME ID'};
      } else if (game.gameStatus !== 'inProgress') {
        throw {err: 'GAME NOT IN PROGRESS'};
      }
      _game = game;
    })
    .then(function () {
      playerRelId = playerRel || _game.getPlayerPosition(userId);
      Logger.log('playTurn: user: ' + playerRel + ' -> ' + playerRelId, gameId);

      if (playerRelId === -1) {
        throw {status: 403, err: 'INVALID PLAYER'};
      }

      return RuleBundle.findByIdQ(_game.ruleBundle.id);
    })
    .then(function (ruleBundle) {
      _ruleBundle = ruleBundle;
      return actionsHelper.validateActionsQ(_game._id, _ruleBundle, playerRelId, actions);
    })
    .then(function (validatedActions) {
      Logger.log('submitting turn (' + _ruleBundle.turnSubmitStyle + ')', gameId);
      return turnBrain.submitPlayerTurnQ(_game, playerRelId, _game.gameBoard, validatedActions, _ruleBundle);
    })
    .then(function (turnNumber) {
      Logger.log('p[' + playerRelId + '] justed submitted turn: ' + turnNumber, gameId);
      return {msg: "Success", turnNumber: turnNumber};
    });
};
