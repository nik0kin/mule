var GameState = require('mule-models').GameState.Model;

exports.indexQ = function () {
  return GameState.find().execQ();
};

exports.readQ = function (gameStateId){
  return GameState.findByIdWithPopulatedStatesQ(gameStateId)
    .then(function (gameState) {
      var gs = gameState._doc;
      return gs;
    });
};

