
define(['connectX', "../mule-js-sdk/sdk", "../dumbLib"],
    function (connectX, sdk, dumbLib) {
  var SDK = sdk('../../'),
    Spinal = SDK.Spinal();

  var userPlayerRel,
    opponentRel,
    playerMap;

  var current = {
    whosTurn: undefined,
    isGameOver: false
  };

  var initGame = function (selectSpaceId) {
    var config = {
      refreshTime: 3000,
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

        connectX.initBoard(result.gameState, result.game.ruleBundleGameSettings.customBoardSettings, userPlayerRel);

        populatePlayersLabel();
        populateTurnStatusLabel();

        Spinal.startRefresh();
        updateRefreshLabel();
      });
  };

  var newTurnHook = function (result) {
    playerMap = Spinal.getPlayersMap();
    checkWin();

    populatePlayersLabel();
    populateTurnStatusLabel();

    parseTurn(result.turn)
  };

  var parseTurn = function (turn) {
    if (turn.playerTurns[opponentRel]) {
      connectX.receiveOpponentTurn(turn.playerTurns[opponentRel]);
    }
  };

  var updateRefreshLabel = function () {
    var secondsLeft = Math.floor(Spinal.getTimeTilNextRefresh() / 1000);
    $('#refreshLabel').html('refresh...' + secondsLeft);

    setTimeout(updateRefreshLabel, 1000);
  };

  var submitTurn = function (whereX) {
    var actions = [{
      type: 'DropToken',
      params: {
        xDropLocation: whereX
      }
    }];

    Spinal.submitTurnQ(actions)
      .then(function (result) {
        console.log('Submitted turn');
        console.log(result);
        // refresh?
        counter = 0;
      })
      .fail(function (err) {
        alert(JSON.stringify(err));
      })
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

    current.whosTurn = whosTurn;

    var yourOrTheir = (whosTurn === userPlayerRel) ? 'Your' : 'Their';

    $('#turnStatusLabel').html(yourOrTheir + ' Turn');
  };

  var checkWin = function () {
    _.each(Spinal.getGame().players, function (playerInfo, playerRel) {
      if (playerRel === userPlayerRel) {
        if (playerInfo.playerStatus === 'tie') {
          populateWinConditionLabel(false, true);
          current.isGameOver = true;
        } else if (playerInfo.playerStatus === 'won') {
          populateWinConditionLabel(true);
          current.isGameOver = true;
        } else if (playerInfo.playerStatus === 'lost') {
          populateWinConditionLabel(false);
          current.isGameOver = true;
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

  connectX.init(submitTurn, current);
  initGame();
});
