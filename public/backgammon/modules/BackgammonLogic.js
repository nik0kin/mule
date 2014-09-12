// No player logic or turn logic here. NONE, not one bit (or one byte really)

define(function () {
  var that = {};

  // returns an array of spaceIds
  that.getPossibleMoveLocations = function (spaceId, diceRoll, blackOrWhite) {
    var rollModifier = blackOrWhite === 'black' ? -1 : 1,
      isDoubles = diceRoll.die1 === diceRoll.die2,
      possibleMoveLocations = [],
      spaceIdInt = parseInt(spaceId);

    if (isNaN(spaceIdInt)) {
      return [];
    }

    _.each(diceRoll, function (roll) {
      var possibleSpace = spaceIdInt + roll * rollModifier;

      if (possibleSpace < 1 || possibleSpace > 24) { return; }
      // TODO is 0 or 25 = scorespace

      possibleMoveLocations.push('' + possibleSpace);
    });

    if (isDoubles) {
      possibleMoveLocations.push('' + (diceRoll.die1 + diceRoll.die2));
    }

    return possibleMoveLocations;
  };

  return that;
});