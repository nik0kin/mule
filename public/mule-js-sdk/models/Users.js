/**
 * js-sdk/models/Users.js
 *
 * Created by niko on 2/5/14.
 */

define(function () {
  var userID;

  return function (contextPath) {
    var that = {};

    that.getLoggedInUserID = function () {
      return userID;
    };

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
      })
        .then(function (result) {
          userID = result.userID;
          return result;
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
      })
        .then(function (result) {
          userID = result.userID;
          return result;
        });
    };

    return that;
  };
});