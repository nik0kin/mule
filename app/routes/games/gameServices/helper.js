/**
 * app/controllers/gameServices/helper.js
 */

var Q = require('q');

var gamesCrudHelper = require('../crud/helper'),
  logging = require('mule-utils').logging,
  gameHelper = require('../../../turnSystem/gameHelper');

exports.joinQ = function(params){
  var gameId = params.gameId;
  var joiner = params.joiner;//expecting a user

  logging.log('User[' + joiner.username + '|' + joiner._id + '] attempting to join game..', gameId);

  return gamesCrudHelper.readQ(gameId)
    .then(function (thatGame) {
      return gameHelper.joinGameQ(thatGame, joiner);
    })
    .then(function (savedGame) {
      logging.log('..join success', gameId);
      return savedGame;
    });

};
