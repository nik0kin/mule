
define([], function () {
  return function (myPlayerRel, whosTurn, gameState, boardDisplayObject, enableSubmitButtonCallback) {
    var that = {},
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
        // it was their turn, so now its your turn, show the move then show shaker and allow rolling
        bgState = 'awaitingRoll';
        board.showShaker();
        lastRoll = turn.metadata.roll;
    };

    that.clickSpace = function (space) {
      console.log('clicked space: ' + space);

      switch (bgState) {
        case 'awaitingRoll':
          if (space === 'dice') {
            clickShaker();
          }
        break;
      }
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