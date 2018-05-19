var Q = require('q'),
    _ = require('lodash'),
    path = require('path'),
    fs = require('fs');

var RuleBundle = require('mule-models').RuleBundle.Model,
  Logger = require('mule-utils').logging,
  GameBoard = require('mule-models').GameBoard.Model,
  brain = require('../turnSystem/brain'),
  createMQ = require('./M'),
  GameState = require('mule-models').GameState.Model;

// for loading ruleBundle general.json
require.extensions[".json"] = function (m) {
  m.exports = JSON.parse(fs.readFileSync(m.filename));
};

exports.createMQ = createMQ;

//////////////////////////////

var bundleModule = {};

var getBundleCode = function (ruleBundleName) {
  return bundleModule[ruleBundleName.toLowerCase()];
};

exports.initRuleBundlesQ = function (muleConfig) {
  Logger.vog('Loading RuleBundles');
  var promises = [];
  _.each(muleConfig.ruleBundles, function (ruleBundleNameConfig, ruleBundleName) {
    promises.push(exports.initRuleBundleQ(ruleBundleNameConfig, ruleBundleName));
  });
  return Q.all(promises)
    .then(function () {
      Logger.vog('RuleBundles finished loading');
    });
};

// loads bundleCode & optional creates a RuleBundle dataobject
exports.initRuleBundleQ = function (ruleBundleConfig, _ruleBundleName) {
  var ruleBundleName = _ruleBundleName.toLowerCase();

  Logger.vog('Loading ' + ruleBundleName);

  if (!ruleBundleConfig.codePath) {
    throw 'ruleBundleConfig.codePath required for ' + _ruleBundleName;
  }
  bundleModule[ruleBundleName] = require(ruleBundleConfig.codePath);

  // if webpacked w/ default
  if (bundleModule[ruleBundleName].default) {
    bundleModule[ruleBundleName] = bundleModule[ruleBundleName].default;
  }

  var findRegExp = new RegExp('^' + ruleBundleName + '$', 'i');
  return RuleBundle.findOneQ({name: findRegExp})
    .then(function (result) {
      var checkRuleBundleName = function (rbName) {
        rbName = rbName.toLowerCase();
        if (ruleBundleName !== rbName) {
          delete bundleModule[ruleBundleName];
          throw 'config.mule.ruleBundles[' + ruleBundleName + ']'
              + ' key doesnt match general.json name: ' + rbName;
        }
      };
      if (result) {
        checkRuleBundleName(result.name);
        return; // do nothing
      }

      var ruleBundleJSON = getRuleBundleJSON(ruleBundleConfig.codePath),
          newRuleBundle = new RuleBundle(ruleBundleJSON);
      checkRuleBundleName(newRuleBundle.name);
      return newRuleBundle.saveQ();
    });
};

// RuleBundles dataobjects are an unnessary mess
var getRuleBundleJSON = function (bundleCodePath) {
  return require(path.join(bundleCodePath, 'general.json'));
};

exports.getActions = function (ruleBundleName) {
  var bundleCode = getBundleCode(ruleBundleName);
  if (bundleCode) {
    return bundleCode.actions || [];
  } else {
    return [];
  }
};

//////////////////////////////

exports.doesValidateCustomBoardSettingsHookExist = function (ruleBundleName) {
  return !!getBundleCode(ruleBundleName).customBoardSettingsValidator
}

// returns true or false
exports.validateCustomBoardSettingsHook = function (ruleBundleName, customBoardSettings) {
  var validateFunction = getBundleCode(ruleBundleName).customBoardSettingsValidator;

  Logger.log('Checking customBoardSettings for: ' + ruleBundleName);

  return validateFunction(customBoardSettings);
};

  // the boardGeneratorHook is ran before a game is started. The hook doesn't get an M object.

// returns a boardDef
exports.boardGeneratorHookQ = function (ruleBundleName, customBoardSettings, ruleBundleRules, gameId) {
  var generateFunctionQ = getBundleCode(ruleBundleName).boardGenerator;

  if (!generateFunctionQ || typeof generateFunctionQ !== 'function') {
    throw 'missing board generator for ' + ruleBundleName;
  }

  Logger.log('Generating Board for: ' + ruleBundleName);

  return Q()
    .then(function () {
      return generateFunctionQ(customBoardSettings, ruleBundleRules);
    })
    .fail(function (err) {
      var errorMsg = '[ERROR] boardGenerator: ' + err;
      Logger.err(errorMsg, gameId, err);
      throw errorMsg;
    });
};

//////////

var baseHookQ = function (ruleBundleName, gameId, hookName, param1, param2) {
  // look if hook exists
  // if hook exists
  //   print start msg
  //     doHookQ
  //      then: print end msg
  //      fail: display err & propigate

  var bundleCode = getBundleCode(ruleBundleName),
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

//returns winner, 'tie', or null
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
  Logger.vog('ActionParams:', gameId, actionParams);
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
