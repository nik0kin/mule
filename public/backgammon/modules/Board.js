
define(['RenderHelper'], function (RenderHelper) {
  var images = {
      board: {},
      die: {},
      pieces: {},
      shaker: null
    };

  var indicatorImages = {
    selection: 'assets/indicator-selection.png',
    move: 'assets/indicator-move.png',
    knock: 'assets/indicator-knock.png'
  };

  var size = {x: 1280, y: 960},
    scale = .65,

    tokenOffset = {x: .05, y: .01}, // offset from the pieceStartLocations[]
    tokenClickAreaPosOffset = {x: -.05, topY: -.015, botY: -.25},
    tokenClickAreaSize = {x: .053, y: .32},

    jailClickSize = {x: .065, y: .32},
    jailOffset = {x: .055, topY: .1, botY: .035},
    topJailClickAreaRect = {x: .5 - jailClickSize.x/2, y: .16, w: jailClickSize.x, h: jailClickSize.y},
    botJailClickAreaRect = {x: .5 - jailClickSize.x/2, y: .58, w: jailClickSize.x, h: jailClickSize.y};

    shakerPos = {x: .23, y: .485},
    die1Pos = {x: .21, y: .5},
    die2Pos = {x: .27, y: .5},
    diceClickAreaRect = {x: die1Pos.x, y: die1Pos.y, w: .11, h: .08};

  RenderHelper.init(scale, size);

  var pieceStartLocations = {
      'redJail': {
        x: botJailClickAreaRect.x + jailOffset.x,
        y: botJailClickAreaRect.y + jailOffset.botY
      },
      'blackJail': {
        x: topJailClickAreaRect.x + jailOffset.x,
        y: topJailClickAreaRect.y + jailOffset.topY
      },

      1: {x: .8835, y: .85}, // using .6575 as x seperator value
      2: {x: .827, y: .85},
      3: {x: .7705, y: .85},
      4: {x: .714, y: .85},
      5: {x: .6575, y: .85},
      6: {x: .601, y: .85},

      7: {x: .449, y: .85},
      8: {x: .3925, y: .85},
      9: {x: .336, y: .85},
      10: {x: .2795, y: .85},
      11: {x: .223, y: .85},
      12: {x: .1665, y: .85},

      13: {x: .1665, y: .17},
      14: {x: .223, y: .17},
      15: {x: .2795, y: .17},
      16: {x: .336, y: .17},
      17: {x: .3925, y: .17},
      18: {x: .449, y: .17},

      19: {x: .601, y: .17},
      20: {x: .6575, y: .17},
      21: {x: .714, y: .17},
      22: {x: .7705, y: .17},
      23: {x: .827, y: .17},
      24: {x: .8835, y: .17}
    },
    pieceSeperationY = .05,
    maxMoveLocationsForOneToken = 4

  var Board = function (params) {
    var that = new createjs.Container();

    var mainClickCallback = params.mainClickCallback,
      loaderQueue = params.loaderQueue;

    var die1Bitmap, die2Bitmap,
      tokenBitmaps = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
      jailBitmaps = {
        'redJail': [],
        'blackJail': []
      },
      shakerBitmap,
      selectionBitmap,
      moveIndicatorBitmapArray, knockIndicatorBitmapArray;

    function init () {
      var simpleBoard = getSimpleBackgammonBoardFromGameBoard(params.size, params.gameState.spaces, params.gameState.pieces);

      //set images using loaderQueue
      images.board.background = loaderQueue.getItem('board_background').src;
      images.board.overlay = loaderQueue.getItem('board_overlay').src;

      images.die.die1 = loaderQueue.getItem('die1').src;
      images.die.die2 = loaderQueue.getItem('die2').src;
      images.die.die3 = loaderQueue.getItem('die3').src;
      images.die.die4 = loaderQueue.getItem('die4').src;
      images.die.die5 = loaderQueue.getItem('die5').src;
      images.die.die6 = loaderQueue.getItem('die6').src;

      images.pieces.black_piece = loaderQueue.getItem('black_piece').src;
      images.pieces.red_piece = loaderQueue.getItem('red_piece').src;

      // create bitmaps
      RenderHelper.createScaledBitmapAndAddChild(images.board.background, {x:0,y:0}, that);
      RenderHelper.createScaledBitmapAndAddChild(images.board.overlay, {x:0,y:0}, that);

      die1Bitmap = RenderHelper.createScaledBitmapAndAddChild(images.die.die1, die1Pos, that);
      die2Bitmap = RenderHelper.createScaledBitmapAndAddChild(images.die.die2, die2Pos, that);

      shakerBitmap = RenderHelper.createScaledBitmapAndAddChild('assets/shaker.png', shakerPos, that);
      shakerBitmap.visible = false;

      //indicator bitmaps
      selectionBitmap = new createjs.Bitmap(indicatorImages.selection);
      selectionBitmap.visible = false;
      that.addChild(selectionBitmap);

      moveIndicatorBitmapArray = [];
      _(maxMoveLocationsForOneToken).times(function () {
        var bitmap = new createjs.Bitmap(indicatorImages.move);
        bitmap.visible = false;
        that.addChild(bitmap);
        moveIndicatorBitmapArray.push(bitmap);
      });

      knockIndicatorBitmapArray = [];
      _(maxMoveLocationsForOneToken).times(function () {
        var bitmap = new createjs.Bitmap(indicatorImages.knock);
        bitmap.visible = false;
        that.addChild(bitmap);
        knockIndicatorBitmapArray.push(bitmap);
      });

      // draw initial tokens
      _.each(simpleBoard, function (tokenInfo, spaceId) {
        that.drawTokens(tokenInfo.player === 'p1' ? 'black' : 'red', spaceId, tokenInfo.amt);
      });

      that.on('click', function (evt) {
        that.clickedSpace(evt.stageX, evt.stageY);
      });
    }

    var getTokenPixelPosition = function (spaceId, tokensOnSpot) {
      var l = pieceStartLocations[spaceId],
        upOrDownModifier = (spaceId === 'redJail' || parseInt(spaceId) > 12) ? 1 : -1; 

      return RenderHelper.getScaledPos(l.x - tokenOffset.x,
          l.y + tokensOnSpot * pieceSeperationY * upOrDownModifier - tokenOffset.y);
    };

    var getTokenBitmapArray = function (spaceId) {
      if (!isNaN(parseInt(spaceId))) {
          return tokenBitmaps[parseInt(spaceId) - 1];
        } else {
          return jailBitmaps[spaceId];
        }
    };

    that.drawTokens = function (color, loc, amt) {
      var i;

      for (i=0; i<amt; i++) {
        var newBitmap = RenderHelper.createScaledBitmap(images.pieces[color === 'red' ? 'red_piece' : 'black_piece']),
          pos = getTokenPixelPosition(loc, i);

        newBitmap.x = pos.x;
        newBitmap.y = pos.y;
        that.addChild(newBitmap);

        // adjust token bitmap arrays
        var tokenBitmap = getTokenBitmapArray(loc);
        tokenBitmap.push(newBitmap);
      }
    };

    that.moveToken = function (pieceId, currentSpaceId, destSpaceId) {
      var currentSpaceTokenBitmapArray = getTokenBitmapArray(currentSpaceId),
        aToken = currentSpaceTokenBitmapArray.pop();

        if (aToken) {
          var nextSpaceTokenBitmapArray = getTokenBitmapArray(destSpaceId),
            pos = getTokenPixelPosition(destSpaceId, nextSpaceTokenBitmapArray.length);
          aToken.x = pos.x;
          aToken.y = pos.y;
          nextSpaceTokenBitmapArray.push(aToken);
        } else {
          throw 'CANT move no tokens';
        }
    };

    var isBetween = function (num, low, high) {
      return num >= low && num <= high;
    };
    that.showShaker = function (trueOrFalse) {
      trueOrFalse = typeof(trueOrFalse) !== 'undefined' ? trueOrFalse : true; // use true if no trueOrFalse parameter
      shakerBitmap.visible = !!trueOrFalse;
    };

    that.clickedSpace = function (x, y) {
      var clickPos = {x: x, y: y};

      // check spaces
      _.each(pieceStartLocations, function (startLocation, pieceNumber) {
        var spaceRect = {
          x: startLocation.x + tokenClickAreaPosOffset.x,
          y: startLocation.y + (pieceNumber > 12 ? tokenClickAreaPosOffset.topY : tokenClickAreaPosOffset.botY),
          w: tokenClickAreaSize.x,
          h: tokenClickAreaSize.y
        };

        if (isNaN(pieceNumber)) { return; }

        //RenderHelper.drawDebugRect(spaceRect, that);

        if (RenderHelper.isWithinScaledRect(clickPos, spaceRect)) {
          mainClickCallback(pieceNumber);
        }
      });

      // check dice spot
      //RenderHelper.drawDebugRect(diceClickAreaRect, that);
      if (RenderHelper.isWithinScaledRect(clickPos, diceClickAreaRect)) {
        mainClickCallback('dice');
      }

      // check top jail
      //RenderHelper.drawDebugRect(topJailClickAreaRect, that);
      if (RenderHelper.isWithinScaledRect(clickPos, topJailClickAreaRect)) {
        mainClickCallback('botJail');
      }

      // check bottom jail
      //RenderHelper.drawDebugRect(botJailClickAreaRect, that);
      if (RenderHelper.isWithinScaledRect(clickPos, botJailClickAreaRect)) {
        mainClickCallback('topJail');
      }
    };

    that.showRoll = function (roll) {
      console.log('Roll: ' + roll.die1 + ' ' + roll.die2);
      die1Bitmap.image.src = images.die['die' + roll.die1];
      die2Bitmap.image.src = images.die['die' + roll.die2];
    };

    //////// INDICATORS //////////////
    that.showSelection = function (spaceId) {
      console.log('showSelection');

      var spaceCenterCoords = getTokenPixelPosition(spaceId, 3);
      selectionBitmap.x = spaceCenterCoords.x - 80;
      selectionBitmap.y = spaceCenterCoords.y;
      selectionBitmap.visible = true;
    };

    that.stopSelection = function () {
      console.log('stopSelection')
      selectionBitmap.visible = false;
    };

    that.showMoveLocationSpaces = function (spaceIdArray) {
      console.log('showMoveLocationSpaces ' + JSON.stringify(spaceIdArray));
      var i = 0;
      _.each(spaceIdArray, function (spaceId) {
        var spaceCenterCoords = getTokenPixelPosition(spaceId, 3),
          bitmap = moveIndicatorBitmapArray[i++];
        bitmap.x = spaceCenterCoords.x - 80;
        bitmap.y = spaceCenterCoords.y;
        bitmap.visible = true;
      });
    };

    that.stopMoveLocationSpaces = function () {
      _.each(moveIndicatorBitmapArray, function (bitmap) {
        bitmap.visible = false;
      });
    };

    that.showKnockMoveLocationSpaces = function (spaceIdArray) {
      console.log('showKnockMoveLocationSpaces ' + JSON.stringify(spaceIdArray));
      var i = 0;
      _.each(spaceIdArray, function (spaceId) {
        var spaceCenterCoords = getTokenPixelPosition(spaceId, 3),
          bitmap = knockIndicatorBitmapArray[i++];
        bitmap.x = spaceCenterCoords.x - 80;
        bitmap.y = spaceCenterCoords.y;
        bitmap.visible = true;
      });
    };

    that.stopKnockMoveLocationSpaces = function () {
      _.each(knockIndicatorBitmapArray, function (bitmap) {
        bitmap.visible = false;
      });
    };

    that.stopAllMoveLocationIndicators = function () {
      that.stopSelection();
      that.stopMoveLocationSpaces();
      that.stopKnockMoveLocationSpaces();
    };


    init();
    return that;
  };

  var getSimpleBackgammonBoardFromGameBoard = function (size, spaces, pieces) {

    var board = {};

    _.each(spaces, function (value) {
      var loc = value.boardSpaceId;
      board[loc] = {}
    });

    _.each(pieces, function (value) {
      board[value.locationId].player = value.ownerId;
      board[value.locationId].amt = board[value.locationId].amt ? board[value.locationId].amt + 1 : 1;
    });

    return board;
  };

  return Board;
});
