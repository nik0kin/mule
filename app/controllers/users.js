

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    winston = require('winston');



// createUser({accountname,password })
  // returns a promise
exports.createUser = function createUser(parameters,callback){
  var newUser = new User({accountName: parameters.accountName});
  newUser.save(function (err,user) {
  if (err) {
//    console.log("err: "+ err);
    return callback(err,user); //    return handleError(err);
  }
  // saved!
    winston.log('info',"saved: "+user);
    callback(err,user);
  });

};
//returns a query object
exports.getAllUsers = function getAllUsers(callback){
  return User.find({},'accountName password',
    function (err, users) {

      if (err){
        //handleError(err);
        return;
      }
      callback(err,users);
    });

};

