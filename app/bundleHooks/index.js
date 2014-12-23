var Q = require('q');

var MuleRules = require('mule-rules'),
  GameBoard = require('mule-models').GameBoard.Model,
  brain = require('../turnSystem/brain'),
  createMQ = require('./M'),
  GameState = require('mule-models').GameState.Model;

exports.createMQ = createMQ;

// returns a boardDef
exports.boardGeneratorHookQ = function (ruleBundleName, customBoardSettings, ruleBundleRules) {
  var generateFunctionQ = MuleRules.getBundleCode(ruleBundleName).boardGenerator;

  if (!generateFunctionQ || typeof generateFunctionQ !== 'function') {
    throw 'missing board generator for ' + ruleBundleName;
  }

  console.log('generating for: ' + ruleBundleName);
  
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
    console.log('calling bundleProgressTurnQ');
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
        console.log('[START] validateTurnHookQ');
        return validateTurnQ(M, playerRel, actions);
      })
      .then(function (_actions) {
        console.log('[END] validateTurnHookQ');
        return Q(_actions);
      })
      .fail(function (err) {
        var errorMsg = '[ERROR] validateTurnHookQ: ' + err;
        console.log(errorMsg);
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
        console.log('calling bundleProgressQ');
        return bundleProgressRoundQ(M)
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
    console.log('calling bundleProgressTurnQ');
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
    })
};

exports.actionDoQ = function (Action, gameId, playerRel, actionParams) {
  return createMQ(gameId)
    .then(function (M) {
      return Action.doQ(M, playerRel, actionParams);
    })
};
