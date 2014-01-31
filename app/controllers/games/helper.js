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

exports.createQ = function(params){
  var validatedParams = params.validatedParams;
  var creator = params.creator;//expecting a user

  return Q.promise( function (resolve, reject) {
    console.log( "User attempting to create new game: params: " + JSON.stringify(validatedParams) );

    validatedParams.gameStatus = 'open';

    var newGame = new Game(validatedParams);

    if (!creator) {
      console.log('doing unit tests');

      newGame.saveQ()
        .done(resolve, reject);
    } else {
      newGame.joinGameQ(creator)
        .done(function () {
          newGame.saveQ()
            .done(resolve, reject);
        }, reject);

    }


  });
};

exports.readQ = function(gameID){
  return Game.findByIdQ(gameID);
};

exports.update = function(parameters, callback){


};

exports.destroy = function(parameters, callback){


};