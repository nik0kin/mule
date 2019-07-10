var _ = require('lodash'),
  Q = require('q');

var roundRobinTurnSystem = require('./turnSubmitStyle/roundRobin'),
  playByMailTurnSystem = require('./turnSubmitStyle/playByMail'),
  addJob = require('../jobQueue').addJob,
  Logger = require('mule-utils').logging,
  Game = require('mule-models').Game.Model,
  GameBoard = require('mule-models').GameBoard.Model,
  GameState = require('mule-models').GameState.Model,
  History = require('mule-models').History.Model,
  RuleBundle = require('mule-models').RuleBundle.Model,
  PieceState = require('mule-models').PieceState.Model,
  SpaceState = require('mule-models').SpaceState.Model;

var turnStyleFunctions = {
  'roundRobin':  roundRobinTurnSystem,
  'playByMail': playByMailTurnSystem
};

exports.submitPlayerTurnQ = function (game, playerRelId, gameBoardId, actions, ruleBundle) {
  var turnFunctions = turnStyleFunctions[ruleBundle.turnSubmitStyle];
  return turnFunctions.submitTurnQ(game, playerRelId, game.gameBoard, {actions: actions }, ruleBundle);
};

// turn and/or round
exports.forceTurnProgress = function (_game, turnNumber, throwError) {
  var startTime;
  return addJob(_game._id, function() {
    startTime = Date.now();
    return exports.loadGameStateObjectByIdQ(_game._id)
      .then(function (gameStateObject) {
        var game = gameStateObject.game;
        var history = gameStateObject.history;

        if (turnNumber !== history.currentTurn) {
          // This prevents double progressing a Game if a user submits a turn while forceTurnProgress() is called
          Logger.vog('Skipping forceTurnProgress, because turn #' + turnNumber + ' has passed');
          return;
        }

        Logger.vog('Trying to forceTurnProgress', gameStateObject.game._id);
        var playerRel;
        if (gameStateObject.ruleBundle.turnSubmitStyle === 'roundRobin') {
          playerRel = gameStateObject.game.getRoundRobinNextPlayerRel(); // player that needs to play
          var logStr = 'forcing {0}\'s turn progress (round {1})'.format(playerRel, history.currentRound);
          Logger.vog(logStr, game._id);
          return history.addRoundRobinPlayerTurnAndSaveQ(playerRel, undefined)
            .then(function () {
              return roundRobinTurnSystem.progressTurnQ(gameStateObject, playerRel);
            });
        } else if (gameStateObject.ruleBundle.turnSubmitStyle === 'playByMail') {
          return history.getPlayersThatHaveNotPlayedTheCurrentTurnQ()
            .then(function (notPlayedPlayerRels) {
              if (notPlayedPlayerRels.length === 0) { return; }
              playerRel = undefined; // only affects a log message, maybe shouldnt exist in progressRoundQ ?
              Logger.log('forcing round progress on ' + JSON.stringify(notPlayedPlayerRels) + ' (round ' + history.currentRound + ')', game._id);
              return history.addPlayByMailPlayerTurnAndSaveQ(notPlayedPlayerRels, undefined);
            })
            .then(function () {
              return playByMailTurnSystem.progressRoundQ(gameStateObject.game, playerRel, history, gameStateObject.ruleBundle);
            });
        }
      });
  })
    .then(function () {
      Logger.log('force complete ' + (Date.now() - startTime) + 'ms', _game._id);
    }, function (err) {
      Logger.err('force failed:', _game._id, err);
      if (throwError) {
        throw err;
      }
    });
};

exports.loadGameStateObjectQ = function (game) {
  var object,
    _board,
  // _pieceStates,
  // _spaceStates,
    _history,
    _ruleBundle;

  var startTime = Date.now();

  return GameBoard.findByIdQ(game.gameBoard)
    .then(function (foundGameBoard) {
      _board = foundGameBoard;

      return RuleBundle.findByIdQ(game.ruleBundle.id);
    })
    .then(function (foundRuleBundle) {
      _ruleBundle = foundRuleBundle;

      return History.findByIdQ(_board.history);
    })
    .then(function (foundHistory) {
      _history = foundHistory;

      return GameState.findByIdWithPopulatedStatesQ(_board.gameState);
    })
    .then(function (maybeGameState) {
      var gso = {
        game: game,
        ruleBundle: _ruleBundle,
        gameBoard: _board,
        gameState: maybeGameState,
        history: _history
      };
      Logger.log('Loaded GSO, ' + (Date.now() - startTime) + 'ms', game._id);
      return gso;
    });
};

exports.loadGameStateObjectByIdQ = function (gameId) {
  return Game.findByIdQ(gameId)
    .then(function (foundGame) {
      return exports.loadGameStateObjectQ(foundGame);
    });
};
