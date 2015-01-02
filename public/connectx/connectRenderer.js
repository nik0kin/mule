
define(function () {
  var that = {};

  that.init = function (clickTopSpaceCallback, customBoardSettings) {
    var tableString = '';

    // init dom
    _(customBoardSettings.height).times(function (y) {
      tableString += '<tr>';
      _(customBoardSettings.width).times(function (x) {
        var id = (x+1) + '_' + (y+1),
          isTop = y === 0 ? ' top' : '';
        $('#' + id).click(clickTopSpaceCallback(x+1, y+1));
        tableString += '<td id="' + id + '" class="empty' + isTop + '"></td>';
      });
      tableString += '</tr>';
    });
    $('#connectXtable').html(tableString);

    // init buttons
    _(customBoardSettings.height).times(function (y) {
      _(customBoardSettings.width).times(function (x) {
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
      });
    });
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
    $('.empty').toggleClass('flashing', false);
  };


  that.dropPiece = function (x, y, playerRel) {
    var colorClass = playerRel === 'p1' ? 'blueToken' : 'redToken';

    $('#' + x + '_' + y).toggleClass(colorClass);
  };

  return that;
});
