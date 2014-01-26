/**
 * controllers/games/helper.js
 *
 * Created by niko on 1/22/14.
 */

var _ = require('underscore'),
  mongoose = require('mongoose'),
  winston = require('winston');

var utils = require('../../utils');
  Game = mongoose.model('Game');

exports.index = function(parameters, callback){


};

exports.create = function(parameters, callback){
  console.log("doing create stuff");
  callback()
};

exports.read = function(parameters, callback){


};

exports.update = function(parameters, callback){


};

exports.destroy = function(parameters, callback){


};