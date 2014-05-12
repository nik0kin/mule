
define(['demoLib', "mule-js-sdk/sdk", 'boardRenderLibs/d3/myD3Lib'], function (demoLib, sdk, myD3Lib) {
  var SDK = sdk('../'),
    currentGameBoard,
    currentGame,
    isMovingPiece, movingPieceId;

  var initGame = function (selectSpaceId) {
    demoLib.loadGameIdURL(function (gameId) {
      SDK.Games.readQ(gameId)
        .done(function(game) {
          changeTurnLabel(game.turnNumber);
          currentGame = game;
        });

      SDK.GameBoards.readGamesBoardQ(gameId)
        .done(function(gameBoard) {
          if (!currentGameBoard) myD3Lib.renderLargeBoardHelper(gameBoard.ruleBundle.name, gameBoard.board, nodeClicked);
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

  $('#loginUser').click(demoLib.tryLogin);
  $('#refreshButton').click(initGame);

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
    console.log('Choose a spot to move piece: ' + pieceId);

    isMovingPiece = true;
    movingPieceId = pieceId;

    button.html('MOVING');
  };

  var movePieceToSpace = function (pieceId, spaceId) {
    console.log('moved piece=' + pieceId + ' to spaceId: ' + spaceId);

    var params = {
      gameId: currentGame._id,
      actions: [{
        "whichPieceId": parseInt(pieceId),
        "whereId": spaceId
      }]
    };
    SDK.PlayTurn.sendQ(params)
      .then(function (result) {
        console.log(result);
        // refresh?
        initGame(spaceId);
      })
      .fail(function (err) {
        alert(JSON.stringify(err));
      });
  };

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

  initGame();
});