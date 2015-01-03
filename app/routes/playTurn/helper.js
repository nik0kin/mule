var _ = require('lodash'),
  Q = require('q');

var turnBrain = require('../../turnSystem/brain'),
  actionsHelper = require('../../turnSystem/actionsHelper'),
  RuleBundle = require('mule-models').RuleBundle.Model,
  Game = require('mule-models').Game.Model;

exports.playTurnQ = function (gameId, playerRel, userId, actions) {
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
      console.log('user: ' + playerRel + ' -> ' + playerRelId);

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
      console.log('submitting turn (' + _ruleBundle.turnSubmitStyle + ')');
      return turnBrain.submitPlayerTurnQ(_game, playerRelId, _game.gameBoard, validatedActions, _ruleBundle);
    })
    .then(function (turnNumber) {
      console.log('p[' + playerRelId + '] justed submitted turn: ' + turnNumber);
      return {msg: "Success", turnNumber: turnNumber};
    });
};
