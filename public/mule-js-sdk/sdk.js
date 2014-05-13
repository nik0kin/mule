/**
 * sdk.js
 *
 * Created by niko on 2/5/14.
 */

define(
  ["mule-js-sdk/models/Users", "mule-js-sdk/models/Games",
    "mule-js-sdk/models/RuleBundles", "mule-js-sdk/models/GameBoards",
    "mule-js-sdk/models/Historys", "mule-js-sdk/methods/PlayTurn"],
  function (Users, Games, RuleBundles, GameBoards, Historys, PlayTurn) {

  return function (contextPath) {
    var that = {};

    that.Users = Users(contextPath);
    that.Games = Games(contextPath);
    that.RuleBundles = RuleBundles(contextPath);
    that.GameBoards = GameBoards(contextPath);
    that.Historys = Historys(contextPath);

    that.PlayTurn = PlayTurn(contextPath);

    return that;
  };
});