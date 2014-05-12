
var _ = require('lodash'),
  winston = require('winston');

var GameBoard = require('mule-models').GameBoard.Model,
  responseUtils = require('mule-utils/responseUtils'),
  historyHelper = require('./helper'),
  gameHelper = require('../../games/crud/helper');


exports.index = function (req, res) {
  winston.info('GET /historys');

  historyHelper.indexQ()
    .then(function (historys) {
      res.send(historys);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};


exports.read = function (req, res) {
  winston.info('GET /historys/:id', req.params.id);

  historyHelper.readQ(req.params.id)
    .then(function (history){
      if (!history) {
        responseUtils.sendNotFoundError(res, 'Not Found');
      } else
        res.send(history);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};

////////////////

exports.readGamesHistory = function (req, res) {
  winston.info('GET /games/:id/history', req.params.id);

  gameHelper.readQ(req.params.id)
    .done(function (foundGame) {
      if (!foundGame) {
        responseUtils.sendNotFoundError(res, 'Game: Not Found');
      } else {
        GameBoard.findByIdQ(foundGame.gameBoard)
          .then(function (gameBoard){
            if (!gameBoard) {
              responseUtils.sendNotFoundError(res, 'Game->GameBoard: Not Found');
            } else {
              historyHelper.readQ(gameBoard.history)
                .then(function (history){
                  if (!history) {
                    responseUtils.sendNotFoundError(res, 'Not Found');
                  } else
                    res.send(history);
                })
                .fail(responseUtils.sendBadRequestCallback(res))
                .done();
            }
          })
          .fail(responseUtils.sendBadRequestCallback(res))
          .done();
      }
    }, responseUtils.sendNotFoundErrorCallback(res))
};