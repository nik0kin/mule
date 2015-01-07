var _ = require('lodash');

var GameBoard = require('mule-models').GameBoard.Model,
  logging = require('mule-utils').logging,
  responseUtils = require('mule-utils/responseUtils'),
  historyHelper = require('./helper'),
  gameHelper = require('../../games/crud/helper');


exports.index = function (req, res) {
  logging.vvog('GET /historys');

  historyHelper.indexQ()
    .then(function (historys) {
      res.send(historys);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};


exports.read = function (req, res) {
  logging.vvog('GET /historys/:id', req.params.id);

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

var readGamesHistoryHelper = function (req, res, helperFunction) {
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
              helperFunction(gameBoard.history)
                .then(function (history){
                  if (!history) {
                    responseUtils.sendNotFoundError(res, 'Game->GameBoard->History: Not Found');
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
    }, responseUtils.sendNotFoundErrorCallback(res));
};

exports.readGamesHistory = function (req, res) {
  logging.vvog('GET /games/:id/history', req.params.id);

  readGamesHistoryHelper(req, res, historyHelper.readQ);
};

exports.readGamesFullHistory = function (req, res) {
  logging.vvog('GET /games/:id/history/all', req.params.id);

  readGamesHistoryHelper(req, res, historyHelper.readFullQ);
};
