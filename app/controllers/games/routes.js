/**
 * Created by niko on 1/22/14.
 */

var auth = require('../../../config/middlewares/authorization'),//TODO hmmmmmmmm... maybe we need to think about where authorization should live
  gameController = require('./index');

module.exports = function (app){
  app.get ('/games', gameController.index)
  app.post('/games', auth.requiresLogin, gameController.create);
  app.get ('/games/:id', gameController.read);
  app.put ('/games/:id', auth.requiresLogin, gameController.update);  //TODO change auth function
  app.del ('/games/:id', auth.requiresLogin, gameController.destroy); // ^^
};