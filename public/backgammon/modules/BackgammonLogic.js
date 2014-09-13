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
      spaceIdInt = parseInt(spaceId);

    if (isNaN(spaceIdInt)) {
      return [];
    }

    var addPossibleSpace = function (rolls) {
      var roll = _.reduce(rolls, function (memo, num) {
        return memo + num;
      }, 0);
      var possibleSpace = spaceIdInt + roll * rollModifier;

      if (that.isNotMainBoardSpace(possibleSpace)) { return; }
      // TODO is 0 or 25 = scorespace

      possibleMoveLocations[possibleSpace] = rolls;
    };

    // single rolls
    _.each(rollsLeft, function (roll) { addPossibleSpace([roll]); });
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
    return spaceNumber < 1 || spaceNumber > 24
  };

  return that;
});