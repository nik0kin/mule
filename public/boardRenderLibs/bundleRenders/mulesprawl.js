
define([], function () {
  var that = {};

  that.getColor = function (d) {
    switch (d.attributes.terrainType) {
      case undefined:
      case 'null':
      default :
        break;
      case 'road':
        c = 'orange';
        break;
      case 'grass':
        c = 'green';
        break;
      case 'water':
        c = 'blue';
        break;
    }
    return c;
  };

  that.getLinkColor = function (d) {
    return 'gray';
  };

  that.nodeSizes = {
    normal: 10,
    selected: 14
  };

  that.linkDistance = 50;

  that.getDisplayText = function (d) {
    if (!d.pieces) return '';
    return d.pieces.length;
  };

  return that;
});