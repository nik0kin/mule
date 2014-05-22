
define(function () {
  var that = {};

  that.loadGameIdURL = function (callback) {
    var gameId = window.location.href.split('?gameID=')[1];
    console.log('Viewing: ' + gameId);
    if (gameId)
      callback(gameId);
  };

  that.loadGameIdAndPlayerRelFromURL = function (callback) {
    var gameId = window.location.href.split('?gameID=')[1].split('&')[0];
    var playerRel = window.location.href.split('&playerRel=')[1];

    console.log('Viewing: ' + gameId + ', playing as ' + playerRel);

    if (gameId) {
      callback({
        gameId: gameId,
        playerRel: playerRel
      });
    }
  };

  return that;
});