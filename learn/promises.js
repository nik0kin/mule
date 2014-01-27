/**
 * Created by niko on 1/26/14.
 */
var Q = require('q');

exports.promiseMeChicken = function(want) {
  var deferred = Q.defer();
  console.log("want: " + want);

  if (want)  {
    deferred.resolve(want);
  } else {
    deferred.reject({reason: "didnt want"});
  }

  return deferred.promise;
};