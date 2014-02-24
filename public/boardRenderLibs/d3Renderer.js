
define([], function () {
  var that = {};

  var boardToGraphJSON = function (board) {
    var json = {};

    var positionCache = {};

    //nodes is just data
    json.nodes = [];
    //link is {"source":6,"target":0,"value":1}, source/target are where it is in the node array
    json.links = [];

    //adding node loop
    var i = 0;
    _.each(board, function (space) {
      json.nodes.push(space);
      positionCache[space.id] = i;
      i++;
    });

    //adding links loop
    _.each(board, function (space) {
      _.each(space.edges, function (edge) {
        var newLink = {"source": positionCache[space.id],"target": positionCache[edge.id],"value":1};

        //where to put edge metadata?
        json.links.push(newLink);
      });
    });

    return json;
  };

  that.removeAll = function () {
    if(_svg) {
      _svg.selectAll(".node").remove();
      _svg.selectAll(".link").remove();
      _svg
        .attr("width", 0)
        .attr("height", 0);
    }
  };
  var _svg;

  that.main = function (board, size, colorRenderer) {
    var width = size.width,
      height = size.height;

    var color = d3.scale.category20();

    var force = d3.layout.force()
      .charge(-120)
      .linkDistance(1)
      .size([width, height]);

    $("#d3RenderBox").html('');
    var svg = d3.select("#d3RenderBox").append("svg")
      .attr("width", width)
      .attr("height", height);
    _svg = svg;
    var graph = boardToGraphJSON(board);
      force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

      var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

      var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .style("fill", colorRenderer)
        .call(force.drag);

      node.append("title")
        .text(function(d) { return d.name; });

      force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      });
    //});
  };
  return that;
});