var Q = require('q'),
  _ = require('lodash');

var brain = require('../turnSystem/brain');


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

  var gameStateChanged = false;

  ////// public functions //////

  ///  Game (static)  ///
  that.getGameInfo; // P2

  ///  GameBoard (static)  ///
  that.getBoardInfo; // P2
  that.getBoardDefinition; // P2

  ///  History (static)  ///
  that.getPreviousTurn; // P3
  that.getTurnByNumberQ; // P4
  that.getTurnsByRoundQ; // P4

  ///  RuleBundle (static)  ///
  that.getRuleBundle; // P3

  ///  GameState  ///
  that.getGlobalVariable = function (key) {
    return gameState.globalVariables[key];
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
  that.setPlayerVariable = function (playerRel, key, value) {
    gameState.playerVariables[playerRel][key] = value;
    gameState.markModified('playerVariables');
    gameStateChanged = true;
  };
  that.setPlayerVariables = function (playerRel, keyValueObject) {};

  that.getSpace = function (spaceId) {};
  that.setSpace = function (spaceId, spaceObject) {};

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
    var savePromises = [];

    if (gameStateChanged) {
      savePromises.push(gameState.saveQ());
    }

    return Q.all(savePromises)
      .then(function () {
        console.log('Persist Successful');
      });
  };
  //reject() - alias for throw, to make people feel better

  ////////////////////////////////

  return that;
};

module.exports = createMObjectQ;
