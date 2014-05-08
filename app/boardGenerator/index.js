/**
 * Hacky BoardGenerator
 */

var Q = require('q'),
  weighted = require('weighted'),
  _ = require('lodash')

var GameBoard = require('mule-models').GameBoard.Model;

exports.saveVikingsGameBoardQ = function (newGameBoard, params) {
  return Q.promise(function (resolve, reject) {
    var ruleBundleRules = params.rules;

    newGameBoard.boardType = 'built';

    exports.generateVikingsBoardQ(params.customBoardSettings, ruleBundleRules)
      .done(function (result) {
        newGameBoard.board = result;
        newGameBoard.saveQ()
          .done(resolve, reject);
      }, reject);
  });
};

exports.generateVikingsBoardQ = function (customBoardSettings, vikingRules) {
  return Q.promise(function (resolve, reject) {
    var width = customBoardSettings.width;
    var height = customBoardSettings.height;

    var mapTerrainArray = [];

    // BAD CODE
    var x, y;
    for (x=0;x<width;x++) {
      mapTerrainArray[x] = [];
      for (y=0;y<height;y++) {
        mapTerrainArray[x][y] = aRandomTerrainFunction();
      }
    }
    // END BADCODE

    var board = [];

    _.each(mapTerrainArray, function (column, x) {
      _.each(column, function (value, y) {
        //console.log('[' + x + ', ' + y + '] ' + value);

        //new space
        var space = {};
        space.id = getVikingSpaceId(x, y);
        space.class = 'MoveableSpace';

        space.attributes = {};
        space.attributes.terrainType = value;

        var e = getHexEdges(x,y,width,height);
        space.edges = e;

        board.push(space);
      })
    });

    resolve(board);
  });
};

var terrainTypeWeights = {
  "dirt" : .25, "grass" : .35, "hills" : .1, "water" :.05, "forest" : .25
};

var getVikingSpaceId = function (x, y) {
  return 'x' + x + 'y' + y;
};

var aRandomTerrainFunction = function () {
  return weighted.select(terrainTypeWeights);
};

var getHexEdges = function (currentX, currentY, totalWidth, totalHeight) {
  var edges = [];

  var potentialEdges = [
    {x: 0, y: -1}, {x: 1, y: -1},
    {x: -1, y: 0}, {x: 1, y: 0},
    {x: -1, y: 1}, {x: 0, y: 1}
  ];

  _.each(potentialEdges, function (value, key) {
    var potX = currentX + value.x;
    var potY = currentY + value.y;

    if (potX < 0 || potY < 0 || potX >= totalWidth || potY >= totalHeight)
      return;

    edges.push({id: getVikingSpaceId(potX, potY)});
  });


  return edges;
};