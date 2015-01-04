var _ = require('lodash'),
  Q = require('q');

var muleRules = require('mule-rules'),
  bundleHooks = require('../bundleHooks'),
  GameBoard = require('mule-models').GameBoard.Model,
  GameState = require('mule-models').GameState.Model,
  PieceState = require('mule-models').PieceState.Model;

var getAction = function (actionType, ruleBundle) {
  return muleRules.getActions(ruleBundle.name)[actionType];
};

exports.validateActionsQ = function (gameId, ruleBundle, playerRel, actions) {
  var promiseArray = [],
    _gameStateId;
  _.each(actions, function (action, key) {
    var Action = getAction(action.type, ruleBundle);
    if (!Action) {
      //TODO correct error handling
      console.log('wow that action doesnt exist');
    }

    var promise = bundleHooks.actionValidateQ(Action, gameId, playerRel, action.params)
      .then(function () {
        console.log('valid move action ' + key + ': ');
        console.log(action.params);
      })
      .fail(function (err) {
        console.log('invalid action: ' + key);
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
        console.log('R' + objs.history.currentRound + ' - ' + playerRel + ': success action #' + actionKey);

        if (resultActionMetaData) {
          return objs.history.saveMetaDataToActionQ(playerRel, actionKey, resultActionMetaData);
        }
      })
      .fail(function (err) {
        console.log('R' + objs.history.currentRound + ' - ' + playerRel + ': error action #' + actionKey);
        console.log(err);
      });
    promiseArray.push(promise);
  });

  return Q.all(promiseArray);
};
