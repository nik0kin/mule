/**
 * controllers/games/crud/index.js
 */

var _ = require('lodash');

var responseUtils = require('mule-utils/responseUtils'),
  logging = require('mule-utils').logging,
  gameHelper = require('./helper'),
  getUsersGamesQ = require('./getUsersGames');


exports.index = function (req, res) {
  logging.vog('GET /users');

  gameHelper.indexQ()
    .then(function (games) {
      res.send(games);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};

/*

I want to validateJSON

then

attempt to do make the game

 */

exports.create = function (req, res) {
  logging.vog('POST /games');

  var responseJSON = {
    status: 0,
    statusMsg: "Success",
    gameId: ""
  };

  //gameConfigUtils.promiseToValidate(req.body.gameConfig)
  //  .done(function (result) {
      gameHelper.createQ({validatedParams: req.body.gameConfig, creator : req.user})
        .done(function (value) {
          responseJSON.gameId = value._id;
          return res.status(200).send(responseJSON);
        },  responseUtils.sendNotAcceptableErrorCallback(res));
  //  }, responseUtils.sendNotAcceptableErrorCallback(res) );
};

exports.read = function (req, res) {
  logging.vog('GET /games/:id', req.params.id);

  gameHelper.readQ(req.params.id)
    .then(function (game){
      if (!game) {
        responseUtils.sendNotFoundError(res, 'Not Found');
      } else
        res.send(game);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};

exports.update = function (req, res) {
  responseUtils.sendNotYetImplemented(res, 'update');
};

exports.destroy = function (req, res) {
  responseUtils.sendNotYetImplemented(res, 'destroy');
};


///////////////////////////////////////////////////////////////

exports.readUsersGames = function (req, res) {
  logging.vog('GET /users/:id/games', req.params.id);

  getUsersGamesQ(req.params.id)
    .then(function (game){
      res.send(game);
    })
    .fail(responseUtils.sendNotFoundErrorCallback(res))
    .done();
};
