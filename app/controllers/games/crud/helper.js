/**
 * controllers/games/crud/helper.js
 *
 * Created by niko on 1/22/14.
 */

var _ = require('underscore'),
  mongoose = require('mongoose'),
  Q = require('q'),
  winston = require('winston');

var utils = require('mule-utils/jsonUtils'),
  Game = mongoose.model('Game');

exports.indexQ = function () {
  return Game.find().execQ();
};

exports.createQ = function (params) {    //TODO this is starting to look ugly
  var validatedParams = params.validatedParams;
  var creator = params.creator;//expecting a user

  return Q.promise( function (resolve, reject) {
    winston.info("User attempting to create new game: params: ", validatedParams );

    validatedParams.gameStatus = 'open';

    var newGame = new Game(validatedParams);

    newGame.validate( function (err) {
      if (err) {
        winston.log('error', 'ValidationError for gameConfigs to Game document');
        return reject(err);
      }

      if (!creator) {
        winston.info('doing unit tests');
        newGame.saveQ()
          .done(resolve, reject);
      } else {
        winston.info('creating game with creator: ', creator._doc);
        newGame.joinGameQ(creator)
          .done(function () {
            newGame.saveQ()
              .done(resolve, reject);
          }, reject);
      }
    });
  });
};

exports.readQ = function (gameID){
  return Game.findByIdQ(gameID);
};

exports.update = function (parameters, callback) {

};

exports.destroy = function (parameters, callback) {

};
