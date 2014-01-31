/**
 * controllers/games/helper.js
 *
 * Created by niko on 1/22/14.
 */

var _ = require('underscore'),
  mongoose = require('mongoose'),
  Q = require('q'),
  winston = require('winston');

var utils = require('../../utils/jsonUtils');
  Game = mongoose.model('Game');

exports.index = function(parameters, callback){


};

exports.createQ = function(validatedParams){
  return Q.promise( function (resolve, reject) {
    console.log( "User attempting to create new game: params: " + JSON.stringify(validatedParams) );

    validatedParams.gameStatus = 'open';

    var newGame = new Game(validatedParams);

    if (validatedParams.dontJoinCreator) {
      console.log('doing unit tests')
    } else {
      //TODO join player to game
    }

    newGame.saveQ()
      .done(resolve, reject);
  });
};

exports.readQ = function(gameID){
  return Game.findByIdQ(gameID);
};

exports.update = function(parameters, callback){


};

exports.destroy = function(parameters, callback){


};