/**
 * js-sdk/models/GameBoards.js
 *
 */

define([], function () {
  return function (contextPath) {
    var that = {};

    that.indexQ = function () {
      return $.ajax({
        type: "GET",
        url: contextPath+"gameBoards"
      });
    };

    that.readQ = function (gameBoardId) {
      return $.ajax({
        type: "GET",
        url: contextPath+"gameBoards/" + gameBoardId
      })
        .then(function (result) {
          that.fakeCacheWrite(result);
          return result;
        });
    };

    that.readGamesBoardQ = function (gameId) {
      return $.ajax({
        type: "GET",
        url: contextPath+"games/" + gameId + '/board'
      });
    };

    ////// CACHING //////
    that.gameBoardsCache = {};

    that.fakeCacheWrite = function (result) {
      that.gameBoardsCache[result._id] = result;
    };

    that.readCacheQ = function (gameBoardId) {
      return Q.promise(function (reject, resolve) {
        if (that.gameBoardsCache[gameBoardId]) {
          resolve(that.gameBoardsCache[gameBoardId]);
        } else {
          that.readQ(gameBoardId)
            .done(function (result) {
              that.gameBoardsCache[result._id] = result;
              resolve(result);
            }, function (err) {
              console.log('WTF')
              resolve(err)
            });
        }
      });
    };

    //combines gameboard.board and gameboard.spaces (really just adds attributes)
    that.getFullSpaceInfo = function (gameBoard, gameState, spaceId) {
      var foundSpace;

      _.each(gameBoard.board, function (value) {
        if (value.id === spaceId) {
          foundSpace = _.clone(value);
        }
      });

      if (!foundSpace) {
        return undefined;
      }

      _.each(gameState.spaces, function (value) {
        if (value.boardSpaceId === spaceId) {
          foundSpace.attributes = value.attributes;
        }
      });

      return foundSpace;
    };

    that.getPiecesOnSpace = function (gameState, spaceId) {
      var pieces = [];

      _.each(gameState.pieces, function (value) {
        if (value.locationId === spaceId) {
          pieces.push(value);
        }
      });

      return pieces;
    };

    that.getPiecesByOwnerIdOnSpaceId = function (gameState, spaceId, ownerId) {
      return _.filter(gameState.pieces, function (piece) {
        return piece.locationId === spaceId && piece.ownerId === ownerId;
      });
    };

    that.getPiecesFromId = function (gameState, pieceId) {
      return _.find(gameState.pieces, function (piece) {
        return pieceId === piece.id;
      });
    };

    that.createFullBoard = function (board, pieces) {
      var fullBoard = _.clone(board);

      _.each(fullBoard, function (boardSpace) {
        boardSpace.pieces = [];
        _.each(pieces, function (piece) {
          if (boardSpace.id === piece.locationId) {
            boardSpace.pieces.push(piece);
          }
        });
      });

      return fullBoard;
    };

    that.getClassesFromPieces = function (gameState, className) {
      var found = [];

      _.each(gameState.pieces, function (value, key) {
        if (value.class === className) {
          found.push(value);
        }
      });

      return found;
    };

    return that;
  };
});