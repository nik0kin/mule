/* ripped from mulesprawl (and rick & the ghost) */

var GAME = {};
GAME.SIZE = { x: 1280, y: 960 };


define(["Loader", "assets", 'Backgammon', "Board", '../../dumbLib', "../../mule-js-sdk/sdk"],
  function(Loader, generateAssets, Backgammon, Board, dumbLib, sdk){
    var SDK = sdk('../../'),
      themeFromUrl = dumbLib.getUrlParameter('theme'),
      scale = (dumbLib.getUrlParameter('scale') || 65) / 100,
      ourAssets = generateAssets(themeFromUrl);

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
      GAME.SIZE.x *= scale;
      GAME.SIZE.y *= scale;

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
      currentGame = {_id: dumbLib.getUrlParameter('gameID') };
      currentUser.relId = dumbLib.getUrlParameter('playerRel');

      refreshGame(callback);
    };

    var updateWhosTurnIsIt = function () {
      var nextWhosTurn = SDK.Historys.getWhosTurnIsIt(currentHistory);
      if (whosTurn !== nextWhosTurn) {
        if (nextWhosTurn === currentUser.relId) {
          console.log('beginPlayersTurn');
          dontQuery = true;
        } else {
          console.log('beginOpponentTurn');
        }
        whosTurn = nextWhosTurn;
      }
    };

    var counter = 0, timerCount = 5, firstTime = true, refreshTime = 1000, dontQuery = false;
    var refreshGame = function () {
      if (dontQuery) {
        setTimeout(refreshGame, refreshTime);
        return;
      }

      counter--;
      var counterString = '';
      _(timerCount - counter).times(function () {
        counterString += '.';
      });
      $('#refreshLabel').html(counterString);

      if (counter > 0) {
        setTimeout(refreshGame, refreshTime);
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
              if (ourBackgammon) ourBackgammon.updateGameState(currentGameState);

              console.log('stated');
            });
        });
      if (!isGameOver) {
        setTimeout(refreshGame, refreshTime);
      }
    };

    var submitTurn = function (pendingTurn, successCallback, failureCallback) {
      console.log('submitting turn');
      if (pendingTurn === null) return;

      var params = {
        playerId: currentUser.relId,
        gameId: currentGame._id,
        actions: [{
          type: 'TurnAction',
          params: pendingTurn
        }]
      };

      SDK.PlayTurn.sendQ(params)
        .then(function (result) {
          console.log('Submitted turn');
          console.log(result);
          // refresh? - nah wait for us to fetch the turn
          successCallback(); // makes unsubmittabled
          //TODO lock the submit & reset button
        })
        .fail(function (err) {
          if (failureCallback) { failureCallback(err); }
          alert(JSON.stringify(err));
        });

      dontQuery = false;
    };

    var parseTurn = function (turn) {
      var playerRel, singleTurn;
      _.each(turn.playerTurns, function (t, p) {
        playerRel = p; // this should only loop once
        singleTurn = t;
      });
      ourBackgammon.parseTurn(playerRel, singleTurn);
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

      // ghetto wait for gameState
      while(!currentGameState) { ; }

      var boardViewParams = {
          scale: scale,
          gameBoard:currentGameBoard,
          gameState: currentGameState,
          mainClickCallback: clickSpace,
          fontDefs: ourAssets.fonts,
          usernames: {p1: playerMap.p1.name, p2: playerMap.p2.name},
          loaderQueue: loaderQueue
        },
        newBoardView = Board(boardViewParams);
      GAME.stage.addChild(newBoardView);
      gameMap = newBoardView;

      ourBackgammon = Backgammon(
        currentUser.relId,
        SDK.Historys.getWhosTurnIsIt(currentHistory),
        currentGameState,
        newBoardView,
        submitTurn
      );
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
    var canvas, loaderQueue;
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
        function (_loaderQueue){
          loaderQueue = _loaderQueue;
          console.log("done loading assets");
          GAME.loadGame();
        }
      );

    }

    console.log("init-ing");
    init();
  });
