
define([], function () {
  var that = {};

  that.getColor = function (d) {
    switch (d.class) {
      case 'Property':
        var spaceGroupColor = {
          purple: 'purple',
          lightBlue: '#00FFFF',
          magenta: 'magenta',
          orange: 'orange',
          red: 'red',
          yellow: 'yellow',
          green: 'green',
          blue: 'blue',
          railroads: 'black',
          utilities: 'gray'
        };

        return spaceGroupColor[d.attributes.group];

      case 'Go':
      case 'Jail':
      case 'FreeParking':
      case 'GoToJail':
        return '#BCC6CC';

      case 'CommunityChest':
        return '#C58917';
      case 'Chance':
        return '#C11B17';
      case 'LuxuryTax':
      case 'IncomeTax':
        return '#C58917';
    }
  };

  that.getLinkColor = function (d) {
    return 'gray';
  };

  that.nodeSizes = {
    normal: 8,
    selected: 15
  };

  that.linkDistance = 1;

  that.getDisplayText = function (d) {
    if (!d.pieces) return '';
    return d.pieces.length;
  };

  return that;
});