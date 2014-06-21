
define(['Loader'], function (Loader) {
  var TERRAIN_SIZE = 25;

  var terrainImages = {
    grass: 'assets/terrain/grass.png',
    water: 'assets/terrain/water.png'
  };

  var buildingImages = {
    Castle: 'assets/buildings/castle.png',
    House: 'assets/buildings/houseGrassC1.png'
  };

  var Map = function (params) {
    var that = new createjs.Container(),
      map;

    var screenOffset = {x: 0, y: 0};
    var placedCastle = params.gameBoard.playerVariables['p1'].placedCastle;

    var mainClickCallback = params.mainClickCallback;

    function init () {
      var simpleMap = getSimpleMapFromGameBoard(params.size, params.gameBoard.spaces);

      that.loadTerrainMap(simpleMap);

      _.each(params.gameBoard.pieces, function (value) {
        if (value.class === '_phantom') return;
        var loc = value.locationId.split(',');
        that.drawBuilding(value.class, {x: loc[0], y: loc[1]});
      });

      that.on('click', function (evt) {
        that.clickedSpace(Math.floor(evt.stageX / TERRAIN_SIZE), Math.floor(evt.stageY / TERRAIN_SIZE));
      });
    }

    that.loadTerrainMap = function (_map) {
      //map =
      _.each(_map, function (yValue, y) {
        _.each(yValue, function (xValue, x) {
          var newBitmap = new createjs.Bitmap(terrainImages[xValue]);
          newBitmap.x = x * TERRAIN_SIZE;
          newBitmap.y = y * TERRAIN_SIZE - TERRAIN_SIZE;
          that.addChild(newBitmap);
        });
      });
    };

    that.drawBuilding = function (type, loc) {
      if (type === 'Castle') placedCastle = true;
      var newBitmap = new createjs.Bitmap(buildingImages[type]);
      newBitmap.x = loc.x * TERRAIN_SIZE;
      newBitmap.y = loc.y * TERRAIN_SIZE - TERRAIN_SIZE;
      that.addChild(newBitmap);
    };

    that.clickedSpace = function (x, y) {
      console.log('clicked ' + x + ', ' + y);

      if (!placedCastle) {
        console.log('place castle!')
        params.func(x,y);
      }
      mainClickCallback(x,y);
    };


    init();
    return that;
  };

  var getSimpleMapFromGameBoard = function (size, spaces) {

    var map = [], y;
    for (y=0;y<size.height;y++) {
      map.push([]);
    }

    _.each(spaces, function (value) {
      var loc = value.boardSpaceId.split(',');
      map[loc[1]][loc[0]] = value.attributes.terrainType;
    });

    return map;
  };

  return Map;
});