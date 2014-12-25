
define(['demoLib', 'dumbLib', "mule-js-sdk/sdk", 'boardRenderLibs/d3/myD3Lib'], function (demoLib, dumbLib, sdk, myD3Lib) {
  var SDK = sdk('../'),
    currentUser,
    playerMap,
    currentGameBoard,
    currentGame,
    currentHistory,
    currentActions,
    isMovingPiece, movingPieceId;

  var initGame = function (selectSpaceId) {
    dumbLib.loadGameIdURL(function (gameId) {
      SDK.Games.readQ(gameId)
        .done(function(game) {
          currentGame = game;

          SDK.Historys.readGamesHistoryQ(currentGame._id)
            .done(function(history) {
              currentHistory = history;
              changeTurnLabel(currentHistory.currentRound);

              SDK.Games.getPlayersMapQ(game)
                .then(function (_playerMap) {

                  _.each(game.players, function (value, key) {
                    _playerMap[key].played = currentHistory.currentTurnStatus[key];
                  });

                  if (currentUser) {

                    _.each(_playerMap, function (value, key) {
                      if (('' +value.playerId) === ('' +currentUser._id)) {
                        currentUser.playerRel = key;
                        _playerMap[key].currentUser = true;
                        console.log(currentUser.playerRel);
                      }
                    });
                  }

                  playerMap = _playerMap;

                  if (currentUser && currentUser.playerRel) {
                    var currentRound = history.currentRound;
                    if (history.turns[currentUser.playerRel][currentRound - 1]) {
                      currentActions = history.turns[currentUser.playerRel][currentRound - 1].actions;
                    } else {
                      currentActions = [];
                    }
                  } else {
                    currentActions = [];
                  }
                  console.log('loaded actions count: ' + currentActions.length);

                  populatePlayerList();
                  populateActionsList();
                });
            });
        });

      SDK.GameBoards.readGamesBoardQ(gameId)
        .done(function(gameBoard) {
          //if (!currentGameBoard) {
            var fullBoard = SDK.GameBoards.createFullBoard(gameBoard.board, gameBoard.pieces);
            myD3Lib.renderLargeBoardHelper(gameBoard.ruleBundle.name, fullBoard, nodeClicked);
          //}
          populateSpacesList(gameBoard);
          populatePiecesList(gameBoard);
          currentGameBoard = gameBoard

          changeSelectLabel(selectSpaceId);
          populateSpacesPiecesInfo(selectSpaceId);
          isMovingPiece = false;
        });
    });

    isMovingPiece = false;
  };

  $('#loginUser').click(function () {
    demoLib.tryLogin()
      .then (function () {
      currentUser = { _id: SDK.Users.getLoggedInUserId() };
      initGame();
    });
  });
  $('#refreshButton').click(function () {
    initGame();
  });

  var nodeClicked = function (node, nodeElement) {
    var spaceId = node.id;
    console.log('clicked id: ' + spaceId);
    changeSelectLabel(spaceId);
    populateSpacesPiecesInfo(spaceId);

    if (isMovingPiece) {
      movePieceToSpace(movingPieceId, spaceId);
    }
  };

  var clickedMovePiece = function (pieceId, button) {
    if (isMovingPiece) {
      button.html('move');
      isMovingPiece = false;
      return;
    }

    console.log('Choose a spot to move piece: ' + pieceId);

    isMovingPiece = true;
    movingPieceId = pieceId;

    button.html('MOVING');
  };

  var movePieceToSpace = function (pieceId, spaceId) {
    console.log('moved piece=' + pieceId + ' to spaceId: ' + spaceId);

    var action = {
      type: 'BasicMove',
      params: {
        "whichPieceId": parseInt(pieceId),
        "whereId": spaceId
      }
    };

    currentActions.push(action);
    populateActionsList();
    isMovingPiece = false;
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

  $('#submitTurnButton').click(submitTurn);

  var changeSelectLabel = function (spaceId) {
    console.log('change selectLabel: ' + spaceId);

    if (spaceId) {
      $('#selectedSpace').html(spaceId);

      var spaceInfo = SDK.GameBoards.getFullSpaceInfo(currentGameBoard, spaceId);

      $('#selectedSpaceClass').html(spaceInfo.class);

      var attributesHtml = '';
      _.each(spaceInfo.attributes, function (value, key) {
        attributesHtml += ' - ' + key + ': ' + value + '<br>';
      });

      $('#selectedSpaceAttributes').html(attributesHtml);

    } else {
      $('#selectedSpace').html('');
      $('#selectedSpaceClass').html('');
      $('#selectedSpaceAttributes').html('');
    }
  };

  var changeTurnLabel = function (turnNumber) {
    $('#turnNumberLabel').html(turnNumber);
  };

  var populateSpacesList = function (gameBoard) {
    $('#spacesList').html('');
    _.each(gameBoard.board, function (space) {
      $('#spacesList').append('[' + space.id + '] <b>' + space.class + '</b><br>');
      _.each(space.attributes, function (value, key) {
        $('#spacesList').append(' - ' + key + ': ' + value+ '<br>');
      });
      $('#spacesList').append('<br>');
    });
  };

  var populatePiecesList = function (gameBoard) {
    $('#piecesList').html('');
    _.each(gameBoard.pieces, function (piece) {
      var pieceText = '[' + piece.id + '] <b>' + piece.class + '</b><br>'
        + 'location: ' + piece.locationId + ', owner: ' + piece.ownerId;
      $('#piecesList').append(pieceText);
      _.each(piece.attributes, function (value, key) {
        $('#piecesList').append(' - ' + key + ': ' + value+ '<br>');
      });
      $('#piecesList').append('<br>');
    });
  };

  var populateSpacesPiecesInfo = function (spaceId) {
    console.log('change selectLabel: ' + spaceId);

    $('#pieceInfoDiv').html('');

    if (!spaceId) { return; }

    var piecesOnSpace = SDK.GameBoards.getPiecesOnSpace(currentGameBoard, spaceId);
    _.each(piecesOnSpace, function (value) {
      var button = '<button id="pieceMoveButton-' + value.id + '" type="button" class="btn btn-default">Move</button>';
      $('#pieceInfoDiv').append(value.ownerId + ': <b>' + value.class + '</b> [' + value.id + ']: ' + button + ' <br>');
      $('#pieceMoveButton-' + value.id).click(function () {
        clickedMovePiece(value.id, $('#pieceMoveButton-' + value.id));
      });
    });
  };

  var populatePlayerList = function () {
    var element = $('#playerList');
    element.html('');

    _.each(playerMap, function (value, key) {
      var b = !value.currentUser ? ['', ''] : ['<b>', '</b>'];
      element.append('(' + key + ') ' + b[0] + value.name + b[1]  + ' has ' + (value.played ? '' : 'not ') + 'played<br>');
    });
  };

  var cancelAction = function (key) {
    currentActions.splice(key, 1);
    populateActionsList();
  };

  var populateActionsList = function () {
    var element = $('#actionsList');
    element.html('');

    _.each(currentActions, function (value, key) {
      var buttonId = 'cancelActionButton-' + key;
        button = '<button id="' + buttonId + '" type="button" class="btn-default small">X</button><br>';
      element.append('piece[' + value.params.whichPieceId + '] -> ' + value.params.whereId + ' ' + button);
      $('#' + buttonId).click(function () {
        cancelAction(key);
      });
    });
  };

  initGame();
});