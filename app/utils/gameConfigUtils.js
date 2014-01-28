/**
 * gameConfigUtils
 *
 * Created by niko on 1/26/14.
 */

var Q = require('q');

var jsonUtils = require('./jsonUtils');

/*
take in jsonBody = gameConfig, make sure it looks like the following:
 Example gameConfig
 {
 "name": "fun game 3v3",
 "numofplayers": 6,
 "width": 40,
 "height": 40,
 "fog": false,
 "turnstyle": "realtime"
 }

return validatedParams if all goes well
return err if not
 */


//return a promise
exports.promiseToValidate = function(jsonBody) {
  var gameConfigParamSpec = {
    name:         {required: true, type : 'string'},
    numofplayers: {required: true, type : 'number'},
    width:        {required: true, type : 'number'},
    height:       {required: true, type : 'number'},
    fog:          {required: true, type : 'boolean'},
    turnstyle:    {required: true, type : 'string'}
  };

  var myPromise = Q.promise(function(resolve, reject){
    if (!jsonBody || typeof jsonBody !== 'object')
      return reject('gameConfig not an object');

    jsonUtils.validateJSONBody(jsonBody, gameConfigParamSpec, function (validatedParams){
      resolve(validatedParams);
    }, function (problemParams){
      reject(problemParams);
    });
  });

  return myPromise
};