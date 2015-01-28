var LocalStrategy = require('passport-local').Strategy,
  User = require('mule-models').User.Model,
  logging = require('mule-utils').logging;


module.exports = function (passport) {
  // require('./initializer')

  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user);
    });
  });

  // use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function(_username, password, done) {//later revert back to email?
      logging.log("attempting to login: \nusername= "+_username+"\npassword= "+password);
      User.findOne({ username: _username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Unknown user' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' });
        }
        return done(null, user);
      });
    }
  ));
};
