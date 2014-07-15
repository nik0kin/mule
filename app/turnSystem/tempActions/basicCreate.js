
var _ = require('lodash'),
  Q = require('q');

var GameState = require('mule-models').GameState.Model,
  PieceState = require('mule-models').PieceState.Model,
  actionsHelper = require('mule-utils/actionsUtils');


exports.validateQ = function (gameBoardId, params, ruleBundleObject) {
  return GameBoard.findByIdWithPopulatedStatesQ(gameBoardId)
    .then(function (gameBoard) {
      var space = actionsHelper.searchThruSpacesForId(gameBoard.gameState.spaces, params.whereId);

      if (!gameBoard.gameState.playerVariables[params.playerRel]) {
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
        _.each(gameBoard.gameState.pieces, function (piece) {
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

exports.doQ = function (gameState, params) {
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
      return GameState.findByIdQ(gameState._id);
    })
    .then(function (gameState) { // TODO make this better, and in another place
      gameState.pieces.push(savedId);
      gameState.markModified('pieces');

      return gameState.saveQ();
    })

};
