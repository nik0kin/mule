/**
 * jsonUtilsHelper.js
 *
 * Created by niko on 1/26/14.
 */
var Q = require('q');
var _ = require('underscore');

//check if its boolean
//and returns 'undefined' if its not valid
exports.checkBoolean = function(bodyValue) {
  return Q.promise(function(resolve, reject) {
    var retValue = bodyValue;
    if (bodyValue === "true")
      retValue = true;
    else if(bodyValue === "false")
      retValue = false;

    if (typeof retValue === "boolean")  {
      resolve(retValue);
    } else {
      reject({reason: "not boolean"});
    }
  });
};


exports.validateBodyValueWithParam = function(specKey, bodyValue, parameterSpec) {
  //if its not defined ( .required), or required === true TODO add required
  //  then validate it
  return Q.promise(function(resolve, reject) {
    if(typeof parameterSpec.required === 'undefined' || parameterSpec.required === true || parameterSpec.required === false){
      switch (parameterSpec.type) {
        case "boolean":
        case "Boolean":
          exports.checkBoolean(bodyValue)
            .done(function(value) {
              resolve(value);
            }, function(err) {
              err["key"] = specKey;
              resolve(err)
            });
          break;
        case "number":
        case "Number":
          if (_.isNumber(bodyValue)){
            resolve( Number(bodyValue));
          }else if (!_.isNaN(Number(bodyValue))){
            resolve( Number(bodyValue));
          } else {
            reject(specKey)
          }

          break;
        case "string":
        case "String":
          if (_.isString(bodyValue)){
            resolve(bodyValue);
          } else {
            reject(specKey)
          }
          break;
        default:
          if (typeof bodyValue === "undefined")
            reject(specKey)
          else
            resolve(bodyValue)
      }
    } else {//if its required and doesnt exist,
      reject(specKey)
    }
  });
};
