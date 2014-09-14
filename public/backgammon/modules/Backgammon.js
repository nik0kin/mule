
define(['../../mule-js-sdk/sdk', 'BackgammonLogic'], function (sdk, bgLogic) {
  return function (myPlayerRel, whosTurn, gameState, boardDisplayObject, enableSubmitButtonCallback) {
    var that = {},
      SDK = sdk('../../'),
      myRelId = myPlayerRel, opponentRelId = (myRelId === 'p1') ? 'p2' : 'p1',
      currentGameState = gameState,
      board = boardDisplayObject,

      bgState, // awaitingRoll, rolled (includes if you have pending moves), waitingOnOpponent
      lastRoll = {}, rollsLeft = [];

    var init = function () {
      if (whosTurn === myRelId) {
        bgState = 'awaitingRoll';
        board.showShaker();
      } else {
        bgState = 'waitingOnOpponent';
      }
      lastRoll = currentGameState.globalVariables.roll;
      setPlayerRoll();

      showRoll();
    };

    var isDoubles = function () {
      return lastRoll.die1 === lastRoll.die2;
    };

    var showRoll = function () {
      board.showRoll(lastRoll);
    };

    var setPlayerRoll = function () {
      rollsLeft = [lastRoll.die1, lastRoll.die2];
      if (isDoubles()) {
        rollsLeft.push(lastRoll.die1, lastRoll.die2);
      }
      console.log('setRollsLeft: ' + JSON.stringify(rollsLeft));
    };

    var removeRolls = function (rollsUsed) {
      _.each(rollsUsed, function (roll) {
        rollsLeft.splice(_.indexOf(rollsLeft, roll), 1);
      });
    };

    var getOnePieceIdOnSpace = function (spaceId) {
      var gameStatePieces = SDK.GameBoards.getPiecesOnSpace(gameState, spaceId),
        pendingPieces = getPieceIdsFromPendingMoveLocation(spaceId),
        requiredColor = myRelId === 'p1' ? 'black' : 'red';

      if (pendingPieces.length > 0) {
        return pendingPieces[0];
      } else if (gameStatePieces.length > 0 && gameStatePieces[0].attributes.color === requiredColor) {
        return gameStatePieces[0].id;
      } else {
        return undefined;
      }
    };

    ////////// TURN LOGIC //////////

    var turnSubmittedIsMine = function (turn) { // TODO find some real names for these functions
        // it was my turn, so now its their turn, so display their roll
        bgState = 'waitingOnOpponent';
        //lastRoll = turn.metadata.roll;
        lastRoll = gameState.globalVariables.roll;
        showRoll();
    };

    var turnSubmittedIsOpponents = function (turn) {
      // move knocks
      _.each(turn.metadata.knockedPieces, function (info) {
        board.moveToken(info.pieceId, info.fromSpaceId, myRelId === 'p1' ? 'blackJail' : 'redJail');
      });

      _.each(turn.params.moveTokens, function (moveTokenActionParams) {
        var finalDestSpaceId = moveTokenActionParams.spaceIdz[moveTokenActionParams.spaceIdz.length - 1];
        board.moveToken(moveTokenActionParams.pieceId, moveTokenActionParams.currentPieceSpace, finalDestSpaceId);
        console.log('they moved a token from ' + moveTokenActionParams.currentPieceSpace + ' to ' + moveTokenActionParams.spaceId);
      })

      // it was their turn, so now its your turn, show the move then show shaker and allow rolling
      bgState = 'awaitingRoll';
      board.showShaker();
      //lastRoll = turn.metadata.roll;
      lastRoll = gameState.globalVariables.roll;
      setPlayerRoll();
    };

    var addPendingAction = function (action) {
      if (!pendingTurn.moveTokens) {
        pendingTurn.moveTokens = [];
      }

      var existingAction = _.find(pendingTurn.moveTokens, function (moveAction) {
        return moveAction.pieceId === action.pieceId;
      });
      if (existingAction) {
        existingAction.spaceIdz.push(action.spaceId);
      } else {
        pendingTurn.moveTokens.push({
          pieceId: action.pieceId,
          spaceIdz: [action.spaceId]
        });
      }

      // so we dont try to move it again from the olde location
      var piece = SDK.GameBoards.getPiecesFromId(gameState, action.pieceId);
      piece.locationId = action.spaceId;

      if (that.isPendingTurnComplete()) {
        // enable submit button
        enableSubmitButtonCallback(true);
      }
    };

    var getPieceIdsFromPendingMoveLocation = function (spaceId) {
      var pieceIds = [];

      if (pendingTurn.moveTokens) {
        _.each(pendingTurn.moveTokens, function (moveSubAction) {
          _.each(moveSubAction.spaceIdz, function (_spaceId) {
            if (_spaceId === spaceId) {
              pieceIds.push(moveSubAction.pieceId);
            }
          });
        });
      }

      return pieceIds;
    };

    // returns then .params of MoveAction
    that.getPendingTurn = function () {
      return pendingTurn;
    };

    // used all dice rolls
    that.isPendingTurnComplete = function () {
      var requiredActionsAmount = isDoubles() ? 4 : 2;

      var totalActions = (!pendingTurn.unjailMoveTokens ? 0 : pendingTurn.unjailMoveTokens.length);

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

    that.setTurnDone = function () {
      pendingTurn = {};
    }

    that.resetPendingTurn = function () {
    };

    ////////// UI INTERACTION //////////

    var clickShaker = function () {
      // show dice
      showRoll();

      bgState = 'rolled';
      board.showShaker(false);
    };

    var spaceClicked,
      pieceIdClicked,
      pendingTurn = {},
      possibleMoveLocations;
    var clickedMovableSpace = function (spaceId) {
      if (that.isPendingTurnComplete()) {
        return;
      }

      if (!spaceClicked) {
        // selection
        pieceIdClicked = getOnePieceIdOnSpace(spaceId);
        if (!isNaN(pieceIdClicked)) {
          spaceClicked = spaceId;
          console.log('clicked to move from ' + spaceId + ', piece: ' + pieceIdClicked);
          board.showSelection(spaceId);

          possibleMoveLocations = bgLogic.getPossibleMoveLocations({
            spaceId: spaceId,
            rollsLeft: rollsLeft,
            blackOrRed: myRelId === 'p1' ? 'black' : 'red'
          });

          var knockLocationIds = [],
            possibleMoveLocationsIds = _.filter(_.keys(possibleMoveLocations), function (pmlSpaceId) {
              var opponentTokensAtLoc = SDK.GameBoards.getPiecesByOwnerIdOnSpaceId(gameState, pmlSpaceId, opponentRelId);

              if (opponentTokensAtLoc.length === 1) { knockLocationIds.push(pmlSpaceId) };
              return opponentTokensAtLoc.length === 0;
            });

          board.showMoveLocationSpaces(possibleMoveLocationsIds);
          if (knockLocationIds.length > 0) {
            board.showKnockMoveLocationSpaces(knockLocationIds);
          }
        }
      } else {
        // unselection
        if (spaceClicked === spaceId) {
          console.log('unselecting');
          board.stopSelection();
          board.stopMoveLocationSpaces();
          board.stopKnockMoveLocationSpaces();
          spaceClicked = null;
          return;
        }

        // attempted movement
        var isMoveAllowed = false, 
          rollsUsed;
        _.each(possibleMoveLocations, function (_rollsUsed, moveLocationSpaceId) {
          if (moveLocationSpaceId === spaceId) {
            isMoveAllowed = true;
            rollsUsed = _rollsUsed;
          };
        });
        var opponentTokensOnDestSpace = SDK.GameBoards.getPiecesByOwnerIdOnSpaceId(gameState, spaceId, opponentRelId);
        if (isMoveAllowed && opponentTokensOnDestSpace.length <= 1) {
          console.log('clicked to move to ' + spaceId);

          if (opponentTokensOnDestSpace.length === 1) {
            // knock opponent token to jail
            console.log('knocking opponent');
            board.moveToken(opponentTokensOnDestSpace[0].id, spaceId, myRelId === 'p1' ? 'redJail' : 'blackJail');
          }
          board.moveToken(pieceIdClicked, spaceClicked, spaceId);

          spaceClicked = false;
          board.stopSelection();
          board.stopMoveLocationSpaces();
          board.stopKnockMoveLocationSpaces();

          // set pending turn
          addPendingAction({
            pieceId: pieceIdClicked,
            spaceId: spaceId
          });
          removeRolls(rollsUsed);

          console.log('pendingTurn: ');
          console.log(pendingTurn);
          console.log('rollsLeft: ');
          console.log(rollsLeft);
        } else {
          console.log('invalid spot');
        }
      }
    };

    that.clickSpace = function (space) {
      console.log('clicked space: ' + space);

      switch (bgState) {
        case 'awaitingRoll':
          if (space === 'dice') {
            clickShaker();
          }
          break;
        case 'rolled':
          if (!isNaN(parseInt(space))) {
            clickedMovableSpace(space);
          }
          break;
      }
    };

    /////////////////////////////

    that.updateGameState = function (_gameState) {
      gameState = _gameState;
    };

    that.parseTurn = function (playerRel, turn) {
      console.log('new turn fetched: ' + playerRel);
      turn = turn.actions[0];
      console.log(turn);

      if (playerRel === myRelId) {
        turnSubmittedIsMine(turn);
      } else {
        turnSubmittedIsOpponents(turn);
      }
    }
    init();
    return that;
  };
});