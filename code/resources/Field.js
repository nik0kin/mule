//
var TILE_SZ = 15;
//ENUMS
var GRASS = 0;
//var ROAD = 1;
var HILLS = 1;
var MOUNTAINS = 2;
var WATER = 3;
var TREES = 4;



var layer;

function Spot(point){
    this.type = point.type;
    var color;
    switch(point.type){
        case GRASS:
            color = "#33FF00";
            break;
        case TREES:
            color = "green";
            break;
        case ROAD:
            color = "yellow";
            break;
        case HILLS:
            color = "orange";
            break;
        case MOUNTAINS:
            color = "red";
            break;
	case WATER:
		color = "black";
        default:
            color = "blue";
    }

    var model = new Kinetic.RegularPolygon({
        sides: 6,
        x: point.x * TILE_SZ*2 + (point.y % 2 == 0 ? TILE_SZ : 0) + TILE_SZ,
        y: point.y * (TILE_SZ*2 + 0) + TILE_SZ,
        radius: TILE_SZ,
        fill: color,
        stroke: 'black',
        strokeWidth: 3
    });
  
    layer.add(model);
}

function Field(fieldX,fieldY,map){

    var stage = new Kinetic.Stage({
        container: 'container',
        width: 1000,
        height: 1000,
    });

    layer = new Kinetic.Layer();

    /*var rect = new Kinetic.Rect({
        x: 239,
        y: 75,
        width: 100,
        height: 50,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4
    });*/

    // add the layer to the stage
    if(map){
      var types = new Array(fieldX);
      
    
      for(var x = 0; x < fieldX ; x++){
        types[x] = new Array(fieldY);
        for (var y = 0; y < fieldY; y++) {
            types[x][y] = map[y][x].type;
        }
     }
      
    }else{
    
       var types = makeField({x:fieldX,y:fieldY});
    }
    
    
    var mField = new Array(fieldY);
    for (var y = 0; y < fieldY; y++) {
        mField[y] = new Array(fieldX);
        for(var x = 0; x < fieldX ; x++){
            var t = types[x][y];
            mField[y][x] = new Spot({x: x, y: y,type: t});
        }
    }
   
     stage.add(layer); 
     
     this.kill = function(){
      layer.destroy();
      stage.destroy();
     }
}

function makeField(size){
    var f = new Array(size.x);
    //init array with water
    for (var y = 0; y < size.y; y++) {
        f[y] = new Array(size.x);
        for(var x = 0; x < size.x ; x++){
            f[y][x] = GRASS;

        }
    }
    
    //make a random trees
    for(var i=0;i<2;i++){
    
    
    
    }
   
    //var p = {x: size.x * .3
    return f;
    
};

function randomNumber(a,b){
    return Math.floor((Math.random()*b)+a);
}
