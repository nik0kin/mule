/**
 * controllers/games/crud/helper.js
 *
 * Created by niko on 1/22/14.
 */

var _ = require('lodash'),
  Q = require('q'),
  winston = require('winston');

var utils = require('mule-utils/jsonUtils'),
  Game = require('mule-models').Game.Model,
  createGameHelper = require('./createGameHelper');

exports.indexQ = function () {
  return Game.find().execQ();
};

exports.createQ = createGameHelper;

exports.readQ = function (gameID){
  return Game.findByIdQ(gameID);
};

exports.update = function (parameters, callback) {

};

exports.destroy = function (parameters, callback) {

};
