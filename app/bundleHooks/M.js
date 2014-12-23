var Q = require('q'),
  _ = require('lodash');

var brain = require('../turnSystem/brain'),
  PieceState = require('mule-models').PieceState.Model;


var createMObjectQ = function (gameId, debugPrefix) {
  return brain.loadGameStateObjectByIdQ(gameId)
    .then(function (gameStateObject) {
      return createHelper(gameStateObject, debugPrefix);
    });
};

var createHelper = function (gso, _debugPrefix) {
  var GSO = gso,
    that = {};

  // private variables
  var game = GSO.game,
    ruleBundle = GSO.ruleBundle,
    gameBoard = GSO.gameBoard,
    gameState = GSO.gameState,
    history = GSO.history;

  var debugPrefix = _debugPrefix;

  var gameStateChanged = false;

  var newPieceStates = [],
    savedNewPieceStateIds = [],

    modifiedPieceStateIds = [];

  var markedForDeletePieceIds = [];

  var piecesById,
    pieceMongoIdsById = {};

  var spacesByLocationId;

  if (gameState && gameState.pieces) {
    piecesById = _.indexBy(gameState.pieces, 'id');
    _.each(gameState.pieces, function (piece) { // EFF there might be better underscore function for this
      pieceMongoIdsById[piece.id] = piece._id;
    });

    spacesByLocationId = _.indexBy(gameState.spaces, 'boardSpaceId');
  }

  ////// private functions //////

  var resetM = function () {
    savedNewPieceStateIds = [];
    newPieceStates = [];
    gameStateChanged = false;
    markedForDeletePieceIds = [];
    modifiedPieceStateIds = [];
  };

  ////// public functions //////

  ///  Game (static)  ///
  that.getGameInfo; // P2

  ///  GameBoard (static)  ///
  that.getBoardInfo; // P2
  that.getBoardDefinition = function () {
    if (gameBoard.boardType == 'static') {
      return ruleBundle.rules.board;
    } else {
      return gameBoard.board;
    }
  }

  that.getCustomBoardSettings = function () {
    return game.ruleBundleGameSettings.customBoardSettings;
  };

  ///  History (static)  ///

  that.getCurrentTurnNumber = function () {
    return history.currentTurn;
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

  that.addToGlobalVariable = function (key, additionValue) {
    if (!additionValue) return;
    var newTotal = that.getGlobalVariable(key) + additionValue;
    that.setGlobalVariable(key, newTotal);
  };


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

  that.addToPlayerVariable = function (playerRel, key, additionValue) {
    if (!additionValue) return;
    var newTotal = that.getPlayerVariable(playerRel, key) + additionValue;
    that.setPlayerVariable(playerRel, key, newTotal);
  };

  that.getSpace = function (locationId) {
    return spacesByLocationId[locationId];
  };

  that.getSpaces = function (searchArgs) {};

  that.setSpace = function (spaceId, spaceObject) {};


  that.addPiece = function (pieceObject) {
    var randomId = Math.floor((Math.random() * 9999999) + 1); //TODO BAD

    var pieceObjectClone = _.clone(pieceObject); // doesn't have mongo properties on it
    pieceObjectClone.id = randomId;

    var newPieceState = new PieceState(pieceObjectClone);
    newPieceStates.push(newPieceState);

    piecesById[newPieceState.id] = pieceObjectClone;

    return newPieceState.id;
  };

  that.getPiece = function (pieceId) {
    return piecesById[pieceId];
  };
  that.getPieces = function (searchArgs) {
    var searchArgs = searchArgs || {},
      ownerId = searchArgs.ownerId,
      spaceId = searchArgs.spaceId || searchArgs.locationId,
      className = searchArgs.className || searchArgs.class,
      attrs = searchArgs.attrs;

    var pieces = _.filter(piecesById, function (piece) {
      if (!_.isUndefined(ownerId) && piece.ownerId != ownerId) {
        return false;
      }

      if (!_.isUndefined(spaceId) && piece.locationId != spaceId) {
        return false;
      }

      if (!_.isUndefined(className) && piece.class != className) {
        return false;
      }

      if (!_.isUndefined(attrs)) {
        var matchesAttrs = true;
        _.each(attrs, function (value, key) {
          if (piece.attributes[key] != value) {
            matchesAttrs = false;
          }
        });
        if (!matchesAttrs) {
          return false;
        }
      }

      return true;
    });

    // take off _v, _t, _id properties
    _.each(pieces, function (piece) {
      delete piece._v;
      delete piece._t;
      delete piece._id;
    });

    return pieces;
  };
  that.setPiece = function (pieceId, pieceObject) {
    if (!pieceObject.attributes) {
      pieceObject.attributes = {};
    }

    piecesById[pieceId] = pieceObject;

    var pieceStateMongoId = pieceMongoIdsById[pieceId];

    if (!_.contains(modifiedPieceStateIds, pieceStateMongoId)) {
      modifiedPieceStateIds.push(pieceStateMongoId);
    }
  };
  that.deletePiece = function (pieceId) {
    // TODO throw if pieceId doesnt exist (but what does a throw do in ever hook case, investigate that)
    that.deletePieces([pieceId]);
  };
  that.deletePieces = function (pieceIds) {
    if (pieceIds.length === 0) return;
    markedForDeletePieceIds = _.union(markedForDeletePieceIds, pieceIds);
    gameStateChanged = true;
  };

  ///  M  ///
  that.persistQ = function () {
    var dbObjectsChanged = 0,
      pieceStatePromises = [];

    if (newPieceStates.length > 0) {
      console.log('persistQ: newPieceStates: ' + newPieceStates.length);
      _.each(newPieceStates, function (newPiece) {
        var promise = newPiece.saveQ()
          .then(function (savedPieceState) {
            dbObjectsChanged++;
            savedNewPieceStateIds.push(savedPieceState._id);
            pieceMongoIdsById[savedPieceState.id] = savedPieceState.id;
          });

        pieceStatePromises.push(promise);
      });

      gameStateChanged = true;
    }

    _.each(modifiedPieceStateIds, function (pieceStateId) {
      var promise = PieceState.findByIdQ(pieceStateId)
        .then(function (foundPieceState) {
          if (!foundPieceState) {
            throw 'persistQ: invalid pieceStateId' + pieceStateId;
          }

          // EFF this prob could be better
          _.each(piecesById[foundPieceState.id], function (value, key) {
            foundPieceState[key] = value;
          })

          foundPieceState.markModified('attributes');

          delete foundPieceState._id;

          return foundPieceState.saveQ()
            .then(function (updatedPieceState) {
              //console.log('updatedPieceState: ' + updatedPieceState._id)
              dbObjectsChanged++;
            });
        });

      pieceStatePromises.push(promise);
    });

    return Q.all(pieceStatePromises)
      .then(function () {
        var savePromises = [];
        // save big objects

        if (gameStateChanged) {
          if (markedForDeletePieceIds.length > 0) {
            // TODO some checking if new pieces are about to be deleted, since the piecestateId wont be known til persistQ
            var deletePositions = [];
            _.each(gameState.pieces, function (pieceState, key) {
              _.each(markedForDeletePieceIds, function (markedPieceId) {
                var markedPieceStateId = pieceMongoIdsById[markedPieceId];
                if (('' + markedPieceStateId) === ('' + pieceState._id)) {
                  deletePositions.push(key);
                }
              });
            });
            deletePositions = _.sortBy(deletePositions, function(num){ return num; });
            deletePositions.reverse();
            _.each(deletePositions,function (value) {
              // delete them in reverse order
              gameState.pieces.splice(value, 1);
            });
          }

          _.each(savedNewPieceStateIds, function (pieceStateId) {
            gameState.pieces.push(pieceStateId);
          });

          gameState.markModified('pieces');
          savePromises.push(gameState.saveQ().then(function (savedGameState) {
            gameState = savedGameState;
            dbObjectsChanged++;
          }));
        }

        return Q.all(savePromises);
      })
      .then(function () {
        console.log('Persist Successful (' + dbObjectsChanged + ')');
        resetM();
      });
  };

  that.reject; // alias for throw, to make people feel better

  that.log = function (string) {
    if (debugPrefix) {
      console.log(debugPrefix + ': ' + string);
    } else {
      console.log(string);
    }
  };

  ////////////////////////////////

  return that;
};

module.exports = createMObjectQ;
