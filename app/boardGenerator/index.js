/**
 * Hacky BoardGenerator
 */

var Q = require('q'),
  _ = require('lodash');

var GameBoard = require('mule-models').GameBoard.Model;

exports.saveGeneratedGameBoardQ = function (newGameBoard, params) {
  return Q.promise(function (resolve, reject) {
    var ruleBundleName = params.ruleBundle.name;
    var ruleBundleRules = params.rules;

    var generateFunction;

    console.log('generating for: ' + ruleBundleName);
    if (ruleBundleName === 'Vikings') { // TODO hacky atm
      generateFunction = require('mule-rules/bundles/vikings/boardGenerator');
    } else if (ruleBundleName === 'MuleSprawl') {
      generateFunction = require('mule-rules/bundles/mulesprawl/boardGenerator');
    } else {
      throw 'missing board generator for ' + ruleBundleName;
    }

    generateFunction(params.customBoardSettings, ruleBundleRules)
      .done(function (result) {
        newGameBoard.board = result;
        newGameBoard.saveQ()
          .done(resolve, reject);
      }, reject);
  });
};
