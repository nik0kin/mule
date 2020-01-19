var Q = require('q'),
  _ = require('lodash');

var brain = require('../turnSystem/brain'),
  logging = require('mule-utils').logging,
  SpaceState = require('mule-models').SpaceState.Model,
  PieceState = require('mule-models').PieceState.Model;


var createMObjectQ = function (gameId, debugPrefix) {
  return brain.loadGameStateObjectByIdQ(gameId)
    .then(function (gameStateObject) {
      return gameStateObject.history.getLastAddedTurnQ()
        .then(function (lastTurn) {
          return createHelper(gameStateObject, lastTurn, debugPrefix);
        });
    });
};

var createHelper = function (gso, _lastTurn, _debugPrefix) {
  var GSO = gso,
    that = {};

  // private variables
  var game = GSO.game,
    ruleBundle = GSO.ruleBundle,
    gameBoard = GSO.gameBoard,
    gameState = GSO.gameState,
    history = GSO.history;

  var lastTurn = _lastTurn;

  var debugPrefix = _debugPrefix;

  var gameStateChanged = false;

  var newPieceStates = [],
    savedNewPieceStateIds = [],
    modifiedPieceStateIds = [],
    markedForDeletePieceIds = [];

  var modifiedSpaceStateIds = [];

  var piecesById,
    pieceMongoIdsById = {};

  var spacesByLocationId,
    spaceMongoIdsByLocationId = {};

  if (gameState && gameState.pieces && gameState.spaces) {
    piecesById = _.keyBy(gameState.pieces, 'id');
    _.each(gameState.pieces, function (piece) { // EFF there might be better underscore function for this
      pieceMongoIdsById[piece.id] = piece._id;
    });

    spacesByLocationId = _.keyBy(gameState.spaces, 'boardSpaceId');
    _.each(gameState.spaces, function (space) { // EFF there might be better underscore function for this
      spaceMongoIdsByLocationId[space.boardSpaceId] = space._id;
    });

  }

  ////// private functions //////

  var resetM = function () {
    savedNewPieceStateIds = [];
    newPieceStates = [];
    gameStateChanged = false;
    markedForDeletePieceIds = [];
    modifiedPieceStateIds = [];
    modifiedSpaceStateIds = [];
  };

  ////// public functions //////

  ///  Game (static)  ///
  that.getGameInfo; // P2
  that.getPlayerRels = function () {
    return _.keys(game.players);
  };

  ///  GameBoard (static)  ///
  that.getBoardInfo; // P2
  that.getBoardDefinition = function () {
    if (gameBoard.boardType == 'static') {
      return ruleBundle.rules.board;
    } else {
      return gameBoard.board;
    }
  };

  that.getCustomBoardSettings = function () {
    return game.ruleBundleGameSettings.customBoardSettings || {};
  };

  ///  History (static)  ///

  that.getCurrentTurnNumber = function () {
    return history.currentTurn;
  };

  that.getCurrentRoundNumber = function () {
    return history.currentRound;
  };

  that.getPreviousTurn; // P3
  that.getCurrentTurn = function () {
    return lastTurn;
  };
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
  that.setGlobalVariables = function (keyValueObject) {
    throw new Error('NYI');
  };

  that.addToGlobalVariable = function (key, additionValue) {
    if (!additionValue) return;
    var newTotal = that.getGlobalVariable(key) + additionValue;
    that.setGlobalVariable(key, newTotal);
  };


  that.getPlayerVariable = function (playerRel, key) {
    if (!gameState.playerVariables[playerRel]) {
      return undefined;
    }
    return gameState.playerVariables[playerRel][key];
  };

  that.getPlayerVariables = function (playerRel) {
    return gameState.playerVariables[playerRel] || {};
  };

  that.setPlayerVariable = function (playerRel, key, value) {
    if (!gameState.playerVariables[playerRel]) {
      gameState.playerVariables[playerRel] = {};
    }
    gameState.playerVariables[playerRel][key] = value;
    gameState.markModified('playerVariables');
    gameStateChanged = true;
  };
  that.setPlayerVariables = function (playerRel, keyValueObject) {
    throw new Error('NYI');
  };

  that.addToPlayerVariable = function (playerRel, key, additionValue) {
    if (!additionValue) return;
    var newTotal = that.getPlayerVariable(playerRel, key) + additionValue;
    that.setPlayerVariable(playerRel, key, newTotal);
  };

  that.getSpace = function (locationId) {
    return spacesByLocationId[locationId];
  };

  that.getSpaces = function (searchArgs) {
    return spacesByLocationId;
  };

  that.setSpace = function (spaceId, spaceObject) {
    if (!spaceObject.attributes) {
      spaceObject.attributes = {};
    }

    spacesByLocationId[spaceId] = spaceObject;

    var spaceStateMongoId = spaceMongoIdsByLocationId[spaceId];

    if (!_.includes(modifiedSpaceStateIds, spaceStateMongoId)) {
      modifiedSpaceStateIds.push(spaceStateMongoId);
    }
  };

  function createPieceState(pieceObject, id) {
    var pieceObjectClone = _.clone(pieceObject); // doesn't have mongo properties on it
    if (id) pieceObjectClone.id = id;

    // Don't allow bundleCode to set mongo _id
    if (pieceObjectClone.hasOwnProperty('_id')) {
      delete pieceObjectClone._id;
    }

    piecesById[pieceObjectClone.id] = pieceObjectClone;

    return new PieceState(pieceObjectClone);
  }

  that.addPiece = function (pieceObject) {
    var randomId = Math.floor((Math.random() * 9999999) + 1); // TODO BAD
    var newPieceState = createPieceState(pieceObject, randomId)
    newPieceStates.push(newPieceState);

    return newPieceState.id;
  };

  that.getPiece = function (pieceId) {
    return piecesById[pieceId];
  };
  that.getPieces = function (_searchArgs) {
    var searchArgs = _searchArgs || {},
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

    // If the PieceState is new, replace it
    var existingNewPieceStateIndex = _.findIndex(newPieceStates, function (pieceState) {
      return pieceState.id === pieceId;
    });
    if (existingNewPieceStateIndex !== -1) {
      var newPieceState = createPieceState(pieceObject);
      newPieceStates[existingNewPieceStateIndex] = newPieceState;
      return;
    }

    piecesById[pieceId] = pieceObject;

    // If the PieceState hasn't been modified before, make sure it gets saved
    var pieceStateMongoId = pieceMongoIdsById[pieceId];
    if (!_.includes(modifiedPieceStateIds, pieceStateMongoId)) {
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
      statePromises = [];

    if (newPieceStates.length > 0) {
      logging.log('persistQ: newPieceStates: ' + newPieceStates.length, game._id);
      _.each(newPieceStates, function (newPiece) {
        var promise = newPiece.saveQ()
          .then(function (savedPieceState) {
            dbObjectsChanged++;
            savedNewPieceStateIds.push(savedPieceState._id);
            pieceMongoIdsById[savedPieceState.id] = savedPieceState.id;
          });

        statePromises.push(promise);
      });

      gameStateChanged = true;
    }

    _.each(modifiedPieceStateIds, function (pieceStateId) {
      var promise = PieceState.findByIdQ(pieceStateId)
        .then(function (foundPieceState) {
          if (!foundPieceState) {
            throw 'persistQ: invalid pieceStateId ' + pieceStateId;
          }

          // EFF this prob could be better
          _.each(piecesById[foundPieceState.id], function (value, key) {
            if (key === '_id') {
              // this is to prevent an error when _id is set to undefined, but it is a kludge/workaround
              //   there should not be a pieceId in modifiedPieceStateIds that has not been saved
              if (value === 'undefined' || value === undefined) {
                console.log('OHHH NOOO attempting to set _id: ' + value, pieceStateId);
                console.log(piecesById[foundPieceState.id]);
                console.log('PLEASE FIX');
              }
              return;
            }
            foundPieceState[key] = value;
          });

          foundPieceState.markModified('attributes');

          delete foundPieceState._id;

          return foundPieceState.saveQ()
            .then(function (updatedPieceState) {
              logging.vvog('updatedPieceState: ' + updatedPieceState._id, game._id);
              dbObjectsChanged++;
            });
        });

      statePromises.push(promise);
    });

    _.each(modifiedSpaceStateIds, function (spaceStateId) {
      var promise = SpaceState.findByIdQ(spaceStateId)
        .then(function (foundSpaceState) {
          if (!foundSpaceState) {
            throw 'persistQ: invalid spaceStateId' + spaceStateId;
          }

          var newSpace = spacesByLocationId[foundSpaceState.boardSpaceId];

          foundSpaceState.boardSpaceId = newSpace.boardSpaceId;
          foundSpaceState.attributes = newSpace.attributes;

          foundSpaceState.markModified('attributes');

          delete foundSpaceState._id;

          return foundSpaceState.saveQ()
            .then(function (updatedSpaceState) {
              dbObjectsChanged++;
            });
        });

      statePromises.push(promise);
    });

    return Q.all(statePromises)
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
            deletePositions = _.sortBy(deletePositions, function (num) { return num; });
            deletePositions.reverse();
            _.each(deletePositions, function (value) {
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
        logging.log('Persist Successful (' + dbObjectsChanged + ' objects saved)', game._id);
        resetM();
      });
  };

  that.reject; // alias for throw, to make people feel better

  that.log = function (string) {
    if (debugPrefix) {
      logging.MLog(debugPrefix + ': ' + string, game._id);
    } else {
      logging.MLog(string, game._id);
    }
  };

  ////////////////////////////////

  return that;
};

module.exports = createMObjectQ;
