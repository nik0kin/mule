
define(['./arborRenderer', './myCheckersBoardNodeRenderer', './myBackgammonBoardNodeRenderer', './myVikingBoardNodeRenderer'],
  function (arborRenderer, myCheckersBoardNodeRenderer, myBackgammonBoardNodeRenderer, myVikingBoardNodeRenderer) {
  var that = {};

  that.gameBoardToRender = function (sys, board) {

    _.each(board, function (space) {
      sys.addNode(space.id, space)

      _.each(space.edges, function (edge) {
        sys.addEdge(space.id, edge.id, edge);
      });
    });
  };

  var renderSystem;
  var w;

  that.resetGameBoardRender = function () {
    var canvas = document.getElementById('gameInfoViewPort');

    w = canvas.width;// a dumb hacky way of resetting the board
    canvas.width = 0;
  };
  that.renderGameBoardHelper = function (ruleBundleName, board) {
    var canvas = document.getElementById('gameInfoViewPort');
    canvas.width = w || canvas.width;
    console.log(w  + ' ' + canvas.width);

    var ruleBundleBoardRenderer;
    switch (ruleBundleName) {
      case 'Checkers':
        ruleBundleBoardRenderer = myCheckersBoardNodeRenderer;
        break;
      case 'Backgammon':
        ruleBundleBoardRenderer = myBackgammonBoardNodeRenderer;
        break;
      case 'Vikings':
        ruleBundleBoardRenderer = myVikingBoardNodeRenderer;
    }

    renderSystem =  arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
    renderSystem.parameters({gravity:true, fps: 1}) // use center-gravity to make the graph settle nicely (ymmv)

    renderSystem.renderer = arborRenderer("#gameInfoViewPort", ruleBundleBoardRenderer);
    // our newly created renderer will have its .init() method called shortly by sys...

    that.gameBoardToRender(renderSystem, board);
  };

  return that;
});