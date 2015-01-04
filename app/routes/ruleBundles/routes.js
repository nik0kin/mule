/**
 * Controllers->RuleBundle-> routes.js
 *
 * Created by niko on 1/22/14.
 */

var auth = require('mule-utils/authorizationUtils'),
  ruleBundleController = require('./crud/index');

module.exports = function (app){
  app.get ('/ruleBundles', ruleBundleController.index);
  app.post('/ruleBundles', auth.requiresLogin, ruleBundleController.create);
  app.get ('/ruleBundles/:id', ruleBundleController.read);
  app.put ('/ruleBundles/:id', auth.requiresLogin, ruleBundleController.update);  //TODO change auth function to the game owner
  app.delete ('/ruleBundles/:id', auth.requiresLogin, ruleBundleController.destroy); // ^^
};