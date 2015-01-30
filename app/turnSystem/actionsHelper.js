var _ = require('lodash'),
  Q = require('q');

var bundleHooks = require('../bundleHooks'),
  Logger = require('mule-utils').logging,
  GameBoard = require('mule-models').GameBoard.Model,
  GameState = require('mule-models').GameState.Model,
  PieceState = require('mule-models').PieceState.Model;

var getAction = function (actionType, ruleBundle) {
  return bundleHooks.getActions(ruleBundle.name)[actionType];
};

exports.validateActionsQ = function (gameId, ruleBundle, playerRel, actions) {
  var promiseArray = [],
      _gameStateId;
  _.each(actions, function (action, key) {
    var Action = getAction(action.type, ruleBundle);
    if (!Action) {
      var errorStr = 'Action does not exist: ' + action.type;
      Logger.err(errorStr, gameId);
      throw errorStr;
    }

    var promise = bundleHooks.actionValidateQ(Action, gameId, playerRel, action.params)
      .then(function () {
        Logger.log('valid move action ' + key + ': ', gameId, action.params);
      })
      .fail(function (err) {
        Logger.err('invalid action: ' + key, gameId, err);
        throw 'action ' + key + ': ' + err;
      });

    promiseArray.push(promise);
  });

  return Q.all(promiseArray)
    .then(function () {
      return bundleHooks.validateTurnHookQ(gameId, ruleBundle, playerRel, actions);
    });
};

exports.doActionsQ = function (objs, actions, playerRel, ruleBundle) {
  var promiseArray = [];

  _.each(actions, function (action, actionKey) {
    var Action = getAction(action.type, ruleBundle);
    var promise = bundleHooks.actionDoQ(Action, objs.game._id, playerRel, action.params)
      .then(function (resultActionMetaData) {
        Logger.log('Round:' + objs.history.currentRound + ' - ' + playerRel + ': success action #' + actionKey, objs.game._id);

        if (resultActionMetaData) {
          return objs.history.saveMetaDataToActionQ(playerRel, actionKey, resultActionMetaData);
        }
      })
      .fail(function (err) {
        var errStr = 'Round:' + objs.history.currentRound + ' - ' + playerRel + ': error action #' + actionKey;
        Logger.err(errStr, objs.game._id, err);
        throw errStr + ' ' + err;
      });
    promiseArray.push(promise);
  });

  return Q.all(promiseArray);
};
