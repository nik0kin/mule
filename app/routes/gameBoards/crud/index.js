/**
 * Controllers->RuleBundle->CRUD-> index.js
 *
 */

var fs = require('fs'),
  _ = require('lodash');

var GameBoard = require('mule-models').GameBoard,
  logging = require('mule-utils').logging,
  responseUtils = require('mule-utils/responseUtils'),
  gameBoardHelper = require('./helper'),
  gameHelper = require('../../games/crud/helper');


exports.index = function (req, res) {
  logging.vog('GET /gameBoards');

  gameBoardHelper.indexQ()
    .then(function (ruleBundles) {
      res.send(ruleBundles);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};

exports.create = function (req, res) {
  logging.vog('POST /gameBoards');

  responseUtils.sendForbiddenError(res, 'GameBoards are only created while a Game is created');
};

exports.read = function (req, res) {
  logging.vog('GET /gameBoards/:id', req.params.id);

  gameBoardHelper.readQ(req.params.id)
    .then(function (gameBoard){
      if (!gameBoard) {
        responseUtils.sendNotFoundError(res, 'Not Found');
      } else
        res.send(gameBoard);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};

exports.update = function (req, res) {
  responseUtils.sendForbiddenError(res, 'GameBoards are only updated while a Game is updated');
};

exports.destroy = function (req, res) {
  responseUtils.sendForbiddenError(res, 'GameBoards are only destroyed while a Game is destroyed');
};


////////////////

exports.readGamesBoard = function (req, res) {
  logging.vog('GET /games/:id/board', req.params.id);

  gameHelper.readQ(req.params.id)
    .done(function (foundGame) {
      if (!foundGame) {
        responseUtils.sendNotFoundError(res, 'Game: Not Found');
      } else {
        gameBoardHelper.readQ(foundGame.gameBoard)
          .then(function (gameBoard){
            if (!gameBoard) {
              responseUtils.sendNotFoundError(res, 'Game->GameBoard: Not Found');
            } else
              res.send(gameBoard);
          })
          .fail(responseUtils.sendBadRequestCallback(res))
          .done();
      }
    }, responseUtils.sendNotFoundErrorCallback(res));
};
