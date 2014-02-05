
/**
 * Controllers
 */


/**
 * Route middlewares
 */

//var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];

/**
 * Expose routes
 */

module.exports = function (app, passport) {

  ////////// DATA MODELS //////////
  // users //
  require('../app/controllers/users/routes')(app, passport);

  // games //
  require('../app/controllers/games/routes')(app);

};
