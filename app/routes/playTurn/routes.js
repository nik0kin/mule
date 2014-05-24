
var auth = require('mule-utils/authorizationUtils'),
  playTurnCode = require('./helper');

module.exports = function (app) {
  app.post('/playTurn', auth.requiresLogin, playTurnCode.playTurn);

};