
define(['demoLib', "mule-js-sdk/sdk", 'boardRenderLibs/d3/myD3Lib'], function (demoLib, sdk, myD3Lib) {
  var SDK = sdk('../');
  var currentGameBoard;

  $('#loginUser').click(demoLib.tryLogin);


  //init game by url
  demoLib.loadGameIdURL(function (gameId) {
    SDK.Games.readQ(gameId)
      .done(function(game) {
        //dont care right now
      });

    SDK.GameBoards.readGamesBoardQ(gameId)
      .done(function(gameBoard) {
        myD3Lib.renderLargeBoardHelper(gameBoard.ruleBundle.name, gameBoard.board, nodeClicked);
        populateSpacesList(gameBoard);
        populatePiecesList(gameBoard);
        currentGameBoard = gameBoard
      });
  });

  var nodeClicked = function (node) {
    var id = node.id;
    console.log('clicked id: ' + id);
    changeSelectLabel(id);
    console.log(node)

    // are we moving somewhere?


    // otherwise select something



  };

  var changeSelectState = function (state) {


  };

  var changeSelectLabel = function (spaceId) {

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
      var pieceText = '[' + piece.id + '] <b>' + piece.className + '</b><br>'
        + 'location: ' + piece.location + ', owner: ' + piece.ownerId;
      $('#piecesList').append(pieceText);
      _.each(piece.attributes, function (value, key) {
        $('#piecesList').append(' - ' + key + ': ' + value+ '<br>');
      });
      $('#piecesList').append('<br>');
    });
  };
});