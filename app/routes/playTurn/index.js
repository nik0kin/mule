var _ = require('lodash'),
  Q = require('q');

var helper = require('./helper'),
  Logger = require('mule-utils').logging;

var playTurnFail = function (res) {
  return function (err) {
    Logger.err('playTurn fail: ', null, err);
    return res.status(err.status || 400).send({err: JSON.stringify(err)});
  };
};

exports.playTurn = function (req, res) {
  helper.playTurnQ(req.body.gameId, req.body.playerId, req.user._id, req.body.actions)
    .then(function (result) {
      return res.status(200).send(result);
    })
    .fail(playTurnFail(res))
    .done();
};

exports.playGamesTurn = function (req, res) {
  helper.playTurnQ(req.params.id, req.body.playerId, req.user._id, req.body.actions)
    .then(function (result) {
      return res.status(200).send(result);
    })
    .fail(playTurnFail(res))
    .done();
};
