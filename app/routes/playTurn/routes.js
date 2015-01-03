
var auth = require('mule-utils/authorizationUtils'),
  playTurnCode = require('./index');

module.exports = function (app) {
  app.post('/playTurn', auth.requiresLogin, playTurnCode.playTurn);

  app.post('/games/:id/playTurn', auth.requiresLogin, playTurnCode.playGamesTurn);
};
