/**
 * test/api/gameServices/joinGameParams.js
 *
 * Created by niko on 2/3/14.
 */


exports.validGameConfig = {
  name : "niks vikings game",
  ruleBundle : {
    name : 'Vikings'
  },
  //don't need max players when playing checkers

  maxPlayers : 3,
  ruleBundleGameSettings : {
    customBoardSettings : {
      width : 30,
      height : 20
    }
  }
};