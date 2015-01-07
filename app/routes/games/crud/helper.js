/**
 * controllers/games/crud/helper.js
 */

var Game = require('mule-models').Game.Model,
  createGameHelper = require('./createGameHelper');

exports.indexQ = function () {
  return Game.find().execQ();
};

exports.createQ = createGameHelper;

exports.readQ = function (gameId){
  return Game.findByIdQ(gameId);
};

exports.update = function (parameters, callback) {

};

exports.destroy = function (parameters, callback) {

};
