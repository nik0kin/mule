/**
 * Created with IntelliJ IDEA.
 * User: npoklitar
 * Date: 1/13/14
 * Time: 9:18 AM
 * To change this template use File | Settings | File Templates.
 */

var mongoose = require('mongoose-q')(require('mongoose')),
  Q = require('q'),
  _ = require('underscore');

var validateHelp = require('./validateHelper'),
  instanceMethodsHelp = require('./instanceMethodsHelper'),
  users = require('../../controllers/users'),
  winston = require('winston');

var GameSchema = new mongoose.Schema({
  id: {
    type: Number,
    index: true
  },
  name : {type: String, default: "Unnamed Game"},

  width : {type: Number, default: 1},
  height : {type: Number, default: 1},

  fog : {type: String, default: 'default'},

  turnStyle : {type : String, default : 'default'},

  numberOfPlayers : { type: Number, default: 0 },   //TODO rename this
  players : {type : mongoose.Schema.Types.Mixed, default : {} },

  gameStatus: {type: String, default: 'open'},
  turnNumber: {type: Number, default: 0},        //open, inprogress, finished
//  map: {type: null },
  currentLocalIDCounter: {type: Number, default: 0} //counter for id's of all units of the game
});

/**
 * Virtuals
 */

GameSchema.virtual('playersCount').get(function () {
  return _.values(this.players).length;
});
GameSchema.virtual('full').get(function () {
  return this.playersCount === this.numberOfPlayers;
});

/**
 * Validators
 */

validateHelp.addValidators(GameSchema);

/**
 * Methods
 */
GameSchema.methods = //instanceMethodsHelp(GameSchema);//{
{
  joinGameQ : function (player) {
    var that = this;
    return Q.promise(function (resolve, reject) {
      //valid user?
      if (!player || !player._id){//TODO lazy, didnt check db
        winston.error('invalid player')
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
          winston.info('player[' + player.username + '] added to game: ' + result._id + ' [' + result.playersCount + '/' + result.numberOfPlayers + ']');
          resolve(result);
        })
        .fail(reject)
        .done();
    });
  },

  //simple for now, but later it should adapt when people 'leave' a game before it starts
  getNextPlayerPosition : function () {
    if (this.playersCount >= this.numberOfPlayers)
      throw 'playerCount exceeds numberOfPlayers';
    return 'p' + (this.playersCount + 1);
  },

  //returns -1 if player is not in game
  getPlayerPosition : function (playerID) {
    var position = -1;
    _.each(this.players, function (value, key) {
      if (value.playerID === playerID) {
        position = key;
      }
    });
    return position;
  }
};

module.exports = mongoose.model('Game', GameSchema);
