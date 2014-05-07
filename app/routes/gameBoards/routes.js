/**
 * Controllers->GameBoard-> routes.js
 *
 */

var gameBoardController = require('./crud/index');

module.exports = function (app){
  app.get ('/gameBoards', gameBoardController.index);
  app.post('/gameBoards', gameBoardController.create);
  app.get ('/gameBoards/:id', gameBoardController.read);
  app.put ('/gameBoards/:id', gameBoardController.update);
  app.del ('/gameBoards/:id', gameBoardController.destroy);

  app.get('/games/:id/board', gameBoardController.readGamesBoard)
};