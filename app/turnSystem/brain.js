var _ = require('lodash'),
  Q = require('q');

var roundRobinTurnSystem = require('./turnSubmitStyle/roundRobin'),
  playByMailTurnSystem = require('./turnSubmitStyle/playByMail'),
  GameBoard = require('mule-models').GameBoard.Model,
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
  turnFunctions.submitTurnQ(game, playerRelId, game.gameBoard, {actions: actions }, ruleBundle);
};

// turn and/or round
exports.forceTurnProgress = function (game) {
  exports.loadGameStateObjectQ(game)
    .done(function (gameStateObject) {
      console.log('try forcing for ' + gameStateObject.game._id);
      var playerRel;
      if (gameStateObject.ruleBundle.turnSubmitStyle === 'roundRobin') {
        playerRel = gameStateObject.game.getRoundRobinNextPlayerRel(); // player that needs to play
        console.log('forcing ' + playerRel + '\'s turn progress (round ' + gameStateObject.history.currentRound + ')');
        gameStateObject.history.addPlayerTurnAndSaveQ(playerRel, [])
          .then(function () {
            return roundRobinTurnSystem.progressTurnQ(gameStateObject.game, playerRel, gameStateObject.gameBoard, gameStateObject.history);
          })
          .done(function () {
            console.log('force complete');
          });
      } else if (gameStateObject.ruleBundle.turnSubmitStyle === 'playByMail') {
        var notPlayed = gameStateObject.history.getPlayersThatHaveNotPlayedTheCurrentRound();
        playerRel = undefined; // only affects a log message, maybe shouldnt exist in progressRoundQ ?
        console.log('forcing round progress on ' + notPlayed +' (round ' + gameStateObject.history.currentRound + ')');
        gameStateObject.history.addPlayerTurnAndSaveQ(notPlayed, [])
          .then(function () {
            return playByMailTurnSystem.progressRoundQ(gameStateObject.game, playerRel, gameStateObject.gameBoard, gameStateObject.history, gameStateObject.ruleBundle);
          })
          .done(function () {
            console.log('force complete');
          });
      }
    }, function (err) {
      console.log('ERROR IN FORCE:');
      console.log(err);
    });
};

exports.loadGameStateObjectQ = function (game) {
  var object,
    _board,
  // _pieceStates,
  // _spaceStates,
    _history,
    _ruleBundle;

  return GameBoard.findByIdWithPopulatedStatesQ(game.gameBoard)
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

      var gso = {
        game: game,
        ruleBundle: _ruleBundle,
        gameBoard: _board,
        history: _history
      };
      console.log('loaded?')
      return Q(gso);
    });
};