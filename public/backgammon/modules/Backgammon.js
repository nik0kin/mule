
define(['../../mule-js-sdk/sdk'], function (sdk) {
  return function (myPlayerRel, whosTurn, gameState, boardDisplayObject, enableSubmitButtonCallback) {
    var that = {},
      SDK = sdk('../../'),
      myRelId = myPlayerRel,
      currentGameState = gameState,
      board = boardDisplayObject,

      bgState, // awaitingRoll, rolled (includes if you have pending moves), waitingOnOpponent
      lastRoll = {};

    var init = function () {
      if (whosTurn === myRelId) {
        bgState = 'awaitingRoll';
        board.showShaker();
      } else {
        bgState = 'waitingOnOpponent';
      }
      lastRoll = currentGameState.globalVariables.roll;
      showRoll();
    };

    var showRoll = function () {
      board.showRoll(lastRoll);
    };

    var turnSubmittedIsMine = function (turn) { // TODO find some real names for these functions
        // it was my turn, so now its their turn, so display their roll
        bgState = 'waitingOnOpponent';
        lastRoll = turn.metadata.roll;
        showRoll();
    };

    var clickShaker = function () {
      // show dice
      showRoll();
      // enable submit button
      enableSubmitButtonCallback(true);

      bgState = 'rolled';
      board.showShaker(false);
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
      lastRoll = turn.metadata.roll;
    };

    that.getPendingTurn = function () {
      return pendingTurn;
    };

    that.setTurnDone = function () {
      pendingTurn = null;
    }

    that.resetPendingTurn = function () {
    };

    var spaceClicked, pieceClicked, pendingTurn;
    var clickedMovableSpace = function (spaceId) {
      if (!spaceClicked) {
        pieceClicked = SDK.GameBoards.getPiecesOnSpace(gameState, spaceId)[0];
        if (pieceClicked) {
          spaceClicked = spaceId;
          console.log('clicked to move from ' + spaceId + ', piece: ' + pieceClicked.id);
        }
      } else {
        var distance = Math.abs(parseInt(spaceId) - parseInt(spaceClicked));
        if (distance === lastRoll.die1 || distance === lastRoll.die2) {
          console.log('clicked to move to ' + spaceId);
          board.moveToken(pieceClicked.id, spaceClicked, spaceId);
          spaceClicked = false

          // set pending turn
          pendingTurn = {
            pieceId: pieceClicked.id,
            spaceId: spaceId
          }
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