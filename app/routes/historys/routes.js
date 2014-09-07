
var historyCrudRoutes = require('./crud/index');

module.exports = function (app){
  app.get ('/historys', historyCrudRoutes.index);
  app.get ('/historys/:id', historyCrudRoutes.read);

  app.get('/games/:id/history', historyCrudRoutes.readGamesHistory);

  app.get('/games/:id/history/all', historyCrudRoutes.readGamesFullHistory);
};