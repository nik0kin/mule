/**
 * http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene
 * http://stemkoski.github.io/Three.js/#mouse-click
 */

define(function () {
  var scene = new THREE.Scene();
  // CAMERA
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 75, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000;
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);

  var renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);


  var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
  var targetList = [];

  ///////// make seperator lines

  var material = new THREE.MeshNormalMaterial();

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
      square.which = x + ' ' + y;
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
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    console.log("Click.");

    // update the mouse variable
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

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
      console.log("Hit @ " + intersects[0].object.which );
      // change the color of the closest face.
      intersects[ 0 ].face.color.setRGB( 0.8 * Math.random() + 0.2, 0, 0 );
      intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
    }

  };

  function onDocumentMouseMove( event )
  {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    // update the mouse variable
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
});