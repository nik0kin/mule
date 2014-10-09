// No player logic or turn logic here. NONE, not one bit (or one byte really)

define(function () {
  var that = {};

  // returns an object of {spaceId: [roll1]}
  that.getPossibleMoveLocations = function (params) {
    var spaceId = params.spaceId,
      rollsLeft = params.rollsLeft,
      blackOrRed = params.blackOrRed,

      rollModifier = blackOrRed === 'black' ? -1 : 1,
      possibleMoveLocations = {},
      spaceIdInt = parseInt(spaceId),

      isJailSpace = spaceId === 'blackJail' || spaceId === 'redJail';

    if (isNaN(spaceIdInt) && !isJailSpace) {
      return [];
    }

    var addPossibleSpace = function (_spaceId, rolls) { possibleMoveLocations[_spaceId] = rolls; };

    var addNormalMoveToPossibleSpace = function (rolls) {
      var roll = _.reduce(rolls, function (memo, num) {
        return memo + num;
      }, 0);
      var possibleSpace = spaceIdInt + roll * rollModifier,
        possibleScoreSpace = that.toSpaceId(possibleSpace);

      if (possibleScoreSpace) {
        possibleSpace = possibleScoreSpace;
      }

      addPossibleSpace(possibleSpace, rolls);
    };

    // single rolls
    _.each(rollsLeft, function (roll) {
      if (isJailSpace) {
        var possibleUnjailSpace = that.unjailRollToSpaceId(roll, spaceId === 'blackJail' ? 'black' : 'red');
        addPossibleSpace(possibleUnjailSpace, [roll]);
      } else {
        // TODO NEXT, bugfix: dont call this function if it was already called for an exact move
        addNormalMoveToPossibleSpace([roll]);
      }
    });
/*
    // combinations
    if (rollsLeft.length === 2) {
      addPossibleSpace([rollsLeft[0], rollsLeft[1]]);
    }

    if (rollsLeft.length === 3) {
      addPossibleSpace([rollsLeft[0], rollsLeft[1]]);
      addPossibleSpace([rollsLeft[1], rollsLeft[2]]);
    }

    if (rollsLeft.length === 4) {
      addPossibleSpace([rollsLeft[0], rollsLeft[1]]);
      addPossibleSpace([rollsLeft[0], rollsLeft[2]]);
      addPossibleSpace([rollsLeft[1], rollsLeft[3]]);
    }
*/
    return possibleMoveLocations;
  };

  that.isNotMainBoardSpace = function (spaceNumber) {
    return spaceNumber < 1 || spaceNumber > 24;
  };

  that.toSpaceId = function (spaceNumber) {
    if (spaceNumber < 1) {
      return 'blackScoreSpace';
    } else if (spaceNumber > 24) {
      return 'redScoreSpace';
    } else {
      return undefined;
    }
  };

  that.spaceIdToUnjailRoll = function (spaceId) {
    var spaceIdInt = parseInt(spaceId);

    if (spaceIdInt >= 1 && spaceIdInt <= 6) {
      return spaceIdInt;
    } else if (spaceIdInt >= 19 && spaceIdInt <= 24) {
      return 25 - spaceIdInt;
    } else {
      return -1;
    }
  };

  that.unjailRollToSpaceId = function (roll, blackOrRed) {
    if (blackOrRed === 'red') {
      // leaving red jail (going to 1-6)
      return '' + roll;
    } else {
      // leaving black jail (going to 24-19)
      return 25 - roll;
    }
  };

  return that;
});