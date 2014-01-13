

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    winston = require('winston'),
    _ = require('underscore');

var login = function (req, res) {
  var redirectTo = req.session.returnTo ? req.session.returnTo : '/success'
  delete req.session.returnTo
  res.redirect(redirectTo)
}

//exports.signin = function (req, res) {}

/**
 * Auth callback
 */

exports.authCallback = login

exports.createUserHelper = function(req, parameters, callback){
  var newUser = new User({accountName: parameters.accountName, password: parameters.password});
  newUser.provider = 'local'
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
  var params = req.body;//(req.params && req.params.length > 0 ? req.params : (req.query && !_.isEmpty(req.query) ? req.query : req.body));
  console.log("params: " + params);
  exports.createUserHelper(req, params, function(err, user){
    var responseJSON = {
      status: 0,
      statusMsg: "Success",
      token: ""
    };
    if (!err){
      responseJSON.token = user.accountName;
      return res.status(200).send(responseJSON);
    }

    // manually login the user once successfully signed up
    req.logIn(user, function(err) {
      if (err) return next(err)
    })
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

