
define(['./checkersJSON'], function (checkersJSON) {
  var that = {};

  that.renderRuleBundle = function (sys) {
    console.log(checkersJSON.rules.board);

    _.each(checkersJSON.rules.board, function (space) {
      sys.addNode(space.id, space.attributes)

      _.each(space.edges, function (edge) {
        sys.addEdge(space.id, edge.id, edge.direction);
      });
    });
  };

  return that;
});