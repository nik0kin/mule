/**
 * models/Game/instanceMethodsHelper.js
 *
 * Created by niko on 1/28/14.
 */

var Q = require('q'),
  _ = require('underscore');

/*exports.addMethods = function (GameSchema) {
  var that = this;
  console.log('farting now')
  console.log(that);

  //resolves playerPosition (relative to game)
  GameSchema.methods.joinGameQ = function (playerID) {
    return Q.promise(function (resolve, reject) {
      //valid user?

      //are we full?
      if (GameSchema.methods.isFull()){
        return reject('Game Full');
      }

      //is the player in this Game already?

      //make object
      var newPlayerGameInfo = { //aka piggie
        "playerID" : playerID,
        "playerStatus" : 'inGame'
      };

      //update db


      console.log('HELLO')
      console.log(playerID);
      resolve();
    });
  };

  GameSchema.methods.getNextPlayerPositionQ = function () {
    return Q.promise(function (resolve, reject) {

    });
  };

  GameSchema.methods.getCurrentPlayerCount = function () {
    console.log('lol')
    console.log(this)
    return _.values(this.players);
  };

  GameSchema.methods.isFull = function () {
    return GameSchema.methods.getCurrentPlayerCount() === this.numberOfPlayers;
  };

//  return that;
};*/
