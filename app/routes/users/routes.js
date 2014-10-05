/**
 * Controllers->Users-> routes.js
 *
 * Created by niko on 2/4/14.
 */

var userController = require('./crud/index'),
  userServices = require('./userServices/index');

module.exports = function (app, passport) {
  app.get ('/users', userController.index);
  app.post('/users', userController.create);
  app.get ('/users/:id', userController.read);

  ////////// ETC ////////////

  // both login http://passportjs.org/guide/authenticate/
  app.post('/LoginAuth', passport.authenticate('local', {
  /*  successRedirect: '/success',
    failureRedirect: '/failure', */
    failureFlash: 'Invalid email or password.'
  }), userServices.session);

  /*app.post('/users/session', //TODO what is this used for
    passport.authenticate('local', {
      failureRedirect: '/failure',
      failureFlash: 'Invalid email or password.'
    }), userServices.session);*/

  app.get('/session', function (req, res) {
    if (!req.user) {
      res.status(403).send();
    } else {
      res.send(req.user);
    }
  });

  app.post('/logout', userServices.logout);

};
