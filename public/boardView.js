
define(['demoLib', "mule-js-sdk/sdk", 'boardRenderLibs/d3/myD3Lib'], function (demoLib, sdk, myD3Lib) {
  var SDK = sdk('../');

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
        $('#spacesList').html('');
        _.each(gameBoard.board, function (space) {
          $('#spacesList').append('[' + space.id + '] <b>' + space.class + '</b><br>');
          _.each(space.attributes, function (value, key) {
            $('#spacesList').append(' ' + key + ': ' + value+ '<br>');
          });
          $('#spacesList').append('<br>');
        });
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
    $('#selectedSpace').html(spaceId);
  };
});