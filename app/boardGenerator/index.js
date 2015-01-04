/**
 * BoardGenerator
 */

var Q = require('q'),
  _ = require('lodash');

var bundleHooks = require('../bundleHooks');

exports.saveGeneratedGameBoardQ = function (newGameBoard, params) {
  var ruleBundleName = params.ruleBundle.name;
  var ruleBundleRules = params.rules;

  return bundleHooks.boardGeneratorHookQ(ruleBundleName, params.customBoardSettings, ruleBundleRules)
    .then(function (result) {
      newGameBoard.board = result;
      return newGameBoard.saveQ();
    });
};
