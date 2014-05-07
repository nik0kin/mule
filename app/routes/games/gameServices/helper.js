/**
 * app/controllers/gameServices/helper.js
 *
 * Created by niko on 2/3/14.
 */

var Q = require('q'),
  winston = require('winston');

var gamesCrudHelper = require('../crud/helper');

exports.joinQ = function(params){
  var gameID = params.gameID;
  var joiner = params.joiner;//expecting a user

  return Q.promise( function (resolve, reject) {
    winston.log('info', "User attempting to join Game: ", params);

    gamesCrudHelper.readQ(gameID)
      .done(function (thatGame) {
        winston.info('game id='+gameID + ' valid');

        thatGame.joinGameQ(joiner)
          .done(function () {
            winston.info('join success');
            thatGame.saveQ()
              .done(resolve, reject);
          }, reject);
      }, reject);
  });
};