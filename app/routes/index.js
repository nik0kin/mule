/**
 * Expose routes
 */

module.exports = function (app, passport) {
  // heartbeat
  app.get('/alive', function (req, res) {
    res.status(200).send({
      msg: 'yee',
      time: new Date().toString()
    });
  });

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

  // turns //
  require('./turns/routes')(app);

  // gameStates //
  require('./gameStates/routes')(app);

  /////////// STUFF ////////
  require('./playTurn/routes')(app);
};
