
define(['./d3Renderer', './colors'], function (d3Renderer, colors) {
  var supportedGames = ['Vikings', 'Backgammon', 'Checkers', 'TicTacToe', 'Monopoly'];
  var that = {};

  that.renderSmallBoardHelper = function (ruleBundleName, board, onClickFunction) {
    if (_.contains(supportedGames, ruleBundleName))
      d3Renderer.main(board, {width: 500, height: 500},
        getBoardNodeColors(ruleBundleName), getBoardLinkColors(ruleBundleName), onClickFunction);
    else
      console.log('Unsupported RuleBundle: ' + ruleBundleName);
  };

  that.renderLargeBoardHelper = function (ruleBundleName, board, onClickFunction) {
    if (_.contains(supportedGames, ruleBundleName))
      d3Renderer.main(board, {width: 800, height: 700},
        getBoardNodeColors(ruleBundleName), getBoardLinkColors(ruleBundleName), onClickFunction);
    else
      console.log('Unsupported RuleBundle: ' + ruleBundleName);
  };

  var getBoardNodeColors = function (ruleBundleName) {
    var colorSwitchObject = {
      'Vikings': colors.vikingsColor,
      'Backgammon':  colors.backgammonColor,
      'Checkers': colors.checkersColor,
      'TicTacToe': colors.grayColor,
      'Monopoly': colors.monopolyColor
    };

    return colorSwitchObject[ruleBundleName];
  };

  var getBoardLinkColors = function (ruleBundleName) {
    switch (ruleBundleName) {
      case 'TicTacToe':
        return colors.ticTacToeLinkColor;
      default:
        return colors.grayColor;
    }
  };

  return that;
});