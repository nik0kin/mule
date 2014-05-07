
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
  require('./users/routes')(app, passport);

  // games //
  require('./games/routes')(app);

  // gameBoards //
  require('./gameBoards/routes')(app);

  // ruleBundles //
  require('./ruleBundles/routes')(app);

  /////////// STUFF ////////
  require('./playTurn/routes')(app);
};
