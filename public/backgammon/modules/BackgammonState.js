

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
      pendingTurn,

      pendingScore,
      myScore, //gets updated every Turn
      myScoreSpaceId = (myRelId === 'p1') ? 'blackScoreSpace' : 'redScoreSpace';

    that.setNewTurnState = function (_gameState) {
      myScore = 0;
      pendingScore = 0;

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

        if (piece.locationId === myScoreSpaceId) {
          myScore++;
        }
      });

    };

    that.getCurrentRoll = function () { return originalGameState.globalVariables.roll; };

    ////// GOOD STUFF //////

    // gets ids of pieces that are moving to @param spaceId
    var getPieceIdsFromPendingMoveLocation = function (spaceId) {
      var pieceIds = [];

      if (pendingTurn.moveTokens) {
        _.each(pendingTurn.moveTokens, function (moveSubAction) {
          //_.each(moveSubAction.spaceId, function (_spaceId) {
            var finalSpaceId = moveSubAction.spaceId[moveSubAction.spaceId.length - 1];
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

    that.getGammonAreaPieceArray = function (playerRelSide, playerRel) {
      var gammonArea;
      // EFF this function :(
      if (playerRelSide === 'p1') {
        gammonArea = [
          that.getPiecesOnSpace('1', playerRel),
          that.getPiecesOnSpace('2', playerRel),
          that.getPiecesOnSpace('3', playerRel),
          that.getPiecesOnSpace('4', playerRel),
          that.getPiecesOnSpace('5', playerRel),
          that.getPiecesOnSpace('6', playerRel)
        ];
      } else {
        gammonArea = [
          that.getPiecesOnSpace('24', playerRel),
          that.getPiecesOnSpace('23', playerRel),
          that.getPiecesOnSpace('22', playerRel),
          that.getPiecesOnSpace('21', playerRel),
          that.getPiecesOnSpace('20', playerRel),
          that.getPiecesOnSpace('19', playerRel)
        ];
      }
      return gammonArea;
    };

    //////////////////

    // always the user
    that.isPlayerReadyToScore = function () {
      var gammonAreaPieces = that.getGammonAreaPieceArray(myRelId, myRelId),
        count = 0;

      _.each(gammonAreaPieces, function (gammonSpacePieces) {
        count += gammonSpacePieces.length;
      });

      return (count + myScore + pendingScore) === 15;
    };

    ///////// PENDING STUFF /////////

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
        currentPieceSpaceId = existingAction.spaceId[existingAction.spaceId.length - 1];
        existingAction.rollUsed.push(subMoveAction.rollUsed);
        existingAction.spaceId.push(subMoveAction.spaceId);
      } else {
        // EFF do we have to use SDK here? We don't know the pieces location otherwise
        currentPieceSpaceId = SDK.GameBoards.getPiecesFromId(originalGameState, subMoveAction.pieceId).locationId;
        pendingTurn.moveTokens.push({
          pieceId: subMoveAction.pieceId,
          rollUsed: [subMoveAction.rollUsed],
          spaceId: [subMoveAction.spaceId]
        });
      }

      changePendingPieceOnBackgammonBoard(currentPieceSpaceId, subMoveAction.spaceId, subMoveAction.pieceId);

      if (knockedEnemyToken) {
        var knockedPieceSpaceId = SDK.GameBoards.getPiecesFromId(originalGameState, knockedEnemyToken.pieceId).locationId;
        changePendingPieceOnBackgammonBoard(knockedPieceSpaceId, knockedEnemyToken.jailSpaceId, knockedEnemyToken.pieceId);
      }

      if (subMoveAction.spaceId === myScoreSpaceId) {
        pendingScore++;
      }
    };

    // used all dice rolls
    that.isPendingTurnComplete = function (isDoubles) { //TODO take the roll as a parameter, and actually check it better
      var requiredActionsAmount = isDoubles ? 4 : 2;

      var totalActions = 0;

      if (pendingTurn.moveTokens) {
        _.each(pendingTurn.moveTokens, function (moveSubAction) {
          if (moveSubAction.spaceId) {
            totalActions += moveSubAction.spaceId.length;
          } else if (moveSubAction.spaceId) {
            totalActions += 1;
          }
        });
      }

      // TODO if cant unjail

      return requiredActionsAmount === totalActions;
    };

    /////////////////////////////////////

    that.setNewTurnState(gameState);
    return that;
  };
});
