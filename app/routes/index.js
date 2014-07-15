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

  // historys //
  require('./historys/routes')(app);

  // gameStates //
  require('./gameStates/routes')(app);

  /////////// STUFF ////////
  require('./playTurn/routes')(app);
};
