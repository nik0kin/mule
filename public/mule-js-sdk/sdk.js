/**
 * sdk.js
 *
 * Created by niko on 2/5/14.
 */

define(
  ["./models/Users", "./models/Games",
    "./models/RuleBundles", "./models/GameBoards",
    './models/GameStates',
    "./models/Historys", "./models/Turns",
    "./methods/PlayTurn"],
  function (Users, Games, RuleBundles, GameBoards, GameStates, Historys, Turns, PlayTurn) {

  return function (contextPath) {
    var that = {};

    that.Users = Users(contextPath);
    that.Games = Games(contextPath);
    that.RuleBundles = RuleBundles(contextPath);
    that.GameBoards = GameBoards(contextPath);
    that.GameStates = GameStates(contextPath);
    that.Historys = Historys(contextPath);
    that.Turns = Turns(contextPath);

    that.PlayTurn = PlayTurn(contextPath);

    return that;
  };
});