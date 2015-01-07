var Turn = require('mule-models').Turn.Model;

exports.readQ = function (turnId){
  return Turn.findByIdQ(turnId);
};
