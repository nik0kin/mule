/**
 * Controllers->RuleBundle->CRUD-> helper.js
 *
 */

var _ = require('underscore'),
  Q = require('q'),
  winston = require('winston');

var utils = require('mule-utils/jsonUtils'),
  GameBoard = require('mule-models').GameBoard.Model,
  ruleBundleHelper = require('../../ruleBundles/crud/helper');

exports.indexQ = function () {
  return GameBoard.find().execQ();
};

// should only be called by Games.create
exports.createQ = function (params) {
  return Q.promise( function (resolve, reject) {
    winston.info("User attempting to create new GameBoard: params: ", params );

    var newGameBoard = new GameBoard({});

    newGameBoard.ruleBundle = params.ruleBundle;

    newGameBoard.boardType = 'static';

    newGameBoard.saveQ()
      .done(resolve, reject);

  });
};

exports.readQ = function (gameBoardID){
  return Q.promise(function (resolve, reject) {
    GameBoard.findByIdQ(gameBoardID)
      .done(function (gameBoard) {

        //if (gameBoard.boardType == static)
        ruleBundleHelper.readQ(gameBoard.ruleBundle.id)
          .done(function (foundRuleBundle) {
            gameBoard.board = foundRuleBundle.rules.board;

            resolve(gameBoard);
          }, reject);
      }, reject);
  });
};

exports.update = function (parameters, callback) {

};

exports.destroy = function (parameters, callback) {

};
