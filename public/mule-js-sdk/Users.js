/**
 * js-sdk/Users.js
 *
 * Created by niko on 2/5/14.
 */

define(function () {
  return function (contextPath) {
    var that = {};

    that.indexQ = function () {
      return $.ajax({
        type: "GET",
        url: contextPath+"users"
      });
    };

    that.createQ = function (params) {
      return $.ajax({
        type: "POST",
        url: contextPath+"users",
        data: params
      });
    };

    that.readQ = function (userID) {
      return $.ajax({
        type: "GET",
        url: contextPath+"users/" + userID
      });
    };

    ////// USER SERVICES //////

    that.loginQ = function (params) {
      return $.ajax({
        type: "POST",
        url: contextPath+"LoginAuth",
        data: params
      });
    };

    return that;
  };
});