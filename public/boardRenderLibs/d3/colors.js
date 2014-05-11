
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

  that.backgammonColor = function (d) {
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

  that.checkersColor = function (d) {
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

  that.grayColor = function (d) {
    return 'gray';
  };

  that.monopolyColor = function (d) {
    console.log(d)
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

  that.ticTacToeLinkColor = function (d) {
    var c = 'gray';

    switch (d.value.lineAngle) {
      case '/':
        c = 'orange';
        break;
      case '-':
        c = 'green';
        break;
      case '\\':
        c = 'purple';
        break;
      case '|':
        c = 'red';
        break;
    }

    return c;
  };

  return that;
});