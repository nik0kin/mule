/**
 * Created with IntelliJ IDEA.
 * User: npoklitar
 * Date: 1/13/14
 * Time: 9:18 AM
 * To change this template use File | Settings | File Templates.
 */

var mongoose = require('mongoose');


var GameSchema = new mongoose.Schema({
  id: {
    type: Number,
    index: true
  },
  name: {type: String, default: "Unnamed Game"},
  location: { x: Number, y: Number },
  numberOfPlayers: { type: Number, default: 0 },
//  gameStatus: {type: Enum, default: 0},
  turnNumber: {type: Number, default: 0},        //open, inprogress, finished
//  map: {type: null },
  currentLocalIDCounter: {type: Number, default: 0} //counter for id's of all units of the game
});

/**
 * Methods
 */

GameSchema.methods = {

  //name : function(){}

}



module.exports = mongoose.model('Game', GameSchema);
