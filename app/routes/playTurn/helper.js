/**
 * Created by niko on 5/6/14.
 */

var _ = require('lodash'),
  Q = require('q');

var BasicMoveAction = require('../../turnCode/basicMoveAction');

exports.playTurn = function (req, res) {

  var promiseArray = [];

  _.each(req.body.actions, function (value, key) {
    var params = {
      gameBoardId: value.gameBoardId,
      whichPieceId: parseInt(value.whichPiece),
      whereId: value.where
    };

    var promise = BasicMoveAction.validateMoveActionQ(params)
      .then(function (gameBoard) {
        console.log('valid move action: ');
        console.log(params);
        return BasicMoveAction.doMoveActionToGameBoardStateQ(gameBoard, params);
      })
      .fail(function (err) {
        console.log('invalid action: ' + key);
        throw 'action ' + key + ': ' + err;
      });

    promiseArray.push(promise);
  });

  Q.all(promiseArray)
    .then(function () {
      res.status(200).send({msg: "ITS TRUE"})
    })
    .fail(function (err) {
      res.status(400).send({err: err});
    });

};
