/**
 * utils.js
 *
 * Created by niko on 1/21/14.
 */

var _ = require("underscore");

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
exports.validateJSONBody = function(bodyJSON, parameterSpecs, missingParamCallback){
  if (!bodyJSON) throw "undefined bodyJSON";

  if (parameterSpecs && !missingParamCallback) throw "need callback, if there is required Parameters";

  var validatedParams = {};

  _.each(bodyJSON, function (bodyValue, bodyKey){
    if(!parameterSpecs || (parameterSpecs && !parameterSpecs[bodyKey]) ) {
      validatedParams[bodyKey] = bodyValue;
      return;
    }

    var paramSpec = parameterSpecs[bodyKey];

    if (paramSpec === true) { //depreciated
      parameterSpecs[bodyKey] = false; //mark as done
      validatedParams[bodyKey] = bodyValue;
      return;
    }

    var validateBodyValueWithParam = function(parameterSpec) {
      //if its not defined ( .required), or required === true TODO refactor this lol
      //  then validate it
      if(typeof parameterSpec.required === 'undefined' || parameterSpec.required === true || parameterSpec.required === false){
        switch (parameterSpec.type) {
          case "Boolean":
            if (bodyValue === "true")
              bodyValue = true;
            else if(bodyValue === "false")
              bodyValue = false;

            if (typeof bodyValue === "boolean")  {
            } else {
              //call error
              missingParamCallback(bodyKey)
            }
            break;
          case "Number":
            break;
          case "String":
            break;
        }
        validatedParams[bodyKey] = bodyValue;
      }else{//if its required and doesnt exist,
        //call error
        missingParamCallback(bodyKey)
      }

    };

    if (typeof paramSpec === "object") {
      validateBodyValueWithParam(paramSpec);
    }

  });

  _.each(parameterSpecs, function(value, key){
    if(value === true)//depriciated
      missingParamCallback(key);
  });

  return validatedParams;
};