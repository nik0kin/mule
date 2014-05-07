/**
 * app/routes/routes.js
 *
 * Created by niko on 1/22/14.
 */

var auth = require('../../../config/middlewares/authorization'),//TODO hmmmmmmmm... maybe we need to think about where authorization should live
  gameController = require('./crud/index'),
  gameServices = require('./gameServices/index');

module.exports = function (app){
  app.get ('/games', gameController.index);
  app.post('/games', auth.requiresLogin, gameController.create);
  app.get ('/games/:id', gameController.read);
  app.put ('/games/:id', auth.requiresLogin, gameController.update);  //TODO change auth function to the game owner
  app.del ('/games/:id', auth.requiresLogin, gameController.destroy); // ^^

  app.get('/users/:id/games', gameController.readUsersGames);

  app.post('/games/:id/join', auth.requiresLogin, gameServices.joinGame);
};