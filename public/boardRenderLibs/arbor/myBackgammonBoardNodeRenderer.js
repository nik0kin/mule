
define(function () {
  return function (ctx) {

    return function (node, pt){
      // node: {mass:#, p:{x,y}, name:"", data:{}}
      // pt:   {x:#, y:#}  node position in screen coords

      // draw a rectangle centered at pt
      var w = 10

      var c = '#DDDDDD';
      if(node.data.class == 'RegularSpace' && node.data.attributes){
        switch (node.data.attributes.inGammonBox) {
          case undefined:
          case 'null':
          default :
            break;

          case 'black':
            c = '#999999';
            break;
          case 'red':
            c = 'red';
            break;
        }
      } else if (node.data.class == 'ScoreSpace') {
        switch (node.data.attributes.player) {
          case 'red' :
            c = '#800000';
            break;
          case 'black' :
            c = 'black';
            break;
        }
      }

      ctx.fillStyle = c;
      ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w);

      if (node.selected) {
        ctx.fillStyle = 'orange';
        ctx.font="16px Georgia";

        ctx.fillText(node.data.class + ': ', pt.x + 5,pt.y - 20);

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