
define(['./d3Renderer', './colors'], function (d3Renderer, colors) {
  var supportedGames = ['Vikings', 'Backgammon', 'Checkers'];
  var that = {};

  that.renderSmallBoardHelper = function (ruleBundleName, board) {
    if (_.contains(supportedGames, ruleBundleName))
      d3Renderer.main(board, {width: 600, height: 600}, getBoardColors(ruleBundleName));
  };

  that.renderLargeBoardHelper = function (ruleBundleName, board) {
    if (_.contains(supportedGames, ruleBundleName))
      d3Renderer.main(board, {width: 1200, height: 1000}, getBoardColors(ruleBundleName));
  };

  var getBoardColors = function (ruleBundleName) {
    switch (ruleBundleName) {
      case 'Vikings':
        return colors.vikingsColor;
      case 'Backgammon':
        return colors.backgammonColor;
      case 'Checkers':
        return colors.checkersColor;
    }
  };

  return that;
});