/**
 * Created by niko on 5/6/14.
 */

var _ = require('lodash'),
  Q = require('q');

var turnBrain = require('../../turnSystem/brain'),
  actionsHelper = require('../../turnSystem/actionsHelper'),
  RuleBundle = require('mule-models').RuleBundle.Model,
  Game = require('mule-models').Game.Model;

exports.playTurn = function (req, res) {

  if (!req.body.gameId) {
    return res.status(400).send({err: 'MISSING GAME ID'});
  }

  if (!_.isArray(req.body.actions)) {
    return res.status(400).send({err: 'MISSING ACTIONS ARRAY'});
  }

  Game.findByIdQ(req.body.gameId)
    .then (function (game) {
    if (!game) {
      res.status(400).send({err: 'INVALID GAME ID'});
    } else if (game.gameStatus !== 'inProgress') {
      res.status(400).send({err: 'GAME NOT IN PROGRESS'});
    } else {
      return Q(game);
    }
  })
    .then(function (game) {
      var playerId = req.body.playerId || game.getPlayerPosition(req.user._id);
      console.log('user: ' + req.user._id + ' -> ' + playerId);
      if (playerId === -1) {
        return res.status(403).send({err: 'INVALID PLAYER'});
      }

      var _ruleBundle;
      return RuleBundle.findByIdQ(game.ruleBundle.id)
        .then(function (ruleBundle) {
          _ruleBundle = ruleBundle;
          return actionsHelper.validateActionsQ(game.gameBoard, playerId, req.body.actions, _ruleBundle);
        })
        .then(function (validatedActions) {
          console.log('submitting turn (' + _ruleBundle.turnSubmitStyle + ')');
          return turnBrain.submitPlayerTurnQ(game, playerId, game.gameBoard, validatedActions, _ruleBundle);
        })
        .then(function (turnNumber) {
          console.log('p[' + playerId + '] justed submitted turn: ' + turnNumber);
          res.status(200).send({msg: "Success", turnNumber: turnNumber})
        })
        .fail(function (err) {
          console.log('faile: ')
          console.log(err)
          res.status(400).send({err: JSON.stringify(err)});
        });
    });

};
