var winston = require('winston');

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    //TODO log this somewhere else
    winston.error("unauth: redirecting '"+req.originalUrl+"' to /login");
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }
  next();
};

//probably scrap below this?

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization : function (req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/users/'+req.profile.id);
    }
    next();
  }
};

