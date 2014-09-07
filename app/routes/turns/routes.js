
var turnCrudRoutes = require('./crud/index');

module.exports = function (app){
  app.get ('/turns/:id', turnCrudRoutes.read);
  
  app.get('/games/:id/history/:turnNumber', turnCrudRoutes.readGamesTurn);
};