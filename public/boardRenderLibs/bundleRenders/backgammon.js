
define([], function () {
  var that = {};

  that.getColor = function (d) {
    var c = '#DDDDDD';
    if(d.class == 'RegularSpace' && d.attributes){
      switch (d.attributes.inGammonBox) {
        case undefined:
        case 'null':
        default :
          break;

        case 'black':
          c = '#999999';
          break;
        case 'red':
          c = 'red';
          break;
      }
    } else if (d.class == 'ScoreSpace') {
      switch (d.attributes.player) {
        case 'red' :
          c = '#800000';
          break;
        case 'black' :
          c = 'black';
          break;
      }
    }
    return c;
  };

  that.getLinkColor = function (d) {
    return 'gray';
  };

  that.nodeSizes = {
    normal: 10,
    selected: 15
  };

  that.linkDistance = 15;

  that.getDisplayText = function (d) {
    if (!d.pieces) return '';
    return d.pieces.length;
  };

  return that;
});