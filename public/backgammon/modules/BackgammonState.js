

define(function () {
	return function (SDK, gameState, _playerRel) {
    var that = {},
      myRelId = _playerRel,
      originalGameState, // mule.GameState

      backgammonBoard, // not related to mule.Board
        /* pendingTurns will be reflected by changing a piece from:
            backgammonBoard[spaceId1][pieceId] to  backgammonBoard[spaceId2][pieceId]
          but the piece.locationId will remain where it originally was. look at changePendingPieceOnBackgammonBoard()
        */
      pendingTurn;

    that.setNewTurnState = function (_gameState) {
      originalGameState = _gameState;

      // reset pendintTurn
      pendingTurn = {
        moveTokens: []
      };

      // setup backgammonBoard
      backgammonBoard = {
        'redJail': {},
        'blackJail': {},
        'redScoreSpace': {},
        'blackScoreSpace': {}
      };
      _(24).times(function (num) {
        backgammonBoard[num + 1] = {};
      });
      _.each(originalGameState.pieces, function (piece) {
        backgammonBoard[piece.locationId][piece.id] = _.clone(piece);
      });

    };

    that.getCurrentRoll = function () { return originalGameState.globalVariables.roll; };

    ////// GOOD STUFF //////

    // gets ids of pieces that are moving to @param spaceId
    var getPieceIdsFromPendingMoveLocation = function (spaceId) {
      var pieceIds = [];

      if (pendingTurn.moveTokens) {
        _.each(pendingTurn.moveTokens, function (moveSubAction) {
          //_.each(moveSubAction.spaceIdz, function (_spaceId) {
            var finalSpaceId = moveSubAction.spaceIdz[moveSubAction.spaceIdz.length - 1];
            if (finalSpaceId === spaceId) {
              pieceIds.push(moveSubAction.pieceId);
            }
          //});
        });
      }

      return pieceIds;
    };


    // optional playerRel
    that.getPiecesOnSpace = function (spaceId, playerRel) {
      if (!spaceId) { throw 'missing spaceId from BGState.getPiecesOnSpace()'; }

      var pieces = _.filter(backgammonBoard[spaceId], function (bgSpacePiece) {
        return !playerRel || bgSpacePiece.ownerId === playerRel;
      });

      return pieces;
    };

    that.getPieceById = function (pieceId) {

    };

    //////////////////

    var changePendingPieceOnBackgammonBoard = function (fromSpaceId, toSpaceId, pieceId) {
      var piece = backgammonBoard[fromSpaceId][pieceId];

      backgammonBoard[toSpaceId][pieceId] = piece;

      delete backgammonBoard[fromSpaceId][pieceId];
    };

    that.getPendingTurn = function () { return pendingTurn; }

    that.addPendingMoveAction = function (subMoveAction, knockedEnemyToken) {

      var existingAction = _.find(pendingTurn.moveTokens, function (moveAction) {
        return moveAction.pieceId === subMoveAction.pieceId;
      }),
        currentPieceSpaceId;
      if (existingAction) {
        currentPieceSpaceId = existingAction.spaceIdz[existingAction.spaceIdz.length - 1];
        existingAction.spaceIdz.push(subMoveAction.spaceId);
      } else {
        // EFF do we have to use SDK here. We don't know the pieces location otherwise
        currentPieceSpaceId = SDK.GameBoards.getPiecesFromId(originalGameState, subMoveAction.pieceId).locationId;
        pendingTurn.moveTokens.push({
          pieceId: subMoveAction.pieceId,
          spaceIdz: [subMoveAction.spaceId]
        });
      }

      changePendingPieceOnBackgammonBoard(currentPieceSpaceId, subMoveAction.spaceId, subMoveAction.pieceId);

      if (knockedEnemyToken) {
        var knockedPieceSpaceId = SDK.GameBoards.getPiecesFromId(originalGameState, knockedEnemyToken.pieceId).locationId;
        changePendingPieceOnBackgammonBoard(knockedPieceSpaceId, knockedEnemyToken.jailSpaceId, knockedEnemyToken.pieceId);
      }
    };

    // used all dice rolls
    that.isPendingTurnComplete = function (isDoubles) { //TODO take the roll as a parameter, and actually check it better
      var requiredActionsAmount = isDoubles ? 4 : 2;

      var totalActions = 0;

      if (pendingTurn.moveTokens) {
        _.each(pendingTurn.moveTokens, function (moveSubAction) {
          if (moveSubAction.spaceIdz) {
            totalActions += moveSubAction.spaceIdz.length;
          } else if (moveSubAction.spaceId) {
            totalActions += 1;
          }
        });
      }

      // TODO if cant unjail

      return requiredActionsAmount === totalActions;
    };
    that.setNewTurnState(gameState);
    return that;
  };
});
