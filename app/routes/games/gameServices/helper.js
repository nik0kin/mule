/**
 * app/controllers/gameServices/helper.js
 *
 * Created by niko on 2/3/14.
 */

var Q = require('q'),
  winston = require('winston');

var gamesCrudHelper = require('../crud/helper'),
  gameHelper = require('../../../turnSystem/gameHelper');

exports.joinQ = function(params){
  var gameID = params.gameID;
  var joiner = params.joiner;//expecting a user

  winston.log('info', "User attempting to join Game: ", params);

  return gamesCrudHelper.readQ(gameID)
    .then(function (thatGame) {
      winston.info('game id='+gameID + ' valid');

      return gameHelper.joinGameQ(thatGame, joiner);
    })
    .then(function (savedGame) {
      winston.info('join success');
      return savedGame;
    });

};
