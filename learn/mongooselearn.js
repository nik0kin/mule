/*
  References:
    - http://mongoosejs.com/docs/api.html#model_Model-save
    - https://github.com/kriskowal/q
    - https://npmjs.org/package/mongoose-q
*/
var mongoose = require('mongoose'),
    db = mongoose.createConnection('mongodb://localhost/mongooselearn');

//  make user model  ///
function validatePresenceOf(value){
  if( value && value.length)
    return true;
  else
    return false;
}

var UserSchema = new mongoose.Schema({
  accountName: {
    type: String,
    validate: [validatePresenceOf, "an accountname is required"],
    index: true
  },
  password: String, //for now
  realname: {first: String, last: String},
//  profilePicture: "NYI",
  friends: [UserSchema]
});

User = db.model('User', UserSchema);


User.on('error',function(err){
  console.log('caught: '+err);
});
//////////////////////


// createUser({accountname,password })
  // returns a promise
var createUser = function(parameters,callback){
  var newUser = new User({accountName: parameters.accountName});
  newUser.save(function (err,user) {
  if (err) {
//    console.log("err: "+ err);
    return callback(err,user); //    return handleError(err);
  } 
  // saved!
//    console.log("saved: "+user);
    callback(err,user);
  });

};
//returns a query object
var getAllUsers = function(callback){
  return User.find({},'accountName password',
    function (err, users) {

      if (err){
        //handleError(err);
        return;
      }
      callback(users);
    });

};

module.exports.createUser = createUser;
module.exports.getAllUsers = getAllUsers;
