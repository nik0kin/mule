/* ripped from rick & the ghost */

var GAME = {};
GAME.SIZE = { x: 1800, y: 1000 };
var TILESIZE = 50;

var DEBUG = {showClickArea: false, sceneState: false};


define(["Loader", "assets", "Map", '../../dumbLib', "../../mule-js-sdk/sdk"],
  function(Loader, ourAssets, Map, dumbLib, sdk){
    var SDK = sdk('../../');

    var STATES = {pregame: 0, ingame: 1, loading: 2};

    GAME.fps = 30;
    GAME.state;

    var currentUser = {},
      playerMap,
      currentGameBoard,
      currentGame,
      currentRound = 0,
      currentHistory,
      isGameOver = false,
      firstLoad = true;

    var gameMap;

    GAME.controls = {
      //for moving map
      enter: false
    };

    //temporary
    var preContainer;


    GAME.init = function(canvas){
      GAME.stage = canvas;
      GAME.state = STATES.pregame;

      //load shit?

      //GAME.state = STATES.pregame;
      preContainer = new createjs.Container();

      var rectangle = new createjs.Shape();
      var sz = currentGame.ruleBundleGameSettings.customBoardSettings;
      rectangle.graphics.beginFill("black").drawRect(0,0,TILESIZE * sz.width, TILESIZE * sz.height);
      console.log(sz);
      console.log(TILESIZE);
      $('#myCanvas').attr('width', sz.width * sz.width);
      $('#myCanvas').attr('height', sz.height * sz.height);
      rectangle.on("click",function () {
        GAME.startGame();
      });
      preContainer.addChild(rectangle);


      GAME.stage.addChild(preContainer);

      setInterval(GAME.update, 1000 / GAME.fps);

    };

    //var tempPic;

    GAME.update = function(){

      switch(GAME.state){

        case STATES.pregame:
          if(GAME.controls.enter){
            GAME.startGame();
          }
          break;
        case STATES.ingame:



          break;
      }

      GAME.prevControls = GAME.controls;
    };

    GAME.loadGame = function (callback) {
      dumbLib.loadGameIdAndPlayerRelFromURL(function (result) {
        currentGame = {_id: result.gameId };

        refreshGame(callback);
      });
    };

    var counter = 0, timerCount = 2, firstTime = true;
    var refreshGame = function () {
      counter--;
      $('#refreshLabel').html('refresh...' + counter);

      if (counter > 0) {
        setTimeout(refreshGame, 1000);
        return;
      } else {
        counter = timerCount;
      }

      SDK.Games.readQ(currentGame._id)
        .done(function(game) {
          currentGame = game;

          if (firstTime) {
            GAME.init(canvas);
            firstTime = false;
          }
          //checkWin();

          SDK.Historys.readGamesHistoryQ(currentGame._id)
            .done(function(history) {
              currentHistory = history;

              if (currentHistory.currentRound === currentRound) {
                return; // dont query board if you dont need to
              }

              currentRound = currentHistory.currentRound
              updateDateLabel(currentRound);


              SDK.Games.getPlayersMapQ(currentGame)
                .then(function (_playerMap) {

                  _.each(currentGame.players, function (value, key) {
                    _playerMap[key].played = currentHistory.currentTurnStatus[key];
                  });

                  playerMap = _playerMap;
                  //populatePlayersLabel();
                  //populateTurnStatusLabel();
                });

              SDK.GameBoards.readGamesBoardQ(currentGame._id)
                .done(function(gameBoard) {
                  //var fullBoard = SDK.GameBoards.createFullBoard(gameBoard.board, gameBoard.pieces);
                  currentGameBoard = gameBoard;

                  updateGoldLabel();

                  if (firstLoad) {
                    //populateBoard(gameBoard);
                    firstLoad = false;
                    SDK.Historys.markAllTurnsRead(currentHistory);
                  } else {
                    //look at last turn
                    var t = SDK.Historys.getLastUnreadTurn(currentHistory);
                    console.log(t);
                    if (t) {
                      parseTurn(t);
                    }
                  }

                  console.log('refreshed');
                });
            });
        });

      if (!isGameOver) {
        setTimeout(refreshGame, 1000);
      }
    };

    var parseTurn = function (turn) {
      _.each(turn.actions, function (value) {
        if (!value.metadata) return;
        _.each(value.metadata.newFarms, function (value) {
          var loc = value.split(',');
          gameMap.drawBuilding('House', {x: loc[0], y: loc[1]});
        });
        updateInfoSpam(value.metadata);
      });
    };

    var placeCastle = function (x, y) {
      console.log('placing at ' + x + ',' + y);
      var params = {
        playerId: 'p1',
        gameId: currentGame._id,
        actions: [{
          type: 'PlaceCastle',
          params: {
            playerRel: 'p1',
            where: {x: x, y: y}
          }
        }]
      };

      SDK.PlayTurn.sendQ(params)
        .then(function (result) {
          console.log('Submitted turn');
          console.log(result);
          // refresh?
          //counter = 0;
          gameMap.drawBuilding('Castle', {x: x, y: y});
        })
        .fail(function (err) {
          alert(JSON.stringify(err));
        })
    };

    var updateDateLabel = function (roundNumber) {
      var year = Math.floor(roundNumber / 12);
      var month = roundNumber % 12;

      $('#dateLabel').html('year: ' + year + ', month: ' + month);
    };

    var updateGoldLabel = function () {
      var gold = currentGameBoard.playerVariables['p1'].gold;
      var farmers = SDK.GameBoards.getClassesFromPieces(currentGameBoard, 'Farmer');

      var pregnantWomen = [];
      _.each(farmers, function (farmer) {
        if (farmer.attributes.pregnant + 1 > currentRound)
          pregnantWomen.push(farmer);
      });

      var singleMen = [], singleWomen = [];
      _.each(farmers, function (farmer) {
        if (farmer.attributes.sex === 'male' && farmer.attributes.age >= 16 && farmer.attributes.married === 'single') {
          singleMen.push(farmer);
        }
        if (farmer.attributes.sex === 'female' && farmer.attributes.age >= 14 && farmer.attributes.married === 'single') {
          singleWomen.push(farmer);
        }
      });
      var singlesString = singleMen.length + ' bachelors, ' + singleWomen.length + ' bachelorettes';

      $('#goldLabel').html('Gold: ' + gold + ', Farmers: ' + farmers.length + ',  Pregnant Women: '
        + pregnantWomen.length + ', ' + singlesString);
    };

    var infoSpamDiv = $('#infoSpamDiv');
    var updateInfoSpam = function (turnMetaData) {
      var string = '';

      _.each(turnMetaData.deaths, function (name) {
        string += '<b>' + name + '</b> died <br>';
      });

      _.each(turnMetaData.births, function (family) {
        string += 'Family:  <b>' + family + '</b> had a child. <br>';
      });

      _.each(turnMetaData.birthdays, function (birthday) {
        string += '<b>' + birthday.name + '</b> turned ' + birthday.age + ' <br>';
      });

      _.each(turnMetaData.becomeMan, function (name) {
        string += '<b>' + name + '</b> became a man<br>';
      });

      _.each(turnMetaData.miscarriage, function (name) {
        string += '<b>' + name + '</b> miscarried today :( <br>';
      });

      _.each(turnMetaData.pregnancies, function (name) {
        string += '<b>' + name + '</b>became pregnant <br>';
      });

      _.each(turnMetaData.marriages, function (marriage) {
        string += '<b>' + marriage.wife + '</b> married <b>' + marriage.husband + '</b> <br>';
      });

      infoSpamDiv.html(string + '<br>' + infoSpamDiv.html());
    };

    GAME.startGame = function () {
      if (firstLoad) return;
      GAME.state = STATES.ingame;

      preContainer.visible = false;
      console.log("end pregame state");

      var size = currentGame.ruleBundleGameSettings.customBoardSettings;
      var newMap = Map({gameBoard:currentGameBoard, size: size, func: placeCastle, mainClickCallback: clickSpace});
      GAME.stage.addChild(newMap);
      gameMap = newMap;
    };

    GAME.resetGame = function(){
      console.log("reseting game");
      init();
      console.log("reset State: "+GAME.state)
    };

    GAME.click = function (loc){
      //can be delt with thru http://www.createjs.com/Docs/EaselJS/classes/DisplayObject.html#event_click
    };

    var clickSpace = function (x, y) {
      var locationId = x + ',' + y,
        piece = SDK.GameBoards.getFullSpaceInfo(currentGameBoard, locationId),
        string = '<h4>' + x + ', ' + y +  ' ' + piece.attributes.terrainType + '</h4><br><br>';

      var farmers = SDK.GameBoards.getClassesFromPieces(currentGameBoard, 'Farmer');
      _.each(farmers, function (farmer) {
        if (farmer.locationId === (x + ',' + y)) {
          string += '<b>' + farmer.attributes.name + ' ' + farmer.attributes.familyName +'</b><br>';
          string += ' - ' + farmer.attributes.sex + ', ' + farmer.attributes.age +', ' + farmer.attributes.married + '<br>';
        }
      });

      string += '<br>';
      $('#spaceInfoDiv').html(string);
    };

    //process key presses
    GAME.keyPressed = function (evt){
      if(!evt) return;
      switch(evt.keyCode){
        case 13://enter
          GAME.controls.enter = true;
          break;
      }
    };
    //process key releases
    GAME.keyReleased = function (evt){
      if(!evt) return
      switch(evt.keyCode){
        case 13://enter
          GAME.controls.enter = false;
          break;

        case 82://r
          //GAME.resetGame();
          break;
        case 77://m
          //SoundManager.toggleMute();
          break;
        case 27://esc
          //   gameplayobject.stopPlacing();
          break;
      }
    };

    ////////// MAIN /////////////
    var canvas;
    function init() {
      canvas = new createjs.Stage(document.getElementById('myCanvas'));
      canvas.enableMouseOver({frequency: 30});

      //trying: http://stackoverflow.com/questions/20805311/what-is-the-best-practice-in-easeljs-for-ticker
      createjs.Ticker.setFPS(30);
      createjs.Ticker.addEventListener("tick", canvas);

      document.onkeydown = GAME.keyPressed;
      document.onkeyup = GAME.keyReleased;

      //load!
      console.log("loading");
      Loader.doLoadScreen(
        canvas,
        ourAssets.images,
        ourAssets.sounds,
        function (){
          console.log("done loading assets");
          GAME.loadGame();
        }
      );

    }

    console.log("init-ing");
    init();
  });