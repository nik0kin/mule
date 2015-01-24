define(['../q', '../utils/index'], function (Q, utils) {
  return function (SDK) {
    return function spinalConstructor() {
      var that = {};

      var config,
        hooks;

      var gameId,
        userId,
        userPlayerRel;

      var playersMap;

      var cachedGame,
        cachedGameBoard, cachedGameState,
        cachedHistory;

      var currentTurnNumber,
        lastTurn,
        turns = {};

      // initilizes configuration and reads
      //   Game/GameBoard/GameState/History & the last Turn
      that.initQ = function (params) {
        config = {
          turnSubmitStyle: params.turnSubmitStyle,
          gameId: params.gameId, 
          gameIdUrlKey: params.gameIdUrlKey || false,
          refreshTime: params.refreshTime || 10000, //ms
          userId: params.userId,
          useSessionForUserId: params.useSessionForUserId || false,
          refetchGameState: params.refetchGameState || true
        };

        hooks = {
          noSession: params.noSessionHook,
          newTurn: params.newTurnHook
        };


        // Determine gameId
        if (config.gameId) {
          gameId = config.gameId;
        } else if (config.gameIdUrlKey) {
          gameId = utils.getUrlParameter(config.gameIdUrlKey);
        }

        if (!gameId) {
          throw 'gameId required for initQ';
        }

        // Determine userId
        var startPromise;
        if (config.userId) {
          userId = config.userId
          startPromise = SDK.Q();
        } else if (config.useSessionForUserId) {
          startPromise = SDK.Users.sessionQ()
            .then(function (result) {
              userId = result._id;
            })
            .fail(function () {
              // ignore if hooks.noSession is undefined
              if (hooks.noSession) {
                hooks.noSession();
              }
              // if this was q in node, this would 'catch'
              //   maybe its something with jquery promises?
            });
            
        }

        // Fetch Game
        return startPromise
          .then(function () {
            return SDK.Games.readQ(gameId)
              .fail(function () {
                throw 'invalid gameId';
              })
              .then(function (game) {
                cachedGame = game;

                // set relId
                for (var relId in game.players) {
                  var p = game.players[relId];
                  if (p.playerId == userId) {
                    userPlayerRel = relId;
                  }
                }
              });
          })
        // Fetch History, GameBoard, GameState (should be concurrent.. but Q.all acts strange compared to the node implementation)
          .then(function () {
            return SDK.Historys.readGamesHistoryQ(gameId)
              .then(function (history) {
                cachedHistory = history;
                currentTurnNumber = history.currentTurn;

                return updatePlayersMapQ();
              });
          })
          .then(function () {
            return SDK.GameBoards.readGamesBoardQ(gameId)
              .then(function (gameBoard) {
                cachedGameBoard = gameBoard
              })
          })
          .then(function () {
            return readGameStateQ();
          })
        // Fetch last played Turn
          .then(function () {
            if (currentTurnNumber === 1) {
              return;
            }
            return readLastTurnQ();
          })
        // Return objects
          .then(function () {
            return {
              game: cachedGame,
              history: cachedHistory,
              gameBoard: cachedGameBoard,
              gameState: cachedGameState,
              lastTurn: lastTurn
            };
          })
        // Error
          .fail(function (err) {
            console.log('MuleSDK: Spinal.initQ failed: ')
            console.log(err);
          });
      };

      var updatePlayersMapQ = function () {
        // this shouldnt be wrapped in a Q.promise
        //   but it doesnt resolve correctly otherwise..
        return Q.promise(function (resolve, reject) {
          SDK.Games.getPlayersMapQ(cachedGame)
            .done(function (_playerMap) {
              for (var key in cachedGame.players) {
                _playerMap[key].played = cachedHistory.currentTurnStatus[key];
              };

              playersMap = _playerMap;
              resolve();
            });
        });
      };

      var readGameStateQ = function () {
        return SDK.GameStates.readGamesStateQ(gameId)
          .then(function (gameState) {
            cachedGameState = gameState;
          });
      };

      var readLastTurnQ = function () {
        return SDK.Turns.readGamesTurnQ(gameId, currentTurnNumber - 1)
          .then(function (turn) {
            lastTurn = turn;
            turns[currentTurnNumber - 1] = turn;
          });
      };

      //////// REFRESH ////////
      var dontQuery = true,
        lastRefreshTime;

      // refreshes immediately
      that.startRefresh = function () {
        dontQuery = false;
        refresh();
      };

      that.stopRefresh = function () {
        dontQuery = true;
      };

      that.getTimeTilNextRefresh = function () {
        if (dontQuery) {
          return -1;
        }

        return (lastRefreshTime + config.refreshTime) - Date.now();
      };

      // reads a new Game/History
      //  and if History.currentTurn changes
      //  then read new Turn and GameState
      var refresh = function () {
        lastRefreshTime = Date.now();
        if (dontQuery) {
          //setTimeout(refresh, config.refreshTime);
          return;
        }

        checkForUpdatesQ()
          .then(function () {
            setTimeout(refresh, config.refreshTime);
          });
      };

      var checkForUpdatesQ = function () {
        return SDK.Games.readQ(gameId)
          .then(function(game) {
            cachedGame = game;

            return SDK.Historys.readGamesHistoryQ(gameId)
          })
          .then(function(history) {
            cachedHistory = history;

            if (cachedHistory.currentTurn === currentTurnNumber) {
              return; // dont query state if you dont need to
            }

            currentTurnNumber = cachedHistory.currentTurn;

            return updatePlayersMapQ()
              .then(function () {
                return fetchAllUpdatesQ();
              })
          })
      };

      // fetching last Turn and new GameState
      var fetchAllUpdatesQ = function () {
        return readLastTurnQ()
          .then(function () {
            return readGameStateQ();
          })
          .then(function () {
            if (hooks.newTurn) {
              return hooks.newTurn({
                turn: lastTurn,
                gameState: cachedGameState
              });
            }
          });
      };

      ////////

      that.submitTurnQ = function (actions) {
        var params = {
          playerId: userPlayerRel,
          gameId: cachedGame._id,
          actions: actions
        };

        return SDK.PlayTurn.sendQ(params);
      };

      that.getGame = function () {
        return cachedGame;
      };
      that.getGameBoard = function () {
        return cachedGameBoard;
      };
      that.getGameState = function () {
        return cachedGameState;
      };
      that.getHistory = function () {
        return cachedHistory;
      };
      that.getTurn;

      that.getCurrentTurnNumber = function () {
        return currentTurnNumber;
      };

      that.getUserPlayerRel = function () {
        return userPlayerRel;
      };

      that.getPlayersMap = function () {
        return playersMap;
      };

      return that;
    }
  };
});
