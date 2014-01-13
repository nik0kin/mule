

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    winston = require('winston'),
    _ = require('underscore');

exports.createUserHelper = function(parameters, callback){
  var newUser = new User({accountName: parameters.accountName});
  newUser.save(function (err,user) {
    if (err) {
      console.log("err: "+ err);
      return callback(err,user); //    return handleError(err);
    }
    // saved!
    winston.log('info',"saved: "+user);
    if (typeof callback === "function")
      callback(err, user);
  });
};
// createUser({accountname,password })
  // returns a promise (does it?)

//params = ?
//body =   ?
//query =  ?
exports.createUser = function createUser(req, res){
  var params = (req.params && req.params.length > 0 ? req.params : (req.query && !_.isEmpty(req.query) ? req.query : req.body));
  console.log("params: " + params);
  exports.createUserHelper(params, function(err, user){
    var responseJSON = {
      status: 0,
      statusMsg: "Success",
      token: ""
    };
    if (!err){
      responseJSON.token = user.accountName;
      return res.status(200).send(responseJSON);
    }

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

