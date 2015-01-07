
var _ = require('lodash'),
  Q = require('q');

var History = require('mule-models').History.Model;

exports.indexQ = function () {
  return History.find().execQ();
};

exports.readQ = function (historyId){
  var _history;

  return History.findByIdQ(historyId)
    .then(function (history) {
      var h = history._doc;
      _history = h;
      return history.getPlayersTurnStatusQ();
    })
    .then(function (status) {
      _history.currentTurnStatus = status;
      return Q(_history);
    });
};

exports.readFullQ = function (historyId){
  var _history;

  return History.findFullByIdQ(historyId)
    .then(function (history) {
      var h = history._doc;
      _history = h;
      return history.getPlayersTurnStatusQ();
    })
    .then(function (status) {
      _history.currentTurnStatus = status;
      return Q(_history);
    });
};
