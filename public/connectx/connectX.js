
define(['connectRenderer'], function (connectRenderer) {
  var that = {};

  var Current,
    customBoardSettings,
    submitTurnCallback,
    myPlayerRel,
    opponentPlayerRel;

  var board;

  that.init = function (_submitTurnCallback, current) {
    submitTurnCallback = _submitTurnCallback;
    Current = current;
  };

  that.initBoard = function (gameState, _customBoardSettings, _myPlayerRel) {
    var pieces = gameState.pieces;
    connectRenderer.placeExistingPieces(pieces);
    myPlayerRel = _myPlayerRel;
    opponentPlayerRel = myPlayerRel === 'p1' ? 'p2' : 'p1';
    customBoardSettings = _customBoardSettings;
    connectRenderer.init(clickTopSpace, customBoardSettings);

    console.log(gameState);
    console.log(customBoardSettings);

    board = [];
    _(customBoardSettings.width).times(function () {
      var row = [];
      _(customBoardSettings.height).times(function () {
        row.push({});
      });
      board.push(row);
    });

    _.each(gameState.pieces, function (piece) {
      var l = toXY(piece.locationId);
      board[l.x-1][l.y-1].occupied = piece.ownerId;
    });

    connectRenderer.placeExistingPieces(board);

    if (myPlayerRel === Current.whosTurn) {
      showClickableColumns();
    }
  };

  that.receiveOpponentTurn = function (turn) {
    var dropTokenAction = turn.actions[0];
    console.log('recieve turn: ' + dropTokenAction.metadata.droppedToLocation);
    var l = toXY(dropTokenAction.metadata.droppedToLocation);
    connectRenderer.dropPiece(l.x, l.y, opponentPlayerRel);
    board[l.x-1][l.y-1].occupied = opponentPlayerRel;

    showClickableColumns();
  };

  var showClickableColumns = function () {
    var availableSpaces = [];
    var i;
    for (i=0; i<customBoardSettings.width; i++) {
      if (!board[i][0].occupied) {
        availableSpaces.push({x: i + 1, y: getLowestYInColumn(i+1)});
      }
    }
    connectRenderer.readyForDrop(availableSpaces);
  };

  var clickTopSpace = function (x, y) {
    return function () {
        if (myPlayerRel != Current.whosTurn) {
          return;
        }
        tryToDrop(x);
      };
  };

  var getLowestYInColumn = function (x) {
    var y = 1;
    if (board[x-1][y-1].occupied) {
      return 0;
    }

    // determine final location
    while (y+1 <= customBoardSettings.height && !board[x-1][y].occupied) {
      y++;
    }

    return y;
  };

  var tryToDrop = function (x) {
    var y = getLowestYInColumn(x);
    console.log('dropped to ' + x + '_' + y);

    board[x-1][y-1].occupied = myPlayerRel;
    connectRenderer.dropPiece(x, y, myPlayerRel);
    connectRenderer.stopReady();
    submitTurnCallback(x);
  };

  var toXY = function (locationId) {
    var l = locationId.split(',');
    return {x: Number(l[0]), y: Number(l[1])};
  };

  return that;
});
