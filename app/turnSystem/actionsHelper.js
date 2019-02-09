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
  var promiseArray = [];
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
    var promise = function () {
      Logger.log('[START] Action #' + actionKey, objs.game._id);
      return bundleHooks.actionDoQ(Action, objs.game._id, playerRel, action.params)
       .then(function (resultActionMetaData) {
         Logger.log('[COMPLETE] Action #' + actionKey + ' Round:' + objs.history.currentRound + ' - ' + playerRel, objs.game._id);

         if (resultActionMetaData) {
           return objs.history.saveMetaDataToActionQ(playerRel, actionKey, resultActionMetaData);
         }
       })
       .fail(function (err) {
         var errStr = '[ERROR] Action #' + actionKey + ' Round:' + objs.history.currentRound + ' - ' + playerRel;
         Logger.err(errStr, objs.game._id, err);
         throw new Error(errStr + ' ' + err);
       });
    };
    promiseArray.push(promise);
  });

  // run each Action.doQ one by one
  //  TODO an integration test
  //    that Plays a Turn with two actions which both modify playVariables and the same PieceState
  return runPromisesSequentially(promiseArray);
};

function runPromisesSequentially(promiseArray) {
  return promiseArray.reduce(Q.when, Q());
}
