
define(['../../mule-js-sdk/sdk', 'BackgammonLogic'], function (sdk, bgLogic) {
  return function (myPlayerRel, whosTurn, gameState, boardDisplayObject, enableSubmitButtonCallback) {
    var that = {},
      SDK = sdk('../../'),
      myRelId = myPlayerRel,
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
        requiredColor = myRelId === 'p1' ? 'black' : 'red';
      if (gameStatePieces.length > 0 && gameStatePieces[0].attributes.color === requiredColor) {
        return gameStatePieces[0].id;
      } else {
        return getPieceIdsFromPendingMoveLocation(spaceId)[0];
      }
    };

    ////////// TURN LOGIC //////////

    var turnSubmittedIsMine = function (turn) { // TODO find some real names for these functions
        // it was my turn, so now its their turn, so display their roll
        bgState = 'waitingOnOpponent';
        //lastRoll = turn.metadata.roll;
        lastRoll = gameState.globalVariables.roll;
    };

    var turnSubmittedIsOpponents = function (turn) {
      var opponentRel = myRelId === 'p1' ? 'p2' : 'p1';
      _.each(turn.params.moveTokens, function (moveTokenActionParams) {
        board.moveToken(moveTokenActionParams.pieceId, moveTokenActionParams.currentPieceSpace, moveTokenActionParams.spaceId);
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

      // TODO split it up if it uses multiple dice

      pendingTurn.moveTokens.push(action);

      if (that.isPendingTurnComplete()) {
        // enable submit button
        enableSubmitButtonCallback(true);
      }
    };

    var getPieceIdsFromPendingMoveLocation = function (spaceId) {
      var pieceIds = [];

      if (pendingTurn.unjailMoveTokens) {
        _.each(pendingTurn.unjailMoveTokens, function (move) {
          if (move.spaceId === spaceId) {
            pieceIds.push(move.pieceId);
          }
        });
      }

      if (pendingTurn.moveTokens) {
        _.each(pendingTurn.moveTokens, function (move) {
          if (move.spaceId === spaceId) {
            pieceIds.push(move.pieceId);
          }
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

      var totalActions = (!pendingTurn.unjailMoveTokens ? 0 : pendingTurn.unjailMoveTokens.length) 
        + (!pendingTurn.moveTokens ? 0 : pendingTurn.moveTokens.length);

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
          board.showMoveLocationSpaces(_.keys(possibleMoveLocations));
        }
      } else {
        // unselection
        if (spaceClicked === spaceId) {
          console.log('unselecting');
          board.stopSelection();
          board.stopMoveLocationSpaces();
          spaceClicked = null;
          return;
        }

        // attempted movement
        var isMoveAllowed = false, rollsUsed
        _.each(possibleMoveLocations, function (_rollsUsed, moveLocationSpaceId) {
          if (moveLocationSpaceId === spaceId) {
            isMoveAllowed = true;
            rollsUsed = _rollsUsed;
          };
        });
        if (isMoveAllowed) {
          console.log('clicked to move to ' + spaceId);
          board.moveToken(pieceIdClicked, spaceClicked, spaceId);
          spaceClicked = false;
          board.stopSelection();
          board.stopMoveLocationSpaces();

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