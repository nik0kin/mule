/**
 * BoardGenerator
 */

var Q = require('q'),
  _ = require('lodash');

var GameBoard = require('mule-models').GameBoard.Model,
  MuleRules = require('mule-rules');

exports.saveGeneratedGameBoardQ = function (newGameBoard, params) {
  var ruleBundleName = params.ruleBundle.name;
  var ruleBundleRules = params.rules;

  var generateFunctionQ = MuleRules.getBundleCode(ruleBundleName).boardGenerator;

  if (!generateFunctionQ || typeof generateFunctionQ !== 'function') {
    throw 'missing board generator for ' + ruleBundleName;
  }

  console.log('generating for: ' + ruleBundleName);
  return generateFunctionQ(params.customBoardSettings, ruleBundleRules)
    .then(function (result) {
      newGameBoard.board = result;
      return newGameBoard.saveQ()
    });
};
