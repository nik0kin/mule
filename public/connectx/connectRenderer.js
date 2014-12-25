
define(function () {
  var that = {};

  that.init = function (clickTopSpaceCallback, customBoardSettings) {
    _(customBoardSettings.width).times(function (x) {
      _(customBoardSettings.height).times(function (y) {
        $('#' + (x+1) + '_' + (y+1)).click(clickTopSpaceCallback(x+1, y+1));
      });
    });
    console.log('its inited');
  };

  that.placeExistingPieces = function (board) {
    _.each(board, function (column, x) {
      _.each(column, function (space, y) {
        if (space.occupied) {
          that.dropPiece(x+1, y+1, space.occupied);
        }
      })
    })
  };


  // show flashing for available spaces
  var currentRotation = [],
    currentIndex = 0;
  that.readyForDrop = function (availableSpaces) {
    console.log(availableSpaces);
    _.each(availableSpaces, function (position) {
      $('#' + position.x + '_' + position.y).toggleClass('flashing');
    });
  };

  that.stopReady = function () {
    $('.top').toggleClass('flashing', false);
  };


  that.dropPiece = function (x, y, playerRel) {
    var colorClass = playerRel === 'p1' ? 'blueToken' : 'redToken';

    $('#' + x + '_' + y).toggleClass(colorClass);
  };

  return that;
});
