
define([], function () {
  var that = {};

  that.vikingsColor = function (d) {
      switch (d.attributes.terrainType) {
        case undefined:
        case 'null':
        default :
          break;
        case 'dirt':
          c = 'brown';
          break;
        case 'grass':
          c = 'green';
          break;
        case 'hills':
          c = 'red';
          break;
        case 'water':
          c = 'blue';
          break;
        case 'forest':
          c = '#336633'
          break;
      }
      return c;
  };

  return that;
});