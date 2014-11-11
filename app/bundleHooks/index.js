var Q = require('q');

var MuleRules = require('mule-rules');

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
