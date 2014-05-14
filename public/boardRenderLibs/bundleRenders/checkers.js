
define([], function () {
  var that = {};

  that.getColor = function (d) {
    var c = 'gray';
    if (d.attributes) {
      switch (d.attributes.kingme) {
        case undefined:
        case 'null':
        default :
          break;

        case 'player1':
          c = 'black';
          break;
        case 'player2':
          c = 'red';
          break;
      }
    }
    return c;
  };

  that.getLinkColor = function (d) {
    return 'gray';
  };

  that.nodeSizes = {
    normal: 8,
    selected: 12
  };

  that.linkDistance = 10;

  that.getDisplayText = function (d) {
    if (!d.pieces) return '';
    return d.pieces.length;
  };

  return that;
});