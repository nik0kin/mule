
var _ = require('lodash'),
  winston = require('winston');

var GameBoard = require('mule-models').GameBoard.Model,
  responseUtils = require('mule-utils/responseUtils'),
  Turn = require('mule-models').Turn.Model,
  turnHelper = require('../../turns/crud/helper');


exports.read = function (req, res) {
  winston.info('GET /turns/:id', req.params.id);

  turnHelper.readQ(req.params.id)
    .then(function (turn){
      if (!turn) {
        responseUtils.sendNotFoundError(res, 'Not Found');
      } else
        res.send(turn);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};

exports.readGamesTurn = function (req, res) {
  var gameId = req.params.id,
    turnNumber = req.params.turnNumber;

  winston.info('GET /games/:id/history/:turnNumber', gameId, turnNumber);

  Turn.findByGameIdQ(gameId, turnNumber)
    .then(function (turn) {
      res.send(turn);
    }, responseUtils.sendNotFoundErrorCallback(res));
};