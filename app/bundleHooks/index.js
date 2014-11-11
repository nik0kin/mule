var Q = require('q');

var MuleRules = require('mule-rules'),
  GameState = require('mule-models').GameState.Model;

exports.boardGeneratorHookQ = function (ruleBundleName, customBoardSettings, ruleBundleRules) {
  
  var generateFunctionQ = MuleRules.getBundleCode(ruleBundleName).boardGenerator;

  if (!generateFunctionQ || typeof generateFunctionQ !== 'function') {
    throw 'missing board generator for ' + ruleBundleName;
  }

  console.log('generating for: ' + ruleBundleName);
  
  return generateFunctionQ(customBoardSettings, ruleBundleRules);
};

exports.gameStartHookQ = function (ruleBundleName, gameState) {
  var ruleBundleGameStartQ = MuleRules.getBundleCode(ruleBundleName).gameStart;
  if (ruleBundleGameStartQ) {
    return ruleBundleGameStartQ(gameState);
  } else {
    return Q(gameState);
  }
};

//returns winner
exports.winConditionHookQ = function (gso) {
  var bundleCode = MuleRules.getBundleCode(gso.ruleBundle.name),
    bundleWinConditionQ;

  if (bundleCode && typeof (bundleWinConditionQ = bundleCode.winCondition) === 'function') {
    console.log('calling bundleProgressTurnQ');
    return bundleWinConditionQ(GameState, gso);
  }
};
