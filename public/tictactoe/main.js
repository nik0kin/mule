/**
 * http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene
 * http://stemkoski.github.io/Three.js/#mouse-click
 */

define(['tttRenderer', "../mule-js-sdk/sdk", "../dumbLib"], function (tttRenderer, sdk, dumbLib) {
  var SDK = sdk('../../'),
    Spinal = SDK.Spinal();

  var userPlayerRel,
    opponentRel,
    playerMap,
    isGameOver = false;

  var initGame = function (selectSpaceId) {
    var config = {
      refreshTime: 5000,
      turnSubmitStyle: 'roundRobin',
      gameIdUrlKey: 'gameId',
      useSessionForUserId: true,
      newTurnHook: newTurnHook
    };

    Spinal.initQ(config)
      .then(function (result) {
        userPlayerRel = Spinal.getUserPlayerRel();
        opponentRel = userPlayerRel === 'p1' ? 'p2' : 'p1';
        playerMap = Spinal.getPlayersMap();
        populatePlayersLabel();
        populateTurnStatusLabel();

        populateBoard(result.gameState);

        Spinal.startRefresh();
        updateRefreshLabel();
      });
  };

  var newTurnHook = function (result) {
    playerMap = Spinal.getPlayersMap();
    checkWin();

    populatePlayersLabel();
    populateTurnStatusLabel();

    parseTurn(result.turn);
  };

  var parseTurn = function (turn) {
    if (turn.playerTurns[opponentRel]) {
      receiveOpponentTurn(turn.playerTurns[opponentRel]);
    }
  };

  var updateRefreshLabel = function () {
    var secondsLeft = Math.floor(Spinal.getTimeTilNextRefresh() / 1000);
    $('#refreshLabel').html('refresh...' + secondsLeft);

    setTimeout(updateRefreshLabel, 1000);
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

  var populateBoard = function (gameState) {
    var tttPieces = gameState.pieces.map(function (p) {
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
    var actions = [{
      type: 'BasicCreate',
      params: {
        playerRel: userPlayerRel, //TODO change to not needing this on the backend
        whereId: whereId
      }
    }];

    Spinal.submitTurnQ(actions)
      .then(function (result) {
        console.log('Submitted turn');
        console.log(result);
        // refresh?
        counter = 0;
        var space = invertWhereMap[whereId].split('_');
        var _class = (userPlayerRel === 'p1') ? 'O' : 'X';
        tttRenderer.placePiece({x: space[0], y: space[1]}, _class);
      })
      .fail(function (err) {
        alert(JSON.stringify(err));
      });
  };

  var populatePlayersLabel = function () {
    var p1Name = playerMap['p1'].name;
    var p2Name = playerMap['p2'].name;

    if (userPlayerRel === 'p1') {
      p1Name = '<b>' + p1Name + '</b>';
    } else if (userPlayerRel === 'p2') {
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

    var yourOrTheir = (whosTurn === userPlayerRel) ? 'Your' : 'Their';

    $('#turnStatusLabel').html(yourOrTheir + ' Turn');
  };

  var checkWin = function () {
    _.each(Spinal.getGame().players, function (playerInfo, playerRel) {
      if (playerRel === userPlayerRel) {
        if (playerInfo.playerStatus === 'tie') {
          populateWinConditionLabel(false, true);
          isGameOver = true;
        } else if (playerInfo.playerStatus === 'won') {
          populateWinConditionLabel(true);
          isGameOver = true;
        } else if (playerInfo.playerStatus === 'lost') {
          populateWinConditionLabel(false);
          isGameOver = true;
        }
      }
    });
  };

  var populateWinConditionLabel = function (didWin, didTie) {
    if (didTie) {
      $('#winConditionLabel').html('<b>TIE</b>');
      return;
    }
    if (didWin) {
      $('#winConditionLabel').html('<b>WINNER</b>');
    } else {
      $('#winConditionLabel').html('<b>LOSER</b>');
    }
  };

  tttRenderer.initBasicScene(clickSpaceCallback);
  initGame();
});
