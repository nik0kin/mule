var _ = require('lodash'),
  Q = require('q');

var roundRobinTurnSystem = require('./turnSubmitStyle/roundRobin'),
  playByMailTurnSystem = require('./turnSubmitStyle/playByMail'),
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
exports.forceTurnProgress = function (game) {
  exports.loadGameStateObjectQ(game)
    .done(function (gameStateObject) {
      var history = gameStateObject.history;
      Logger.vog('Trying to forceTurnProgress', gameStateObject.game._id);
      var startTime = Date.now();
      var playerRel;
      if (gameStateObject.ruleBundle.turnSubmitStyle === 'roundRobin') {
        playerRel = gameStateObject.game.getRoundRobinNextPlayerRel(); // player that needs to play
        var logStr = 'forcing {0}\'s turn progress (round {1})'.format(playerRel, history.currentRound);
        Logger.vog(logStr, game._id);
        history.addRoundRobinPlayerTurnAndSaveQ(playerRel, undefined)
          .then(function () {
            return roundRobinTurnSystem.progressTurnQ(gameStateObject, playerRel);
          })
          .done(function () {
            Logger.log('force complete ' + (Date.now() - startTime) + 'ms', game._id);
          });
      } else if (gameStateObject.ruleBundle.turnSubmitStyle === 'playByMail') {
        history.getPlayersThatHaveNotPlayedTheCurrentTurnQ()
          .then(function (notPlayedPlayerRels) {
            if (notPlayedPlayerRels.length === 0) { return; }
            playerRel = undefined; // only affects a log message, maybe shouldnt exist in progressRoundQ ?
            Logger.log('forcing round progress on ' + JSON.stringify(notPlayedPlayerRels) + ' (round ' + history.currentRound + ')', game._id);
            return history.addPlayByMailPlayerTurnAndSaveQ(notPlayedPlayerRels, undefined);
          })
          .then(function () {
            return playByMailTurnSystem.progressRoundQ(gameStateObject.game, playerRel, history, gameStateObject.ruleBundle);
          })
          .done(function () {
            Logger.log('force complete ' + (Date.now() - startTime) + 'ms', game._id);
          }, function (err) {
            Logger.err('force failed:', game._id, err);
          });
      }
    }, function (err) {
      Logger.err('ERROR IN FORCE:', game._id, err);
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
      return Q(gso);
    });
};

exports.loadGameStateObjectByIdQ = function (gameId) {
  return Game.findByIdQ(gameId)
    .then(function (foundGame) {
      return exports.loadGameStateObjectQ(foundGame);
    });
};
