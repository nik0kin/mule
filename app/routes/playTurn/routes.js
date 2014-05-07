
var auth = require('../../../config/middlewares/authorization'),//TODO hmmmmmmmm... maybe we need to think about where authorization should live
  playTurnCode = require('./helper');

module.exports = function (app) {
  app.post('/playTurn', auth.requiresLogin, playTurnCode.playTurn);

};