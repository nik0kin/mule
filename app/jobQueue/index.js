var PQueue = require('p-queue').default;
var Q = require('q');

var queueCache = {};

/**
 *  add a function to process to the queue, it will not be executed at the same time
 *    as another process with the same gameId
 **/
exports.addJob = function addJob(gameId, process) {
  if (!queueCache[gameId]) {
    queueCache[gameId] = new PQueue({concurrency: 1});
  }
  var result;
  return Q().then(function() {
    return queueCache[gameId].add(function() {
      return process()
        .then(function(_result) {
          result = _result;
        });
    })
      .then(function() {
        return result;
      });
  });
}
