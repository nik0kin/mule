var _ = require('underscore'),
  mongoose = require('mongoose-q')(require('mongoose')),
  winston = require('winston');

var utils = require('../utils/jsonUtils');
    User = mongoose.model('User');



var login = function (req, res) {
  //var redirectTo = req.session.returnTo ? req.session.returnTo : '/success';
  //delete req.session.returnTo;
  res.status(200).send("yee");
  //console.log("login result: " + redirectTo);
  //res.redirect(redirectTo);
};

//exports.signin = function (req, res) {}

/**
 * Auth callback
 */


exports.authCallback = login

exports.createUserHelper = function (parameters, callback) {
  var newUser = new User({username: parameters.username, password: parameters.password});
  newUser.provider = 'local';
  newUser.saveQ()
    .done(function (user) {

    // saved!
    winston.log('info',"saved: "+user);

    if (typeof callback === "function")
      callback(undefined, user);
    }, function (err) {
      if (err) {
        console.log("err: "+ err);
        return callback && callback(err);
      }
    });
};
// createUser({accountname,password })
  // returns a promise (does it?)

//params = ?
//body =   ?
//query =  /users?thiswould=beaquery
exports.createUser = function createUser(req, res){
  var responseJSON = {
    originalURL : req.originalUrl,
    status: 0,
    statusMsg: "Success",
    token: ""
  };

  utils.validateJSONBody(req.body, {username: {required : true, type: 'string'}, password : {required : true, type: 'string'}}, function (params) {
    console.log( "User attempting to register: params: " + JSON.stringify(params) );
    exports.createUserHelper(params, function(err, user){
      if (!err){
        // manually login the user once successfully signed up
        req.logIn(user, function(err) {
          if (err) return next(err)
        });

        console.log(user.username +' created and logged in');
        responseJSON.token = user.username;
        return res.status(200).send(responseJSON);
      } else {
        console.log("login failed");
      }
    });
  }, function(missingKey) {
    responseJSON.status = -1;
    responseJSON.statusMsg = "Missing: " + missingKey + " parameter";
    return res.status(400).send(responseJSON);
  });

};
//returns a query object
exports.getAllUsers = function getAllUsers(callback){
  return User.find({},'username password',
    function (err, users) {

      if (err){
        //handleError(err);
        return;
      }
      callback(err,users);
    });

};


/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout()
  res.redirect('/public')
}

/**
 * Session
 */

exports.session = login

