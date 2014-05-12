
var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  PieceState = require('mule-models').PieceState.Model;


exports.validateMoveActionQ = function (params) {
  return GameBoard.findByIdQ(params.gameBoardId)
    .then(function (gameBoard) {
      return gameBoard.populateQ('spaces');
    })
    .then(function (gameBoard) {
      return gameBoard.populateQ('pieces');
    })
    .then(function (gameBoard) {
      var piece = searchThruPiecesForId(gameBoard.pieces, params.whichPieceId);
      var space = searchThruSpacesForId(gameBoard.spaces, params.whereId);

      if (!piece) {
        throw "INVALID PIECE";
      }

      if (!space) {
        throw 'INVALID SPACE';
      }

    });
};

exports.doMoveActionToGameBoardStateQ = function (gameBoard, params) {
  var piece = searchThruPiecesForId(gameBoard.pieces, params.whichPieceId);

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

// Todo refactor into a smarter place?
var searchThruSpacesForId = function (spaces, spaceId) {
  var found = false;
  _.each(spaces, function (value, key) {
    if (value.boardSpaceId === spaceId) {
      found = value;
    }
  });
  return found;
};

var searchThruPiecesForId = function (pieces, pieceId) {
  if (typeof pieceId === 'string') {
    pieceId = parseInt(pieceId);
  }
  var found = false;
  _.each(pieces, function (value, key) {
    if (value.id === pieceId) {
      found = value;
    }
  });
  return found;
};
