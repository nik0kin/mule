/**
 * Controllers->RuleBundle->CRUD-> helper.js
 *
 */

var _ = require('lodash'),
  Q = require('q'),
  winston = require('winston');

var utils = require('mule-utils/jsonUtils'),
  GameBoard = require('mule-models').GameBoard.Model,
  ruleBundleHelper = require('../../ruleBundles/crud/helper'),
  boardGen = require('../../../boardGenerator');

exports.indexQ = function () {
  return GameBoard.find().execQ();
};

// should only be called by Games.create
exports.createQ = function (params) {
  return Q.promise( function (resolve, reject) {
    winston.info("User attempting to create new GameBoard: params: ", params );

    var newGameBoard = new GameBoard({});

    newGameBoard.ruleBundle = params.ruleBundle;

    if (params.rules.dynamicBoard) { //hacky for right now
      newGameBoard.boardType = 'built';

      boardGen.saveGeneratedGameBoardQ(newGameBoard, {ruleBundle: newGameBoard.ruleBundle, customBoardSettings : params.customBoardSettings, rules: params.rules})
        .done(resolve, reject);
    } else {
      newGameBoard.boardType = 'static';

      newGameBoard.saveQ()
        .done(resolve, reject);
    }
  });
};

exports.readQ = function (gameBoardId){
  return Q.promise(function (resolve, reject) {
    GameBoard.findByIdQ(gameBoardId)
      .done(function (gameBoard) {

        if (gameBoard.boardType == 'static') {
          ruleBundleHelper.readQ(gameBoard.ruleBundle.id)
            .done(function (foundRuleBundle) {
              //TODO temporary if?: , RuleBundle.rules should always exist
              gameBoard.board = foundRuleBundle.rules ? foundRuleBundle.rules.board : undefined;

              resolve(gameBoard);
            }, reject);
        } else if (gameBoard.boardType == 'built') {
          console.log('custom map!');
          resolve(gameBoard);
        } else {
          reject('wtf boardType:' + gameBoard.boardType)
        }
      }, reject);
  });
};

exports.update = function (parameters, callback) {

};

exports.destroy = function (parameters, callback) {

};
