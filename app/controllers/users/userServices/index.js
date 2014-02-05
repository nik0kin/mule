/**
 * Controllers->UserServices-> index.js
 *
 * Created by niko on 2/4/14.
 */


var login = function (req, res) {
  var redirectTo = req.session.returnTo ? req.session.returnTo : '/success';
  delete req.session.returnTo;

  res.status(200).send("Logged In");
  logger.info(req.user.username + "login result: " + redirectTo);
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
  res.redirect('/public')
};

/**
 * Session
 */

exports.session = login;
