var Q = require('q'),
  _ = require('lodash');

var brain = require('../turnSystem/brain'),
  PieceState = require('mule-models').PieceState.Model;


var createMObjectQ = function (gameId) {
  return brain.loadGameStateObjectByIdQ(gameId)
    .then(function (gameStateObject) {
      return createHelper(gameStateObject);
    });
};

var createHelper = function (gso) {
  var GSO = gso,
    that = {};

  // private variables
  var gameState = GSO.gameState;
  var history = GSO.history;

  var gameStateChanged = false;

  var newPieceStates = [],
    savedPieceStates = [];

  ////// private functions //////

  var resetM = function () {

  };

  ////// public functions //////

  ///  Game (static)  ///
  that.getGameInfo; // P2

  ///  GameBoard (static)  ///
  that.getBoardInfo; // P2
  that.getBoardDefinition; // P2

  ///  History (static)  ///

  that.getCurrentTurnNumber = function () {
    return history.currentRound;
  };

  that.getCurrentRoundNumber = function () {
    return history.currentRound;
  };

  that.getPreviousTurn; // P3
  that.getCurrentTurn; // P3
  that.getTurnByNumberQ; // P4
  that.getTurnsByRoundQ; // P4

  ///  RuleBundle (static)  ///
  that.getRuleBundle; // P3

  ///  GameState  ///
  that.getGlobalVariable = function (key) {
    return gameState.globalVariables[key];
  };

  that.getGlobalVariables = function () {
    return gameState.globalVariables;
  };

  that.setGlobalVariable = function (key, value) {
    gameState.globalVariables[key] = value;
    gameState.markModified('globalVariables');
    gameStateChanged = true;
  };
  that.setGlobalVariables = function (keyValueObject) {};


  that.getPlayerVariable = function (playerRel, key) {
    return gameState.playerVariables[playerRel][key];
  };

  that.getPlayerVariables = function (playerRel) {
    return gameState.playerVariables[playerRel];
  };

  that.setPlayerVariable = function (playerRel, key, value) {
    gameState.playerVariables[playerRel][key] = value;
    gameState.markModified('playerVariables');
    gameStateChanged = true;
  };
  that.setPlayerVariables = function (playerRel, keyValueObject) {};


  that.getSpace = function (spaceId) {};

  that.getSpaces = function (searchArgs) {};

  that.setSpace = function (spaceId, spaceObject) {};


  that.addPiece = function (pieceObject) {
    var randomId = Math.floor((Math.random() * 9999999) + 1); //TODO BAD

    var newPieceState = new PieceState(_.clone(pieceObject));
    newPieceState.id = randomId;

    newPieceStates.push(newPieceState);
  };

  that.getPiece = function (pieceId) {};
  that.getPieces = function (searchArgs) {
    var ownerId = searchArgs.ownerId,
      spaceId = searchArgs.spaceId,
      className = searchArgs.className;

    var pieces = _.filter(gameState.pieces, function (piece) {
      if (!_.isUndefined(ownerId) && piece.ownerId != ownerId) {
        return false;
      }

      if (!_.isUndefined(spaceId) && piece.locationId != spaceId) {
        return false;
      }

      if (!_.isUndefined(className) && piece.className != className) {
        return false;
      }

      return true;
    });

    return pieces;
  };
  that.setPiece = function (pieceId, object) {};


  ///  M  ///
  that.persistQ = function () {
    var newPiecesPromises = [];

    if (newPieceStates.length > 0) {
      _.each(newPieceStates, function (newPiece) {
        var promise = newPiece.saveQ()
          .then(function (savedPieceState) {
            savedPieceStates.push(savedPieceState);
          });

        newPiecesPromises.push(promise);
      });

      gameState.markModified('pieces');

      gameStateChanged = true;
    }

    return Q.all(newPiecesPromises)
      .then(function () {
        var savePromises = [];
        // save big objects

        if (gameStateChanged) {

          _.each(savedPieceStates, function (pieceState) {
            // EFF this is a dumb hack.
            var pieceStateId = JSON.stringify(pieceState._id).substring(1,24);
            //console.log(JSON.stringify(pieceStateId).substring(1,41))
            console.log("this: " + pieceStateId)
            gameState.pieces.push(pieceStateId);
          });

          savePromises.push(gameState.saveQ());
        }

        return Q.all(savePromises);
      })
      .then(function () {
        console.log('Persist Successful');
        resetM();
      });
  };
  //reject() - alias for throw, to make people feel better

  ////////////////////////////////

  return that;
};

module.exports = createMObjectQ;
