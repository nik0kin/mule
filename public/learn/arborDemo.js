// based off https://github.com/samizdatco/arbor/tree/master/docs/sample-project

define(['myArborLib', 'arborRenderer', 'myCheckersBoardNodeRenderer'], function (myArborLib, arborRenderer, myCheckersBoardNodeRenderer) {

  $(document).ready(function(){
    var sys = arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:true}) // use center-gravity to make the graph settle nicely (ymmv)

    var ruleBundleBoardRenderer = myCheckersBoardNodeRenderer;
    sys.renderer = arborRenderer("#viewport", ruleBundleBoardRenderer) // our newly created renderer will have its .init() method called shortly by sys...

    myArborLib.renderRuleBundle(sys);
  });
});