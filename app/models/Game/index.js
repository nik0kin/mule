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
  instanceMethodsHelp = require('./instanceMethodsHelper');

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

  numberOfPlayers : { type: Number, default: 0 },
  players : {type : mongoose.Schema.Types.Mixed, default : {} },

  gameStatus: {type: String, default: 'open'},
  turnNumber: {type: Number, default: 0},        //open, inprogress, finished
//  map: {type: null },
  currentLocalIDCounter: {type: Number, default: 0} //counter for id's of all units of the game
});

/**
 * Virtuals
 */

GameSchema.virtual('players.count').get(function () {
  return _.values(this.players);
});
GameSchema.virtual('full').get(function () {
  return this.players.count === this.numberOfPlayers;
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
  joinGameQ : function (playerID) {
    var that = this;
    return Q.promise(function (resolve, reject) {
      //this = that;
      //console.log(this)
      //valid user?

      //are we full?
      if (that.full){
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
  },

  getNextPlayerPositionQ :function () {
    return Q.promise(function (resolve, reject) {

    });
  }
};

module.exports = mongoose.model('Game', GameSchema);
