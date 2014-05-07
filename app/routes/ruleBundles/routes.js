/**
 * Controllers->RuleBundle-> routes.js
 *
 * Created by niko on 1/22/14.
 */

var auth = require('../../../config/middlewares/authorization'),//TODO hmmmmmmmm... maybe we need to think about where authorization should live
  ruleBundleController = require('./crud/index');

module.exports = function (app){
  app.get ('/ruleBundles', ruleBundleController.index)
  app.post('/ruleBundles', auth.requiresLogin, ruleBundleController.create);
  app.get ('/ruleBundles/:id', ruleBundleController.read);
  app.put ('/ruleBundles/:id', auth.requiresLogin, ruleBundleController.update);  //TODO change auth function to the game owner
  app.del ('/ruleBundles/:id', auth.requiresLogin, ruleBundleController.destroy); // ^^
};