
define(['./d3Renderer', './colors'], function (d3Renderer, colors) {
  var that = {};

  that.renderSmallBoardHelper = function (ruleBundleName, board) {
    switch (ruleBundleName) {
      case 'Vikings':
        d3Renderer.main(board, {width: 600, height: 600}, colors.vikingsColor);
        break;
    }
  };

  return that;
});