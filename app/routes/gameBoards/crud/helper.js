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
  vikingBoardGen = require('../../../boardGenerator');

exports.indexQ = function () {
  return GameBoard.find().execQ();
};

// should only be called by Games.create
exports.createQ = function (params) {
  return Q.promise( function (resolve, reject) {
    winston.info("User attempting to create new GameBoard: params: ", params );

    var newGameBoard = new GameBoard({});

    newGameBoard.ruleBundle = params.ruleBundle;

    if (params.ruleBundle.name.toLowerCase() == 'vikings') { //hacky for right now
      console.log('vikings gameboard!!')
      vikingBoardGen.saveVikingsGameBoardQ(newGameBoard, {customBoardSettings : params.customBoardSettings, rules: params.rules})
        .done(resolve, reject);
    } else {
      newGameBoard.boardType = 'static';

      newGameBoard.saveQ()
        .done(resolve, reject);
    }
  });
};

exports.readQ = function (gameBoardID){
  return Q.promise(function (resolve, reject) {
    GameBoard.findByIdQ(gameBoardID)
      .then(function (gameBoard) {
        return gameBoard.populateQ('spaces');
      })
      .then(function (gameBoard) {
        return gameBoard.populateQ('pieces');
      })
      .done(function (gameBoard) {

        if (gameBoard.boardType == 'static') {
          ruleBundleHelper.readQ(gameBoard.ruleBundle.id)
            .done(function (foundRuleBundle) {
              //TODO temporary if?: , RuleBundle.rules should always exist
              gameBoard.board = foundRuleBundle.rules ? foundRuleBundle.rules.board : undefined;

              resolve(gameBoard);
            }, reject);
        } else if (gameBoard.boardType == 'built') {
          console.log('YOU ARE A VIKING')
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
