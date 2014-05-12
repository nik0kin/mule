
var _ = require('lodash'),
  Q = require('q'),
  winston = require('winston');

var History = require('mule-models').History.Model;

exports.indexQ = function () {
  return History.find().execQ();
};

exports.readQ = function (historyID){
  return History.findByIdQ(historyID)
    .then(function (history) {
      var h = history._doc;
      h.currentTurnStatus = history.getPlayersTurnStatus();
      return h;
    });
};

