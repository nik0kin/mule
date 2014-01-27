/**
 * gameConfigUtils
 *
 * Created by niko on 1/26/14.
 */

var Q = require('q');

var jsonUtils = require('./jsonUtils');

/*
 Example gameConfig
 {
 "name": "fun game 3v3",
 "numofplayers": 6,
 "width": 40,
 "height": 40,
 "fog": false,
 "turnstyle": "realtime"
 }

 */


//return a promise
exports.promiseToValidate = function(value) {
  var myPromise = Q.promise(function(resolve, reject){
    if (value > 0)
      resolve(value);
    else
      reject();
  });

  return myPromise
};