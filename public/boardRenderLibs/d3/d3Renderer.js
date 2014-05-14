
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
      json.nodes.push(_.clone(space));
      positionCache[space.id] = i;
      i++;
    });

    //adding links loop
    _.each(board, function (space) {
      _.each(space.edges, function (edge) {
        var newLink = {"source": positionCache[space.id],"target": positionCache[edge.id],"value": edge};

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

  that.main = function (board, size, renderSet, onClickFunction) {
    var width = size.width,
      height = size.height;

    var color = d3.scale.category20();

    var graph = boardToGraphJSON(board);

    var force = d3.layout.force()
      .nodes(graph.nodes)
      .links(graph.links)
      .size([width, height])
      .charge(-120)
      .linkDistance(renderSet.linkDistance)
      .on("tick", tick)
      .start();

    $("#d3RenderBox").html('');
    var svg = d3.select("#d3RenderBox").append("svg")
      .attr("width", width)
      .attr("height", height);
    _svg = svg;

    var link = svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return 2; })
      .style("stroke", renderSet.getLinkColor);

    var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", renderSet.nodeSizes.normal)
      .style("fill", renderSet.getColor)
      .call(force.drag);

    var number = svg.selectAll("foreignObject")
      .data(force.nodes())
      .enter().append("g");
    number.append("foreignObject")
      .attr('x', '10px')
      .attr("height","25px")
      .attr("width", "25px")
      .append("xhtml:div")
      .attr('xmlns','http://www.w3.org/1999/xhtml')
      .attr('class','test')
      .html(renderSet.getDisplayText);

    if (typeof onClickFunction === 'function') {
      node.on('click', function (d) {
        onClickFunction(d, this);
      });
    }

    function tick() {
      node.attr("transform", transform);
      number.attr("transform", transform);

      link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    }

    function transform(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }
  };
  return that;
});