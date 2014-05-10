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

    that.readQ = function (gameBoardID) {
      return $.ajax({
        type: "GET",
        url: contextPath+"gameBoards/" + gameBoardID
      })
        .then(function (result) {
          that.fakeCacheWrite(result);
          return result;
        });
    };

    that.readGamesBoardQ = function (gameID) {
      return $.ajax({
        type: "GET",
        url: contextPath+"games/" + gameID + '/board'
      });
    };

    ////// CACHING //////
    that.gameBoardsCache = {};

    that.fakeCacheWrite = function (result) {
      that.gameBoardsCache[result._id] = result;
    };

    that.readCacheQ = function (gameBoardID) {
      return Q.promise(function (reject, resolve) {
        if (that.gameBoardsCache[gameBoardID]) {
          resolve(that.gameBoardsCache[gameBoardID]);
        } else {
          that.readQ(gameBoardID)
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
    that.getFullSpaceInfo = function (gameBoard, spaceId) {
      var foundSpace;

      _.each(gameBoard.board, function (value) {
        if (value.id === spaceId) {
          foundSpace = _.clone(value);
        }
      });

      if (!foundSpace) {
        return undefined;
      }

      _.each(gameBoard.spaces, function (value) {
        if (value.boardSpaceId === spaceId) {
          foundSpace.attributes = value.attributes;
        }
      });

      return foundSpace;
    };

    return that;
  };
});