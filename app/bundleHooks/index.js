var Q = require('q');

var MuleRules = require('mule-rules'),
  Logger = require('mule-utils').logging,
  GameBoard = require('mule-models').GameBoard.Model,
  brain = require('../turnSystem/brain'),
  createMQ = require('./M'),
  GameState = require('mule-models').GameState.Model;

exports.createMQ = createMQ;

//////////
  // the boardGeneratorHook is ran before a game is started. The hook doesn't get an M object.

// returns a boardDef
exports.boardGeneratorHookQ = function (ruleBundleName, customBoardSettings, ruleBundleRules, gameId) {
  var generateFunctionQ = MuleRules.getBundleCode(ruleBundleName).boardGenerator;

  if (!generateFunctionQ || typeof generateFunctionQ !== 'function') {
    throw 'missing board generator for ' + ruleBundleName;
  }

  Logger.log('Generating Board for: ' + ruleBundleName);
  
  return generateFunctionQ(customBoardSettings, ruleBundleRules);
};

//////////

var baseHookQ = function (ruleBundleName, gameId, hookName, param1, param2) {
  // look if hook exists
  // if hook exists
  //   print start msg
  //     doHookQ
  //      then: print end msg
  //      fail: display err & propigate

  var bundleCode = MuleRules.getBundleCode(ruleBundleName),
    hookQ = bundleCode[hookName];

  if (hookQ) {
    return createMQ(gameId, hookName)
      .then(function (M) {
        Logger.log('[START] ' + hookName, gameId);
        return hookQ(M, param1, param2);
      })
      .then(function (result) {
        Logger.log('[END] ' + hookName, gameId);
        return Q(result);
      })
      .fail(function (err) {
        var errorMsg = '[ERROR] '  + hookName + ': ' + err;
        Logger.err(errorMsg, gameId, err);
        throw errorMsg;
      });
  } else {
    Logger.vog(hookName + ' Hook Not Implemented', gameId)
    return Q();
  }
};

exports.gameStartHookQ = function (gameId, ruleBundleName) {
  return baseHookQ(ruleBundleName, gameId, 'gameStart');
};

//returns winner or null
exports.winConditionHookQ = function (gso) {
  return baseHookQ(gso.ruleBundle.name, gso.game._id, 'winCondition');
};

// returns actions
exports.validateTurnHookQ = function (gameId, ruleBundle, playerRel, actions) {
  return baseHookQ(ruleBundle.name, gameId, 'validateTurn', playerRel, actions)
    .then(function (resultActions) {
      return Q(resultActions || actions);
    });
};

// returns metadata or null
exports.progressRoundHookQ = function (ruleBundle, game) {
  return baseHookQ(ruleBundle.name, game._id, 'progressRound');
};

// returns metadata or null
exports.progressTurnHookQ = function (gso) {
  return baseHookQ(gso.ruleBundle.name, gso.game._id, 'progressTurn');
};

//////////
  // these are more managed by turnSystem/actionHelper right now

exports.actionValidateQ = function (Action, gameId, playerRel, actionParams) {
  return createMQ(gameId)
    .then(function (M) {
      return Action.validateQ(M, playerRel, actionParams);
    });
};

exports.actionDoQ = function (Action, gameId, playerRel, actionParams) {
  return createMQ(gameId)
    .then(function (M) {
      return Action.doQ(M, playerRel, actionParams);
    });
};
