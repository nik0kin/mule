
define(['./d3Renderer',
  '../bundleRenders/checkers', '../bundleRenders/vikings', '../bundleRenders/backgammon',
  '../bundleRenders/tictactoe', '../bundleRenders/monopoly', '../bundleRenders/mulesprawl'],
  function (d3Renderer, checkersRenderSet, vikingsRenderSet, backgammonRenderSet,
            tictactoeRenderSet, monopolyRenderSet, mulesprawlRenderSet) {

  var supportedGames = {
    'Vikings': vikingsRenderSet,
    'Backgammon': backgammonRenderSet,
    'Checkers': checkersRenderSet,
    'TicTacToe': tictactoeRenderSet,
    'Monopoly': monopolyRenderSet,
    'MuleSprawl': mulesprawlRenderSet
  };
  var that = {};

  that.renderSmallBoardHelper = function (ruleBundleName, board, onClickFunction) {
    var renderSet = supportedGames[ruleBundleName];

    if (renderSet) {
      d3Renderer.main(board, {width: 500, height: 500},
        renderSet, onClickFunction);
    } else
      console.log('Unsupported RuleBundle: ' + ruleBundleName);
  };

  that.renderLargeBoardHelper = function (ruleBundleName, board, onClickFunction) {
    var renderSet = supportedGames[ruleBundleName];

    if (renderSet) {
      var onClick = function (node, nodeElement) {
        d3.selectAll(".node").attr("r", renderSet.nodeSizes.normal);
        d3.select(nodeElement).attr("r", renderSet.nodeSizes.selected);

        if (onClickFunction) onClickFunction(node);
      };
      d3Renderer.main(board, {width: 800, height: 600},
        renderSet, onClick);
    } else
      console.log('Unsupported RuleBundle: ' + ruleBundleName);
  };

  return that;
});