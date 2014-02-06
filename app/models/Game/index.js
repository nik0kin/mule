/**
 * Models->Game-> index.js
 *
 */

var mongoose = require('mongoose-q')(require('mongoose')),
  Q = require('q'),
  _ = require('underscore');

var validateHelp = require('./validateHelper'),
  instanceMethodsHelp = require('./instanceMethodsHelper'),
  users = require('../../controllers/users/crud/index'),
  winston = require('winston');

var GameSchema = new mongoose.Schema({
  //// IDENTIFICATION ////
  id: { type: Number, index: true },
  name : {type: String, default: "Unnamed Game"},

  //// HIGH LEVEL SETTINGS ////
  // RuleBundle
  // turn??? - round robin vs async..
  turnStyle : {type : String, default : 'default'},
  maxPlayers : { type: Number, default: 0 },   //TODO rename this

  //// GAME INFO ////
  gameStatus: {type: String, default: 'open'},
  turnNumber: {type: Number, default: 0},        //open, inprogress, finished
  players : {type : mongoose.Schema.Types.Mixed, default : {} },

  //// MAP INFO ////
  // dependant on RuleBundle (will be moved soon)
  width : {type: Number, default: 1},
  height : {type: Number, default: 1},
  //map: {type: null },

  //// SETTINGS ////
  // etc settings dependant on rule bundle
  fog : {type: String, default: 'default'},

  //// ETC ////
  currentLocalIDCounter: {type: Number, default: 0} //counter for id's of all units of the game
});

/**
 * Virtuals
 */

GameSchema.virtual('playersCount').get(function () {
  return _.values(this.players).length;
});
GameSchema.virtual('full').get(function () {
  return this.playersCount === this.maxPlayers;
});

/**
 * Validators
 */

validateHelp.addValidators(GameSchema);

/**
 * Methods
 */
GameSchema.methods = {
  joinGameQ : function (player) {
    var that = this;
    return Q.promise(function (resolve, reject) {
      //valid user?
      if (!player || !player._id){//TODO lazy, didnt check db
        return reject('invalid player');
      }

      //are we full?
      if (that.full){
        return reject('Game Full');
      }

      //is the player in this Game already?
      if (that.getPlayerPosition(player._id) !== -1) {
        return reject('Player is already in Game');
      }

      //make object
      var newPlayerGameInfo = { //aka piggie
        "playerID" : player._id,
        "playerStatus" : 'inGame'
      };

      var position = that.getNextPlayerPosition();
      //that.players['p1'] = newPlayerGameInfo; // WHY DOESN'T THIS WORK

      var playersCopy = _.clone(that.players); //ugly fix
      playersCopy[position] = newPlayerGameInfo;
      that.players = playersCopy;

    /*  that.players = { //works
        'p1' : newPlayerGameInfo
      };*/

      //update db
      that.saveQ()
        .then(function (result) {
          winston.info('player[' + player.username + '|' + player._id + '] added to game: ' + result._id + ' [' + result.playersCount + '/' + result.maxPlayers + ']');
          resolve(result);
        })
        .fail(reject)
        .done();
    });
  },

  //simple for now, but later it should adapt when people 'leave' a game before it starts
  getNextPlayerPosition : function () {
    if (this.playersCount >= this.maxPlayers)
      throw 'playerCount exceeds maxPlayers';
    return 'p' + (this.playersCount + 1);
  },

  //returns -1 if player is not in game
  getPlayerPosition : function (playerID) {
    var position = -1;
    _.each(this.players, function (value, key) {
      if (_.isEqual(value.playerID, playerID)) { // === doesn't work, but idk what types they were ( _.isString said false) TODO figure it out and write a unit test for it
        position = key;
      }
    });
    return position;
  }
};

module.exports = mongoose.model('Game', GameSchema);
