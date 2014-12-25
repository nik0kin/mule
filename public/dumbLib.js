
define(function () {
  var that = {};

  that.loadGameIdURL = function (callback) {
    var gameId = window.location.href.split('?gameId=')[1];
    console.log('Viewing: ' + gameId);
    if (gameId)
      callback(gameId);
  };

  that.addGameIdURL = function (gameId) {
    window.history.pushState("object or string", "Title", '?gameId=' + gameId);
  };

  that.loadGameIdAndPlayerRelFromURL = function (callback) {
    var gameId = window.location.href.split('?gameId=')[1].split('&')[0];
    var playerRel = window.location.href.split('&playerRel=')[1];

    console.log('Viewing: ' + gameId + ', playing as ' + playerRel);

    if (gameId) {
      callback({
        gameId: gameId,
        playerRel: playerRel
      });
    }
  };

  //http://stackoverflow.com/questions/19491336/get-url-parameter-jquery
  that.getUrlParameter = function (sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
  };

  return that;
});
