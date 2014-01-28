/**
 * Created by niko on 1/27/14.
 */

exports.generateDoneCallback = function(done) {
  return function(err){
    done();
  };
};
exports.shouldGoHereCallback = exports.generateDoneCallback;

exports.shouldntGoHereCallback = function(done) {
  return function(err) {
    done("this shouldn't throw here: " + err);
  };
};