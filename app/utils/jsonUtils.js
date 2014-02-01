/**
 * utils.js
 *
 * Created by niko on 1/21/14.
 */

var _ = require("underscore"),
  Q = require('q');

var help = require('./jsonUtilsHelper');

/*
 bodyJSON example:
 {"booleankey" : true }

 parameterSpecs example:
 {
 booleankey: {
 required: true,
 type: "Boolean"
 }
 }
 */
exports.validateJSONBody = function(bodyJSON, parameterSpecs, allSuccessfulCallback, unsuccessfulParamsCallback){
  if (!bodyJSON) throw "undefined bodyJSON";

  if (parameterSpecs && !unsuccessfulParamsCallback) throw "need callback, if there is required Parameters";

  var validatedParams = {};
  var problemParams = {};

  var validationPromises = [];

  if (!parameterSpecs){
    //old i think?, we should always have a spec, (but required can be false for optional parameters)
    _.each(bodyJSON, function (bodyValue, bodyKey){
      validatedParams[bodyKey] = bodyValue;
    });
  } else {
    _.each(parameterSpecs, function (specValue, specKey){
      var bodyValue = bodyJSON[specKey];

      if (typeof parameterSpecs[specKey] !== "object") {
        throw "no support for non object parameterSpecs"
      }

      var paramSpec = parameterSpecs[specKey];
      if (typeof paramSpec === "object") {
        var newPromise = Q.promise(function(resolve, reject) {
          help.validateBodyValueWithParam(specKey, bodyValue, paramSpec)
            .done(function(value) {
              validatedParams[specKey] = value;
              resolve();
            }, function(err) {
              problemParams[specKey] = err;
              resolve();
            });
        });
        validationPromises.push(newPromise);
      }
    });
  }

  Q.all(validationPromises)
    .done(function(value){
      if (!_.isEmpty(validatedParams) && _.isEmpty(problemParams) && typeof allSuccessfulCallback === "function")
        allSuccessfulCallback(validatedParams);

      if (!_.isEmpty(problemParams) && typeof unsuccessfulParamsCallback === "function")
        unsuccessfulParamsCallback(problemParams);

    }, function(err){
      throw "ohhhhhhhh shit" + err;
    });
};