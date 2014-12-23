
var should = require('should'),
  Q = require('q'),
  _ = require('lodash');

var multiplayerHelper = require('./multiplayerHelper'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper');

// p1 is moving towards 0, p2 is moving towards 25

var readRollAndBoardThenPlayDumbTurnQ = function (params) {
  var agent = params.agent,
    playerRel = params.playerRel,
    gameId = params.gameId;

  // read gamestate
  return gameHelper.readGameStateQ(params)
    .then(function (gameState) {      
      var newTurn = {
        gameId: gameId,
        actions: [{
          type: 'TurnAction',
          params: {
            moveTokens: [/*{
              pieceId: 9,
              currentPieceSpace: "10",
              spaceId: ["12"]
              rollUsed: [2]
            }*/]
          }
        }]
      };

      // decide turn
      var roll = gameState.globalVariables.roll,
        moveDirection = (playerRel === 'p1' ? -1 : 1),
        myPieces = {},
        theirPieces = {};

      // filter into to objects holding p1 & p2 pieces by spaceId
      _.each(gameState.pieces, function (piece) {
        var piecesBySpaceId = piece.ownerId === playerRel ? myPieces : theirPieces;

        if (!piecesBySpaceId[piece.locationId]) {
          piecesBySpaceId[piece.locationId] = [];
        }
        piecesBySpaceId[piece.locationId].push(piece);
      });

      // decide where to move (dumb)
      //   foreach dice roll
      //     1. check if my pieces are in jail
      //     2. try to move the furthest piece closer to its target

      var totalRolls = [];

      if (roll.die1 === roll.die2) {
        totalRolls = [roll.die1, roll.die1, roll.die2, roll.die2];
      } else {
        totalRolls = [roll.die1, roll.die2];
      }

      _.each(totalRolls, function (roll, key) {
        console.log('Determinng how use roll ' + key + ': ' + roll);
        var canMovePiece = false;
        // TODO check jail

        // determine order to check spaces to move pieces from
        var spacesToCheck = _.sortBy(_.keys(myPieces), function (spaceId) {
          if (playerRel === 'p1') {
            return 25 - Number(spaceId);
          } else {
            return Number(spaceId);
          }
        });
        var indexToMoveFrom = 0,
          maybeSpaceId,
          maybeMoveToSpaceId,
          pieceIdToMove;

        // loop over piecesBySpaceId to find something that can move
        do {
          maybeSpaceId = spacesToCheck[indexToMoveFrom];
          maybeMoveToSpaceId = String(Number(maybeSpaceId) + moveDirection * roll);

          if (_.isEmpty(theirPieces[maybeMoveToSpaceId])) {
            canMovePiece = true;
            pieceIdToMove = myPieces[maybeSpaceId][myPieces[maybeSpaceId].length - 1].id;
          } else {
            indexToMoveFrom++;
          }
        } while (!canMovePiece);

        // TODO need to account for if you've already moved that piece
        var moveSubAction = {
          pieceId: pieceIdToMove,
          currentPieceSpace: maybeSpaceId,
          spaceId: [maybeMoveToSpaceId],
          rollUsed: [roll]
        };
        //console.log(moveSubAction)
        newTurn.actions[0].params.moveTokens.push(moveSubAction);

        // also move the piece within myPieces
        var piece = myPieces[maybeSpaceId].pop();
        piece.locationId = maybeMoveToSpaceId;
        if (_.isEmpty(myPieces[maybeSpaceId])) {
          delete myPieces[maybeSpaceId];
        }
        /*if (_.isEmpty(myPieces[maybeMoveToSpaceId])) {
          myPieces[maybeMoveToSpaceId] = [];
        }
        myPieces[maybeMoveToSpaceId].push(piece); // dont one piece twice (less error prone)*/
      });

      console.log(newTurn.actions[0].params.moveTokens)

      return gameHelper.playTurnQ({agent: agent, turn: newTurn})
    });
};

exports.readRollAndBoardThenPlayDumbTurnQ = readRollAndBoardThenPlayDumbTurnQ;
