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
    isGameOver = false,
    firstLoad = true;

  var initGame = function (selectSpaceId) {
    dumbLib.loadGameIdAndPlayerRelFromURL(function (result) {
      currentGame = {_id: result.gameId };
      currentUser.relId = result.playerRel;

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
                  populateBoard(gameBoard);
                  firstLoad = false;
                  SDK.Historys.markAllTurnsRead(currentHistory);
                } else {
                  //look at last turn
                  var t = SDK.Historys.getLastUnreadTurn(currentHistory);
                  if (t) {
                    receiveOpponentTurn(t);
                  }
                }

                console.log('refreshed');
              });
          });
      });

    if (!isGameOver) {
      setTimeout(refreshGame, 1000);
    }
  };

  var whereMap = {
    '0_0': 'topLeft',
    '1_0': 'topMiddle',
    '2_0': 'topRight',
    '0_1': 'middleLeft',
    '1_1': 'middleMiddle',
    '2_1': 'middleRight',
    '0_2': 'bottomLeft',
    '1_2': 'bottomMiddle',
    '2_2': 'bottomRight'
  }, invertWhereMap = _.invert(whereMap);

  var populateBoard = function (fullBoard) {
    var tttPieces = fullBoard.pieces.map(function (p) {
      var l = invertWhereMap[p.locationId].split('_');

      return {
        position: {
          x: l[0],
          y: l[1]
        },
        'class': p.class
      };
    });
    tttRenderer.placeExistingPieces(tttPieces);
  };

  var receiveOpponentTurn = function (turn) {
    var createAction = turn.actions[0];

    var space = invertWhereMap[createAction.params.whereId].split('_');
    var _class = (createAction.params.playerRel === 'p1') ? 'O' : 'X';

    tttRenderer.placePiece({x: space[0], y: space[1]}, _class);
  };

  var clickSpaceCallback = function (space) {
    if (!space || space.x < 0 || space.x > 2 || space.y < 0 || space.y > 2) {
      return;
    }

    console.log('clicked space: ' + space.x + ', ' + space.y);

    submitTurn(whereMap[space.x + '_' + space.y]);
  };

  var submitTurn = function (whereId) {
    var params = {
      playerId: currentUser.relId, //cheating here too
      gameId: currentGame._id,
      actions: [{
        type: 'BasicCreate',
        params: {
          playerRel: currentUser.relId, //TODO change to not needing this on the backend
          whereId: whereId
        }
      }]
    };

    SDK.PlayTurn.sendQ(params)
      .then(function (result) {
        console.log('Submitted turn');
        console.log(result);
        // refresh?
        counter = 0;
        var space = invertWhereMap[whereId].split('_');
        var _class = (currentUser.relId === 'p1') ? 'O' : 'X';
        tttRenderer.placePiece({x: space[0], y: space[1]}, _class);
      })
      .fail(function (err) {
        alert(JSON.stringify(err));
      })
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

  var checkWin = function () {
    _.each(currentGame.players, function (playerInfo, playerRel) {
      if (playerRel === currentUser.relId) {
        if (playerInfo.playerStatus === 'won') {
          populateWinConditionLabel(true);
          isGameOver = true;
        } else if (playerInfo.playerStatus === 'lost') {
          populateWinConditionLabel(false);
          isGameOver = true;
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

  tttRenderer.initBasicScene(clickSpaceCallback);
  initGame();
});