/**
 * sdk.js
 *
 * Created by niko on 2/5/14.
 */

define(
  ["mule-js-sdk/models/Users", "mule-js-sdk/models/Games", "mule-js-sdk/models/RuleBundles"],
  function (Users, Games, RuleBundles) {

  return function (contextPath) {
    var that = {};

    that.Users = Users(contextPath);
    that.Games = Games(contextPath);
    that.RuleBundles = RuleBundles(contextPath);

    return that;
  };
});