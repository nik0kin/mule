
define(['connectX', "../mule-js-sdk/sdk", "../dumbLib"],
    function (connectX, sdk, dumbLib) {
  var SDK = sdk('../../'),
    currentUser = {},
    opponentRel,
    playerMap,
    currentGameBoard,
    currentGame,
    currentHistory,
    currentTurn,
    firstLoad = true;

  var current = {
    whosTurn: undefined,
    isGameOver: false
  };

  var initGame = function (selectSpaceId) {
    dumbLib.loadGameIdAndPlayerRelFromURL(function (result) {
      currentGame = {_id: result.gameId };
      currentUser.playerRel = result.playerRel;
      opponentRel = currentUser.playerRel === 'p1' ? 'p2' : 'p1';

      refreshGame();
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

    SDK.Games.readQ(currentGame._id)
      .done(function(game) {
        currentGame = game;

        checkWin();

        SDK.Historys.readGamesHistoryQ(currentGame._id)
          .done(function(history) {
            currentHistory = history;
            var newTurn = currentTurn !== currentHistory.currentTurn;
            if (!newTurn) { return; }
            currentTurn = currentHistory.currentTurn;

            SDK.Games.getPlayersMapQ(currentGame)
              .then(function (_playerMap) {

                _.each(currentGame.players, function (value, key) {
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
                  SDK.GameStates.readGamesStateQ(currentGame._id)
                    .then(function (gameState) {
                      connectX.initBoard(gameState, currentGame.ruleBundleGameSettings.customBoardSettings, currentUser.playerRel);
                      firstLoad = false;
                      SDK.Historys.markAllTurnsRead(currentHistory);
                    });
                } else {
                  //look at last turn
                  //var t = SDK.Historys.getLastUnreadTurn(currentHistory);
                  SDK.Turns.readGamesTurnQ(currentGame._id, currentTurn - 1)
                  .then(function (turn) {
                    if (!turn) { return; }
                    if (turn.playerTurns[opponentRel]) {
                      connectX.receiveOpponentTurn(turn.playerTurns[opponentRel]);
                    }
                  });
                }

                console.log('refreshed');
              });
          });
      });

    if (!current.isGameOver) {
      setTimeout(refreshGame, 1000);
    }
  };

  var submitTurn = function (whereX) {
    var params = {
      gameId: currentGame._id,
      actions: [{
        type: 'DropToken',
        params: {
          xDropLocation: whereX
        }
      }]
    };

    SDK.PlayTurn.sendQ(params)
      .then(function (result) {
        console.log('Submitted turn');
        console.log(result);
        // refresh?
        counter = 0;

        //connectRenderer.dropPiece();
      })
      .fail(function (err) {
        alert(JSON.stringify(err));
      })
  };

  var populatePlayersLabel = function () {

    var p1Name = playerMap['p1'].name;
    var p2Name = playerMap['p2'].name;

    if (currentUser.playerRel === 'p1') {
      p1Name = '<b>' + p1Name + '</b>';
    } else if (currentUser.playerRel === 'p2') {
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

    current.whosTurn = whosTurn;

    var yourOrTheir = (whosTurn === currentUser.playerRel) ? 'Your' : 'Their';

    $('#turnStatusLabel').html(yourOrTheir + ' Turn');
  };

  var checkWin = function () {
    _.each(currentGame.players, function (playerInfo, playerRel) {
      if (playerRel === currentUser.playerRel) {
        if (playerInfo.playerStatus === 'won') {
          populateWinConditionLabel(true);
          current.isGameOver = true;
        } else if (playerInfo.playerStatus === 'lost') {
          populateWinConditionLabel(false);
          current.isGameOver = true;
        }
      }
    });
  };

  var populateWinConditionLabel = function (didWin) {
    if (didWin) {
      $('#winConditionLabel').html('<b>WINNER</b>');
    } else {
      $('#winConditionLabel').html('<b>LOSER</b>');
    }
  };

  connectX.init(submitTurn, current);
  initGame();
});
