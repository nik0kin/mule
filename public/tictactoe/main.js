/**
 * http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene
 * http://stemkoski.github.io/Three.js/#mouse-click
 */

define(['tttRenderer', "../mule-js-sdk/sdk", "../dumbLib"], function (tttRenderer, sdk, dumbLib) {
  var SDK = sdk('../../'),
    currentUser = {},
    playerMap,
    currentGameBoard,
    currentGame,
    currentHistory,
    currentActions,
    isGameOver = false,
    firstLoad = true;

  var initGame = function (selectSpaceId) {
    dumbLib.loadGameIdAndPlayerRelFromURL(function (result) {
      var gameId = result.gameId;
      currentUser.relId = result.playerRel;

      SDK.Games.readQ(gameId)
        .done(function(game) {
          currentGame = game;

          refreshGame();
        });
    });
  };

  var counter = 0, timerCount = 5;
  var refreshGame = function () {
    counter--;
    $('#refreshLabel').html('refresh...' + counter);

    if (counter > 0) {
      setTimeout(refreshGame, 1000);
      return;
    } else {
      counter = timerCount;
    }

    SDK.Historys.readGamesHistoryQ(currentGame._id)
      .done(function(history) {
        currentHistory = history;

        SDK.Games.getPlayersMapQ(currentGame)
          .then(function (_playerMap) {

            _.each(game.players, function (value, key) {
              _playerMap[key].played = currentHistory.currentTurnStatus[key];
            });

            playerMap = _playerMap;
            populatePlayersLabel();
            populateTurnStatusLabel();
          });

        SDK.GameBoards.readGamesBoardQ(currentGame._id)
          .done(function(gameBoard) {
            var fullBoard = SDK.GameBoards.createFullBoard(gameBoard.board, gameBoard.pieces);
            currentGameBoard = gameBoard;

            if (firstLoad) {
              populateBoard(gameBoard);
              firstLoad = false;
            }

            console.log('refreshed');
          });
      });

    if (!isGameOver) {
      setTimeout(refreshGame, 1000);
    }
  };

  var populateBoard = function (fullBoard) {
    console.log(fullBoard);
    tttRenderer.placeExistingPieces();
  };

  var clickSpaceCallback = function (space) {
    if (!space || space.x < 0 || space.x > 2 || space.y < 0 || space.y > 2) {
      return;
    }

    console.log('clicked space: ' + space.x + ', ' + space.y);
    tttRenderer.placePiece();
  };

  var submitTurn = function () {
    var params = {
      gameId: currentGame._id,
      actions: currentActions
    };
    SDK.PlayTurn.sendQ(params)
      .then(function (result) {
        console.log(result);
        // refresh?
        initGame();
      })
      .fail(function (err) {
        alert(JSON.stringify(err));
      });
  };

  var populatePlayersLabel = function () {

    var p1Name = playerMap['p1'].name;
    var p2Name = playerMap['p2'].name;

    if (currentUser.relId === 'p1') {
      p1Name = '<b>' + p1Name + '</b>';
    } else if (currentUser.relId === 'p2') {
      p2Name = '<b>' + p2Name + '</b>';
    }

    $('#playersLabel').html(p1Name + ' vs ' + p2Name);
  };

  var populateTurnStatusLabel = function () {
    var whosTurn;

    if (!playerMap['p1'].played) {
      whosTurn = 'p1';
    } else {
      whosTurn = 'p2';
    }

    var yourOrTheir = (whosTurn === currentUser.relId) ? 'Your' : 'Their';

    $('#turnStatusLabel').html(yourOrTheir + ' Turn');
  };

  tttRenderer.initBasicScene(clickSpaceCallback);
  initGame();
});