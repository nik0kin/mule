/**
 * sdk.js
 *
 * Created by niko on 2/5/14.
 */

define(
  ["mule-js-sdk/models/Users", "mule-js-sdk/models/Games",
    "mule-js-sdk/models/RuleBundles", "mule-js-sdk/models/GameBoards"],
  function (Users, Games, RuleBundles, GameBoards) {

  return function (contextPath) {
    var that = {};

    that.Users = Users(contextPath);
    that.Games = Games(contextPath);
    that.RuleBundles = RuleBundles(contextPath);
    that.GameBoards = GameBoards(contextPath);

    return that;
  };
});