/**
 * Created by niko on 5/6/14.
 */

var _ = require('lodash'),
  Q = require('q');

var GameBoard = require('mule-models').GameBoard.Model,
  PieceState = require('mule-models').PieceState.Model;

exports.playTurn = function (req, res) {
  var gameBoardId = req.body.gameBoardId;
  var whichPieceId = req.body.whichPiece;
  var whereId = req.body.where;

  console.log("gameBoardId: " + gameBoardId);
  console.log("whichPieceId: " + whichPieceId);
  console.log("whereId: " + whereId);

  var sillz = false;

  GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      return gameBoard.populateQ('spaces');
    })
    .then(function (gameBoard) {
      return gameBoard.populateQ('pieces');
    })
    .then(function (gameBoard) {
      var promises = [];
      var piece = searchThruPiecesForId(gameBoard.pieces, whichPieceId);
      console.log('PEACE:')
      console.log(piece)
      if (!piece) {
        sillz = true;
        res.status(400).send({msg: "INVALID PIECE"});
      } else if (searchThruSpacesForId(gameBoard.spaces, whereId)) {
        var id = piece._doc._id;
        delete piece._doc._id;

        piece.location = whereId;
        console.log(piece.id + ' has new location ' + piece.location);

        var promise = PieceState.findByIdAndUpdateQ(id, piece._doc)
          .then(function (piece) {
            console.log("and this?")
            console.log(piece)
          })
          .fail(function (err) {
            console.log("BUT WHY ME?")
            console.log(err);
          });
        promises.push(promise);
      } else {
        sillz = true;
        res.status(400).send({msg: "INVALID SPACE"});
      }

      promises.push(gameBoard.saveQ());

      return Q.all(promises);
    })
    .then(function (savedGameBoard) {
      if (!sillz)
        res.status(200).send({msg: "ITS TRUE"})
    })
    .fail(function (err) {
      res.status(400).send({err: err});
    });

};

// Todo refactor into a smarter place?
var searchThruSpacesForId = function (spaces, spaceId) {
  var found = false;
  _.each(spaces, function (value, key) {
    if (value.boardSpaceId === spaceId) {
      found = value;
    }
  });
  console.log(found)
  return found;
};

var searchThruPiecesForId = function (pieces, pieceId) {
  var found = false;
  _.each(pieces, function (value, key) {
    if (value.id === pieceId) {
      found = value;
    }
  });

  return found;
};