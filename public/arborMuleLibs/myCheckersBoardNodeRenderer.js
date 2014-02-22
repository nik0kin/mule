
define(function () {
  return function (ctx) {

    return function (node, pt){
      // node: {mass:#, p:{x,y}, name:"", data:{}}
      // pt:   {x:#, y:#}  node position in screen coords

      // draw a rectangle centered at pt
      var w = 10

      var c = 'gray';
      switch (node.data.kingme) {
        case undefined:
        case 'null':
        default :
          break;

        case 'player1':
          c = 'black';
          break;
        case 'player2':
          c = 'red';
          break;
      };

      ctx.fillStyle = c;
      ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w);

      if (node.selected) {
        _.each(node.data, function (value, key) {
          ctx.fillStyle = 'orange';
          ctx.font="14px Georgia";
          ctx.fillText(key + ': ' + value, pt.x + 5,pt.y - 5);
        });
      }
    };
  };
});