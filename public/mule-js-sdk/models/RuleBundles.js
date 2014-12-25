/**
 * js-sdk/models/RuleBundles.js
 *
 * Created by niko on 2/16/14.
 */

define([], function () {
  return function (contextPath) {
    var that = {};

    that.indexQ = function () {
      return $.ajax({
        type: "GET",
        url: contextPath+"ruleBundles"
      });
    };

    that.createQ = function (params) {
      return $.ajax({
        type: "POST",
        url: contextPath+"ruleBundles",
        data: params
      });
    };

    that.readQ = function (ruleBundleId) {
      return $.ajax({
        type: "GET",
        url: contextPath+"ruleBundles/" + ruleBundleId
      });
    };

    return that;
  };
});