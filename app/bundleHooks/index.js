var Q = require('q');

var MuleRules = require('mule-rules'),
  Logger = require('mule-utils').logging,
  GameBoard = require('mule-models').GameBoard.Model,
  brain = require('../turnSystem/brain'),
  createMQ = require('./M'),
  GameState = require('mule-models').GameState.Model;

exports.createMQ = createMQ;

// returns a boardDef
exports.boardGeneratorHookQ = function (ruleBundleName, customBoardSettings, ruleBundleRules, gameId) {
  var generateFunctionQ = MuleRules.getBundleCode(ruleBundleName).boardGenerator;

  if (!generateFunctionQ || typeof generateFunctionQ !== 'function') {
    throw 'missing board generator for ' + ruleBundleName;
  }

  Logger.log('Generating Board for: ' + ruleBundleName);
  
  return generateFunctionQ(customBoardSettings, ruleBundleRules);
};


exports.gameStartHookQ = function (gameId, ruleBundleName) {
  var ruleBundleGameStartQ = MuleRules.getBundleCode(ruleBundleName).gameStart;
  if (ruleBundleGameStartQ) {
    return createMQ(gameId)
      .then (function (M) {
        return ruleBundleGameStartQ(M);
      });
  } else {
    return Q();
  }
};

//returns winner or null
exports.winConditionHookQ = function (gso) {
  var bundleCode = MuleRules.getBundleCode(gso.ruleBundle.name),
    bundleWinConditionQ;

  if (bundleCode && typeof (bundleWinConditionQ = bundleCode.winCondition) === 'function') {
    Logger.log('calling bundleProgressTurnQ', gso.game._id);
    return createMQ(gso.game._id)
      .then (function (M) {
        return bundleWinConditionQ(M);
      });
  } else {
    return Q();
  }
};

// returns actions
exports.validateTurnHookQ = function (gameId, ruleBundle, playerRel, actions) {
  var bundleCode = MuleRules.getBundleCode(ruleBundle.name),
    validateTurnQ;

  if (bundleCode && (validateTurnQ = bundleCode.validateTurn)) {
    return createMQ(gameId, 'validateTurnHookQ')
      .then(function (M) {
        Logger.log('[START] validateTurnHookQ', gameId);
        return validateTurnQ(M, playerRel, actions);
      })
      .then(function (_actions) {
        Logger.log('[END] validateTurnHookQ', gameId);
        _actions = _actions || actions;
        return Q(_actions);
      })
      .fail(function (err) {
        var errorMsg = '[ERROR] validateTurnHookQ: ' + err;
        Logger.err(errorMsg, gameId);
        throw errorMsg;
      });
  } else {
    return Q(actions);
  }
};

// returns metadata or null
exports.progressRoundHookQ = function (ruleBundle, game) {
  var bundleCode = MuleRules.getBundleCode(ruleBundle.name),
    bundleProgressRoundQ;
  if (bundleCode && typeof (bundleProgressRoundQ = bundleCode.progressRound) === 'function') {
    return createMQ(game._id)
      .then(function (M) {
        Logger.log('calling bundleProgressQ', game._id);
        return bundleProgressRoundQ(M);
      });
  } else {
    return Q();
  }
};

// returns metadata or null
exports.progressTurnHookQ = function (gso) {
  var bundleCode = MuleRules.getBundleCode(gso.ruleBundle.name),
    bundleProgressTurnQ;
  if (bundleCode && typeof (bundleProgressTurnQ = bundleCode.progressTurn) === 'function') {
    Logger.log('calling bundleProgressTurnQ');
    return createMQ(gso.game._id)
      .then(function (M) {
        return bundleProgressTurnQ(M);
      });
  } else {
    return Q();
  }
};

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
