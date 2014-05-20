/**
 * Created by niko on 5/6/14.
 */

var _ = require('lodash'),
  Q = require('q');

var BasicMoveAction = require('../../turnSystem/basicMoveAction'),
  roundRobinTurnSystem = require('../../turnSystem/roundRobin'),
  playByMailTurnSystem = require('../../turnSystem/playByMail'),
  RuleBundle = require('mule-models').RuleBundle.Model;
  Game = require('mule-models').Game.Model;

var turnStyleFunctions = {
  'roundRobin':  roundRobinTurnSystem,
  'playByMail': playByMailTurnSystem
};

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

      var promiseArray = [];

      _.each(req.body.actions, function (value, key) {
        var params = {
          gameBoardId: game.gameBoard,
          whichPieceId: parseInt(value.whichPieceId),
          whereId: value.whereId
        };

        var promise = BasicMoveAction.validateMoveActionQ(params)
          .then(function (gameBoard) {
            console.log('valid move action ' + key + ': ');
            console.log(params);
          })
          .fail(function (err) {
            console.log('invalid action: ' + key);
            throw 'action ' + key + ': ' + err;
          });

        promiseArray.push(promise);
      });

      return Q.all(promiseArray)
        .then(function () {
          return RuleBundle.findByIdQ(game.ruleBundle.id);
        })
        .then(function (ruleBundle) {
          var turnFunctions = turnStyleFunctions[ruleBundle.turnSubmitStyle];

          console.log('submitting turn (' + ruleBundle.turnSubmitStyle + ')');
          return turnFunctions.submitTurnQ(playerId, game.gameBoard, {actions: req.body.actions });
        })
        .then(function () {
          res.status(200).send({msg: "ITS TRUE"})
        })
        .fail(function (err) {
          console.log('faile: ')
          console.log(err)
          res.status(400).send({err: err});
        });
    });



};
