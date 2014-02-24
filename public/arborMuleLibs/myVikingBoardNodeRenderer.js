
define(function () {
  return function (ctx) {

    return function (node, pt){
      // node: {mass:#, p:{x,y}, name:"", data:{}}
      // pt:   {x:#, y:#}  node position in screen coords

      // draw a rectangle centered at pt
      var w = 10

      var c = '#DDDDDD';
      if(node.data.class == 'MoveableSpace' && node.data.attributes){
        switch (node.data.attributes.terrainType) {
          case undefined:
          case 'null':
          default :
            break;
          case 'dirt':
            c = 'brown';
            break;
          case 'grass':
            c = 'green';
            break;
          case 'hills':
            c = 'red';
            break;
          case 'water':
            c = 'blue';
            break;
          case 'forest':
            c = '#336633'
            break;
        }
      }

      ctx.fillStyle = c;
      ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w);

      if (node.selected) {
        ctx.fillStyle = 'orange';
        ctx.font="16px Georgia";

        ctx.fillText(node.data.class + ': (' + node.data.id + ')', pt.x + 5,pt.y - 20);

        ctx.font="14px Georgia";
        var i = 0;
        _.each(node.data.attributes, function (value, key) {
          ctx.fillText(key + ': ' + value, pt.x + 5,pt.y - 5 + i);
          i += 10;
        });
      }
    };
  };
});