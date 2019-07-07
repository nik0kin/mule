var PQueue = require('p-queue').default;
var Q = require('q');

var queueCache = {};

/**
 *  add a process callback to queue, will not be queued at the same time
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
