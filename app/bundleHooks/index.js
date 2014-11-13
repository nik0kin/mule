var Q = require('q');

var MuleRules = require('mule-rules'),
  GameBoard = require('mule-models').GameBoard.Model,
  actionsHelper = require('../turnSystem/actionsHelper'), //TODO not use these requires
  brain = require('../turnSystem/brain');
  GameState = require('mule-models').GameState.Model;

// returns a boardDef
exports.boardGeneratorHookQ = function (ruleBundleName, customBoardSettings, ruleBundleRules) {
  
  var generateFunctionQ = MuleRules.getBundleCode(ruleBundleName).boardGenerator;

  if (!generateFunctionQ || typeof generateFunctionQ !== 'function') {
    throw 'missing board generator for ' + ruleBundleName;
  }

  console.log('generating for: ' + ruleBundleName);
  
  return generateFunctionQ(customBoardSettings, ruleBundleRules);
};

// returns gameState
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

// returns actions
exports.validateActionsHookQ = function (gameStateId, ruleBundle, playerRel, actions) {
  var bundleCode = MuleRules.getBundleCode(ruleBundle.name),
    validateActionsQ;

  if (bundleCode && (validateActionsQ = bundleCode.validateActions)) {
    return GameState.findByIdWithPopulatedStatesQ(gameStateId)
      .then(function (gameState) {
        return validateActionsQ({
          gameState: gameState,
          ruleBundle: ruleBundle,
          playerRel: playerRel,
          actions: actions
        });
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
    return brain.loadGameStateObjectQ(game)
      .then(function (resultGso) {
        console.log('calling bundleProgreesQ');
        actionsHelper.initActions(game.ruleBundle); // PLEASE KILL THIS LINE
        return bundleProgressRoundQ(GameState, resultGso)
      });
  }
};

// returns metadata or null
exports.progressTurnHookQ = function (gso) {
  var bundleCode = MuleRules.getBundleCode(gso.ruleBundle.name),
    bundleProgressTurnQ;
  if (bundleCode && typeof (bundleProgressTurnQ = bundleCode.progressTurn) === 'function') {
    console.log('calling bundleProgressTurnQ');
    actionsHelper.initActions(gso.ruleBundle);
    return bundleProgressTurnQ(GameBoard, gso);
  }
}
