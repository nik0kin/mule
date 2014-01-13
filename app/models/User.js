/*
  References:
    - https://github.com/LearnBoost/mongoose/blob/master/examples/schema/schema.js
    - http://dailyjs.com/2011/02/07/node-tutorial-12/
    - http://mongoosejs.com/docs/guide.html

*/

var mongoose = require('mongoose');

function validatePresenceOf(value){
  if( value && value.length)
    return true;
  else
    return false;
}

var UserSchema = new mongoose.Schema({
  accountName: {
    type: String, 
    validate: [validatePresenceOf, "an accountName is required"],
    index: true
  },
  password: String, //for now
  realname: {first: String, last: String},
//  profilePicture: "NYI",
  friends: [UserSchema]
});
   
module.exports = mongoose.model('User', UserSchema);
