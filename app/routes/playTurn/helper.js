/**
 * Created by niko on 5/6/14.
 */

var GameBoard = require('mule-models').GameBoard.Model;

exports.playTurn = function (req, res) {
  var gameBoardId = req.body.gameBoardId;
  var whichPieceId = req.body.whichPiece;
  var whereId = req.body.where;

  console.log("gameBoardId: " + gameBoardId);
  console.log("whichPieceId: " + whichPieceId);
  console.log("whereId: " + whereId);

var sillz = false;
  console.log('poop1')
  GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {

      console.log('poop2')
      if (gameBoard.pieces[whichPieceId] && gameBoard.spaces[whereId]) {
        gameBoard.pieces[whichPieceId].location = whereId;
        gameBoard.markModified('pieces');
      } else {
        console.log('inhere');
        sillz = true;
        res.status(400).send({msg: "INVALID PIECE"});
      }
console.log('poop3')
      return gameBoard.saveQ();
    })
    .then(function (savedGameBoard) {
      if (!sillz)
        res.status(200).send({msg: "ITS TRUE"})
    });

};