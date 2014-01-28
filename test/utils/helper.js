/**
 * Created by niko on 1/27/14.
 */

exports.generateDoneCallback = function(done) {
  return function(err){
    done();
  };
};
exports.shouldThrowHereCallback = exports.generateDoneCallback;

exports.shouldntThrowHereCallback = function(err){
  throw "this shouldn't throw here: " + err;
};