
var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  PieceState = require('mule-models').PieceState.Model,
  actionsHelper = require('../actionsHelper');


exports.validateQ = function (gameBoardId, params, ruleBundleObject) {
  return GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      return gameBoard.populateQ('spaces');
    })
    .then(function (gameBoard) {
      return gameBoard.populateQ('pieces');
    })
    .then(function (gameBoard) {
      var space = actionsHelper.searchThruSpacesForId(gameBoard.spaces, params.whereId);

      if (!gameBoard.playerVariables[params.playerRel]) {
        throw "INVALID playerRel";
      }

      if (!space) {
        throw 'INVALID SPACE';
      }

      //TODO make getting boardspace easy
      //var boardSpace = getBoardSpace(space.boardSpaceId); //boardSpace location depends on boardType(static/built)
      //ruleBundleObject.getSpaceClass(space.class)

      var getPiecesOnSpace = function (spaceId) {
        var array = [];
        _.each(gameBoard.pieces, function (piece) {
          if (spaceId === piece.locationId) {
            array.push(piece)
          }
        });

        return array;
      };
      // cheating right now
      if (getPiecesOnSpace(space.boardSpaceId).length > 0) {
        throw 'SPACE IS FULL';
      }
    });
};

exports.doQ = function (gameBoard, params) {
  console.log('new piece, ' + params.playerRel + ' at ' + params.whereId);

  var newPieceState = new PieceState({
    'class': (params.playerRel === 'p1') ? 'O' : 'X',
    attributes: {},
    id: Math.floor((Math.random() * 9999999) + 1), //BAD
    ownerId: params.playerRel,
    locationId: params.whereId
  }), savedId;

  return newPieceState.saveQ()
    .then(function (savedPieceState) {
      savedId = savedPieceState._id;
      return GameBoard.findByIdQ(gameBoard._id);
    })
    .then(function (gameBoard) { // TODO make this better, and in another place
      gameBoard.pieces.push(savedId);
      gameBoard.markModified('pieces');

      return gameBoard.saveQ();
    })

};
