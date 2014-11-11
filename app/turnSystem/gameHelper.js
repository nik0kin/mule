var Q = require('q'),
  _ = require('lodash');

var GameBoard = require('mule-models').GameBoard.Model,
  GameState = require('mule-models').GameState.Model,
  History = require('mule-models').History.Model,
  MuleRules = require('mule-rules'),
  startGameQ = require('./startGame').startGameQ;

exports.joinGameQ = function (game, player) {
  return game.joinGameQ(player)
    .then(function (savedGame) {
      // if game full, start game
      if (savedGame.full) {
        return startGameQ(savedGame);
      }
      // always return the savedGame
      return savedGame;
    });
};

exports.checkWinConditionQ = function (gso) {
  var gameObject = gso.game,
    gameBoardObjectId = gso.gameBoard._id;

  // TODO tic tac toe code needs to get out of here !
  if (gameObject.ruleBundle.name === 'TicTacToe') {
    return checkTicTacToeWinQ(gameBoardObjectId)
      .then(function (winnerPlayerRel) {
        if (winnerPlayerRel) {
          _.each(gameObject.players, function (playerInfo, player) {
            if (winnerPlayerRel === player) {
              playerInfo.playerStatus = 'won';
            } else {
              playerInfo.playerStatus = 'lost';
            }
          });
          gameObject.markModified('players');
          gameObject.gameStatus = 'finished';

          console.log(winnerPlayerRel + ' won gameId: ' + gameObject._id);
          return gameObject.saveQ();
        }
      });
  }

  var bundleCode = MuleRules.getBundleCode(gso.ruleBundle.name),
    bundleWinConditionQ;

  if (bundleCode && typeof (bundleWinConditionQ = bundleCode.winCondition) === 'function') {
    console.log('calling bundleProgressTurnQ');
    return bundleWinConditionQ(GameState, gso)
      .then(function (winner) {
        if (winner) {
          return gameObject.setWinnerAndSaveQ(winner)
            .then(function () {
              return History.setWinnerAndSaveQ(gso.history._id, winner);
            });
        }
      });
  }
};

var checkTicTacToeWinQ = function (gameBoardObjectId) {
  return GameBoard.findByIdWithPopulatedStatesQ(gameBoardObjectId)
    .then(function (gameBoard) {
      var winner = undefined,
        mPieces = {};

      _.each(gameBoard.gameState.pieces, function (piece) {
        mPieces[piece.locationId] = {'class': piece.class};
      });

      var checkWin = function (spacesIds) {
        var s1 = mPieces[spacesIds[0]],
          s2 = mPieces[spacesIds[1]],
          s3 = mPieces[spacesIds[2]];

        if (s1 && s2 && s3) {
          if (s1.class === 'O' && s2.class === 'O' && s3.class === 'O') {
            winner = 'p1';
          } else if (s1.class === 'X' && s2.class === 'X' && s3.class === 'X') {
            winner = 'p2';
          }
        }
      };

      checkWin(['topLeft', 'topMiddle', 'topRight']);
      checkWin(['middleLeft', 'middleMiddle', 'middleRight']);
      checkWin(['bottomLeft', 'bottomMiddle', 'bottomRight']);

      checkWin(['topLeft', 'middleLeft', 'bottomLeft']);
      checkWin(['topMiddle', 'middleMiddle', 'bottomMiddle']);
      checkWin(['topRight', 'middleRight', 'bottomRight']);

      checkWin(['topLeft', 'middleMiddle', 'bottomRight']);
      checkWin(['bottomLeft', 'middleMiddle', 'topRight']);

      return Q(winner);
    });
};