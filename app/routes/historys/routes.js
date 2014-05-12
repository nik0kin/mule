
var historyController = require('./crud/index');

module.exports = function (app){
  app.get ('/historys', historyController.index);
  app.get ('/historys/:id', historyController.read);

  app.get('/games/:id/history', historyController.readGamesHistory)
};