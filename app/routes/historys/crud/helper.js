
var _ = require('lodash'),
  Q = require('q'),
  winston = require('winston');

var History = require('mule-models').History.Model;

exports.indexQ = function () {
  return History.find().execQ();
};

exports.readQ = function (historyID){
  var _history;

  return History.findByIdQ(historyID)
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

exports.readFullQ = function (historyID){
  var _history;

  return History.findFullByIdQ(historyID)
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
