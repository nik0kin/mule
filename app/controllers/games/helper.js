/**
 * controllers/games/helper.js
 *
 * Created by niko on 1/22/14.
 */

var _ = require('underscore'),
  mongoose = require('mongoose'),
  winston = require('winston');

var utils = require('../../utils/jsonUtils');
  Game = mongoose.model('Game');

exports.index = function(parameters, callback){


};

exports.createQ = function(validatedParams){
  console.log( "User attempting to create new game: params: " + JSON.stringify(validatedParams) );

  validatedParams.gameStatus = 'open';

  var newGame = new Game(validatedParams);
  return newGame.saveQ();
};

exports.read = function(parameters, callback){


};

exports.update = function(parameters, callback){


};

exports.destroy = function(parameters, callback){


};