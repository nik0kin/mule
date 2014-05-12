
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

      return Q(gameBoard);
    });
};

exports.doMoveActionToGameBoardStateQ = function (gameBoard, params) {
  var promises = [];
  var piece = searchThruPiecesForId(gameBoard.pieces, params.whichPieceId);

  var id = piece._doc._id;
  delete piece._doc._id;

  piece.locationId = params.whereId;
  console.log(piece.id + ' has new location ' + piece.locationId);

  promises.push(PieceState.findByIdAndUpdateQ(id, piece._doc));

  return Q.all(promises);
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
  var found = false;
  _.each(pieces, function (value, key) {
    if (value.id === pieceId) {
      found = value;
    }
  });
  return found;
};
