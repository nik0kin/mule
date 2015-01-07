/**
 * Controllers->UserServices-> index.js
 */

var logging = require('mule-utils').logging;

var login = function (req, res) {
  var redirectTo = req.session.returnTo ? req.session.returnTo : '/success';
  delete req.session.returnTo;
  res.status(200).send({
    status : 0,
    statusMsg : 'Logged in Successfully',
    userId : req.user._id,
    username: req.user.username
  });
  logging.log(req.user.username + "login result: " + redirectTo);
  //res.redirect(redirectTo);
};

//exports.signin = function (req, res) {}

/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout();
  res.send();
  //res.redirect('/public');
};

/**
 * Session
 */

exports.session = login;
