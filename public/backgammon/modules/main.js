/* ripped from mulesprawl (and rick & the ghost) */

var GAME = {};
GAME.SIZE = { x: 900, y: 600 };


define(["Loader", "assets", 'Backgammon', "Board", '../../dumbLib', "../../mule-js-sdk/sdk"],
  function(Loader, ourAssets, Backgammon, Board, dumbLib, sdk){
    var SDK = sdk('../../');

    var STATES = {pregame: 0, ingame: 1, loading: 2};

    GAME.fps = 30;
    GAME.state;

    var currentUser = {},
      playerMap,
      currentGameBoard,
      currentGameState,
      currentGame,
      currentTurn = 0,
      currentHistory,
      ourBackgammon,
      isGameOver = false,
      firstLoad = true,

      whosTurn,
      submittable = false;

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
      rectangle.graphics.beginFill("black").drawRect(0,0,GAME.SIZE.x, GAME.SIZE.y);
      $('#myCanvas').attr('width', GAME.SIZE.x);
      $('#myCanvas').attr('height', GAME.SIZE.y);
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
        currentUser.relId = result.playerRel;

        refreshGame(callback);
      });
    };

    var updateWhosTurnIsIt = function () {
      var nextWhosTurn = SDK.Historys.getWhosTurnIsIt(currentHistory);
      if (whosTurn !== nextWhosTurn) {
        if (nextWhosTurn === currentUser.relId) {
          console.log('beginPlayersTurn');
          $('#submitButton').attr('disabled', false);
        } else {
          console.log('beginOpponentTurn');
          $('#submitButton').attr('disabled', true);
        }
        whosTurn = nextWhosTurn;
      }
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

      var gamePromise;

      if (firstTime) {
        gamePromise = SDK.Games.readQ(currentGame._id)
      } else { //ghetto promise
        var defer = $.Deferred(),
          gamePromise = defer.then(function (v) { return v; });
        defer.resolve(currentGame);
      }
      gamePromise
        .then(function(game) {
          currentGame = game;

          if (firstTime) {
            GAME.init(canvas);
            firstTime = false;
          }
          //checkWin();

          return SDK.Historys.readGamesHistoryQ(currentGame._id)
        })
        .then(function(history) {
          currentHistory = history;

          if (currentHistory.currentTurn === currentTurn) {
            return; // dont query board if you dont need to
          }

          currentTurn = currentHistory.currentTurn;

          SDK.Games.getPlayersMapQ(currentGame)
            .then(function (_playerMap) {

              _.each(currentGame.players, function (value, key) {
                _playerMap[key].played = currentHistory.currentTurnStatus[key];
              });

              playerMap = _playerMap;

              updateWhosTurnIsIt();

              updateDebugLabel();
            });

          SDK.GameBoards.readGamesBoardQ(currentGame._id)
            .done(function(gameBoard) {
              currentGameBoard = gameBoard;

              if (firstLoad) {
                firstLoad = false;
                //SDK.Historys.markAllTurnsRead(currentHistory);
              } else {
                //look at last turn
                //var t = SDK.Historys.getLastUnreadTurn(currentHistory);

                //  TODO this could potentially skip turns if the clients internet was down for a minute
                SDK.Turns.readGamesTurnQ(currentGame._id, currentTurn - 1)
                  .then(function (turn) {
                    parseTurn(turn);
                  });
              }

              console.log('refreshed');
            });

            SDK.GameStates.readGamesStateQ(currentGame._id)
            .done(function(gameState) {
              currentGameState = gameState;

              console.log('stated');
            });
        });
      if (!isGameOver) {
        setTimeout(refreshGame, 1000);
      }
    };

    var parseTurn = function (turn) {
      ourBackgammon.parseTurn(turn);
    };

    var updateDebugLabel = function () {
      var isPlayer1Turn = !playerMap['p1'].played,
        whosTurnLabel = (whosTurn === currentUser.relId) ? 'YOUR TURN' : 'their turn';
      console.log('UPDAINGZZZZ');
      $('#debugLabel').html('turn: ' + currentTurn + ', ' + whosTurnLabel);
    };

    GAME.startGame = function () {
      if (firstLoad) return;
      GAME.state = STATES.ingame;

      preContainer.visible = false;
      console.log("end pregame state");

      var newMap = Board({gameBoard:currentGameBoard, gameState: currentGameState, mainClickCallback: clickSpace});
      GAME.stage.addChild(newMap);
      gameMap = newMap;

      ourBackgammon = Backgammon(currentGameState, newMap);
    };

    GAME.resetGame = function(){
      console.log("reseting game");
      init();
      console.log("reset State: "+GAME.state)
    };

    var clickSpace = function (space) {
      ourBackgammon.clickSpace(space);
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