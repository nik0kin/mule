
var gameStateController = require('./crud/index');

module.exports = function (app){
  app.get ('/gameStates', gameStateController.index);
  app.get ('/gameStates/:id', gameStateController.read);

  app.get('/games/:id/state', gameStateController.readGamesState);
};