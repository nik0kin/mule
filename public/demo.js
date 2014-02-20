/**
 * Created by niko on 2/5/14.
 */
define(["demoLib"], function (demoLib) {

  $('#createUser').click(demoLib.tryCreateUser);
  $('#loginUser').click(demoLib.tryLogin);

  $('#startGame').click(demoLib.tryCreateGame);
  $('#getGames').click(demoLib.tryGetGames);
  $('#getMyGames').click(demoLib.tryGetMyGames);

  demoLib.initPage();
});