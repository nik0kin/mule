
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
  require('./controllers/users/routes')(app, passport);

  // games //
  require('./controllers/games/routes')(app);

  // gameBoards //
  require('./controllers/gameBoards/routes')(app);

  // ruleBundles //
  require('./controllers/ruleBundles/routes')(app);
};
