
define(function () {
  var that = {};

  var scene, camera, renderer;

  var SCREEN_WIDTH = 500, SCREEN_HEIGHT = 500;
  var VIEW_ANGLE = 75, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000;

  var xGeometry, oGeometry;

  that.initBasicScene = function (clickSpaceCallback) {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    $('#stage').append(renderer.domElement);

    var stageOffset = {
      x: renderer.domElement.offsetLeft,
      y: renderer.domElement.offsetTop
    };

    var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
    var targetList = [];

    ///////// make seperator lines

    var geometryY1 = new THREE.BoxGeometry(1,10,1);
    var materialY1 = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var yBar1 = new THREE.Mesh(geometryY1, materialY1);
    yBar1.position.x = -2.0;
    scene.add(yBar1);

    var geometryY2 = new THREE.BoxGeometry(1,10,1);
    var materialY2 = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var yBar2 = new THREE.Mesh(geometryY2, materialY2);
    yBar2.position.x = 2.0;
    scene.add(yBar2);

    var geometryX1 = new THREE.BoxGeometry(10,1,1);
    var materialX1 = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var xBar1 = new THREE.Mesh(geometryX1, materialX1);
    xBar1.position.y = -2.0;
    scene.add(xBar1);

    var geometryX2 = new THREE.BoxGeometry(10,1,1);
    var materialX2 = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var xBar2 = new THREE.Mesh(geometryX2, materialX2);
    xBar2.position.y = 2.0;
    scene.add(xBar2);

    ///////// make selector squares
    var x, y;
    for (y=0; y<3; y++) {
      for (x=0; x<3; x++) {
        var geo = new THREE.BoxGeometry(2.5, 2.5, 1);
        var mat = new THREE.MeshBasicMaterial({color: 0xffff00});
        var square = new THREE.Mesh(geo, mat);
        square.position.x = -4.0 + (x * 4);
        square.position.y = -4.0 + (y * 4);
        square.position.z = -1.0;
        square.which = {x: x, y: y};
        scene.add(square);
        targetList.push(square);
      }
    }

    camera.position.y = -4;
    camera.position.z = 8.5;
    camera.rotation.x = .25;

    // initialize object to perform world/screen calculations
    projector = new THREE.Projector();

    var update = function () {
      // find intersections

      // create a Ray with origin at the mouse position
      //   and direction into the scene (camera direction)
      var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
      projector.unprojectVector( vector, camera );
      var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

      // create an array containing all objects in the scene with which the ray intersects
      var intersects = ray.intersectObjects(targetList);

      // INTERSECTED = the object in the scene currently closest to the camera
      //		and intersected by the Ray projected from the mouse position

      // if there is one (or more) intersections
      if ( intersects.length > 0 )
      {
        // if the closest object intersected is not the currently stored intersection object
        if ( intersects[ 0 ].object != INTERSECTED )
        {
          // restore previous intersection object (if it exists) to its original color
          if ( INTERSECTED )
            INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
          // store reference to closest object as current intersection object
          INTERSECTED = intersects[ 0 ].object;
          // store color of closest object (for later restoration)
          INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
          // set a new color for closest object
          INTERSECTED.material.color.setHex( 0x00ffff );
        }
      }
      else // there are no intersections
      {
        // restore previous intersection object (if it exists) to its original color
        if ( INTERSECTED )
          INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        // remove previous intersection object reference
        //     by setting current intersection object to "nothing"
        INTERSECTED = null;
      }

    };

    var render = function () {
      requestAnimationFrame(render);

      //camera.rotation.x += 0.01;
      //camera.rotation.y += 0.01;

      update();

      renderer.render(scene, camera);
    };

    render();


    var onDocumentMouseDown = function ( event ) {
      //console.log("Click. " + event.clientX + ' ' + event.clientY);

      // update the mouse variable
      mouse.x = ( (event.clientX - stageOffset.x) / SCREEN_WIDTH ) * 2 - 1;
      mouse.y = - ( (event.clientY - stageOffset.y) / SCREEN_HEIGHT ) * 2 + 1;

      // find intersections

      // create a Ray with origin at the mouse position
      //   and direction into the scene (camera direction)
      var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
      projector.unprojectVector( vector, camera );
      var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

      // create an array containing all objects in the scene with which the ray intersects
      var intersects = ray.intersectObjects( scene.children );

      // if there is one (or more) intersections
      if ( intersects.length > 0 ) {
        //console.log("Hit @ " + intersects[0].object.which );
        clickSpaceCallback(intersects[0].object.which);
        // change the color of the closest face.
        intersects[ 0 ].face.color.setRGB( 0.8 * Math.random() + 0.2, 0, 0 );
        intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
      }

    };

    var onDocumentMouseMove = function (event) {
      mouse.x = ( (event.clientX - stageOffset.x) / SCREEN_WIDTH ) * 2 - 1;
      mouse.y = - ( (event.clientY - stageOffset.y) / SCREEN_HEIGHT ) * 2 + 1;
    };

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );


    // test piece

    var jsonLoader = new THREE.JSONLoader();
    jsonLoader.load( "models/X.js", saveXModel );
    jsonLoader.load( "models/O.js", saveOModel );
  };

  var android, ann;
  var saveXModel = function ( geometry, materials ) {
    xGeometry = geometry;
    incrementLoadedStuff();
  };

  var saveOModel = function ( geometry, materials ) {
    oGeometry = geometry;
    incrementLoadedStuff();
  };

  var totalLoadedStuff = 2, currentLoadedStuff = 0;
  var incrementLoadedStuff = function () {
    currentLoadedStuff++;

    if (currentLoadedStuff >= totalLoadedStuff) {

    }
  };

  var xRotationX = 1.8,
    oRotationX = 1.4,
    spaceAmount = 3.5;

  that.placeExistingPieces = function (listOfPieces) {
    _.each(listOfPieces, function (piece) {
      that.placePiece(piece.position, piece.class)
    });
  };

  that.placePiece = function (location, xOrOhh) {
    var rot, geo;

    if (xOrOhh === 'O') {
      rot = oRotationX;
      geo = oGeometry;
    } else {
      rot = xRotationX;
      geo = xGeometry;
    }

    var material = new THREE.MeshNormalMaterial();
    var newXorO = new THREE.Mesh( geo, material );
    newXorO.scale.set(1,1,1);
    newXorO.rotation.x = rot;
    newXorO.position.x = -spaceAmount + location.x * spaceAmount;
    newXorO.position.y = -spaceAmount + location.y * spaceAmount;
    scene.add( newXorO );
    console.log('added ' + xOrOhh + ' to board at ' + location.x + ', ' + location.y);
  };

  return that;
});