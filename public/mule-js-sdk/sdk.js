/**
 * sdk.js
 *
 * Created by niko on 2/5/14.
 */

define(["mule-js-sdk/Users", "mule-js-sdk/Games"], function (Users, Games) {
  return function (contextPath) {
    var that = {};

    that.Users = Users(contextPath);
    that.Games = Games(contextPath);

    return that;
  };
});