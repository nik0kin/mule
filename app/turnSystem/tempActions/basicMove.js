
var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  PieceState = require('mule-models').PieceState.Model,
  actionsHelper = require('../actionsHelper');


exports.validateQ = function (gameBoardId, params) {
  return GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      return gameBoard.populateQ('spaces');
    })
    .then(function (gameBoard) {
      return gameBoard.populateQ('pieces');
    })
    .then(function (gameBoard) {
      var piece = actionsHelper.searchThruPiecesForId(gameBoard.pieces, params.whichPieceId);
      var space = actionsHelper.searchThruSpacesForId(gameBoard.spaces, params.whereId);

      if (!piece) {
        throw "INVALID PIECE";
      }

      if (!space) {
        throw 'INVALID SPACE';
      }

    });
};

exports.doQ = function (gameBoard, params) {
  var piece = actionsHelper.searchThruPiecesForId(gameBoard.pieces, params.whichPieceId);

  var id = piece._id;
  //delete piece._doc._id;

  var updatePiece = _.clone(piece._doc);
  delete updatePiece._id;

  updatePiece.locationId = params.whereId;
  console.log(updatePiece.id + ' has new location ' + updatePiece.locationId);

  return PieceState.findByIdAndUpdateQ(id, updatePiece)
    .fail (function (err) {
    console.log('failed doing basic move action: ');
    console.log(err);
  });
};
