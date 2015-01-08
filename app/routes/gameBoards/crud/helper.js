/**
 * Controllers->RuleBundle->CRUD-> helper.js
 *
 */

var _ = require('lodash'),
  Q = require('q');

var utils = require('mule-utils/jsonUtils'),
  GameBoard = require('mule-models').GameBoard.Model,
  ruleBundleHelper = require('../../ruleBundles/crud/helper'),
  boardGen = require('../../../boardGenerator');

exports.indexQ = function () {
  return GameBoard.find().execQ();
};

// should only be called by Games.create
exports.createQ = function (params) {
  var newGameBoard = new GameBoard({});

  newGameBoard.ruleBundle = params.ruleBundle;

  if (params.rules.dynamicBoard) { //hacky for right now
    newGameBoard.boardType = 'built';

    return boardGen.saveGeneratedGameBoardQ(newGameBoard, {
      ruleBundle: newGameBoard.ruleBundle,
      customBoardSettings: params.customBoardSettings,
      rules: params.rules
    });
  } else {
    newGameBoard.boardType = 'static';

    return newGameBoard.saveQ();
  }
};

exports.readQ = function (gameBoardId){
  return GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      if (gameBoard.boardType == 'static') {
        return ruleBundleHelper.readQ(gameBoard.ruleBundle.id)
          .then(function (foundRuleBundle) {
            //TODO temporary if?: , RuleBundle.rules should always exist
            gameBoard.board = foundRuleBundle.rules ? foundRuleBundle.rules.board : undefined;

            return gameBoard;
          });
      } else if (gameBoard.boardType == 'built') {
        return gameBoard;
      } else {
        throw 'wtf boardType:' + gameBoard.boardType;
      }
    });
};

exports.update = function (parameters, callback) {

};

exports.destroy = function (parameters, callback) {

};
