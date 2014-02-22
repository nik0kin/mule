
define(['./arborRenderer', './myCheckersBoardNodeRenderer'], function (arborRenderer, myCheckersBoardNodeRenderer) {
  var that = {};

  that.gameBoardToRender = function (sys, board) {

    _.each(board, function (space) {
      sys.addNode(space.id, space.attributes)

      _.each(space.edges, function (edge) {
        sys.addEdge(space.id, edge.id, edge.direction);
      });
    });
  };

  var renderSystem;
  that.renderGameBoardHelper = function (ruleBundleName, board) {
    if (renderSystem) {
      renderSystem.stop();
      delete renderSystem;
    }

    var ruleBundleBoardRenderer;
    switch (ruleBundleName) {
      case 'Checkers':
        ruleBundleBoardRenderer = myCheckersBoardNodeRenderer;
        break;
      case 'Backgammon':
      case 'Vikings':
        alert('no renderer right now');
        return;
    }

    renderSystem =  arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
    renderSystem.parameters({gravity:true}) // use center-gravity to make the graph settle nicely (ymmv)

    renderSystem.renderer = arborRenderer("#gameInfoViewPort", ruleBundleBoardRenderer);
    // our newly created renderer will have its .init() method called shortly by sys...

    that.gameBoardToRender(renderSystem, board);
  };

  return that;
});