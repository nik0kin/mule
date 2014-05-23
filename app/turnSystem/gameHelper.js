var Q = require('q'),
  _ = require('lodash');

var GameBoard = require('mule-models').GameBoard.Model;

exports.checkWinConditionQ = function (gameObject, gameBoardObjectId) {

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

};

var checkTicTacToeWinQ = function (gameBoardObjectId) {
  return GameBoard.findByIdWithPopulatedStatesQ(gameBoardObjectId)
    .then(function (gameBoard) {
      var winner = undefined,
        mPieces = {};

      _.each(gameBoard.pieces, function (piece) {
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