/**
 * utils.js
 *
 * Created by niko on 1/21/14.
 */

var _ = require("underscore");

exports.validateJSONBody = function(bodyJSON, requiredParams, missingParamCallback){
  if (!bodyJSON) throw "undefined bodyJSON";

  if (requiredParams && !missingParamCallback) throw "need callback, if there is required Parameters";

  var params = {};

  _.each(bodyJSON, function (value, key){
    if(!requiredParams || (requiredParams && requiredParams[key]))
    params[key] = value;

    if(requiredParams && requiredParams[key])
      requiredParams[key] = false;
  });

  _.each(requiredParams, function(value, key){
    if(value)
      missingParamCallback(key);
  });

  return params;
};