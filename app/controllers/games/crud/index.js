/**
 * controllers/games/crud/index.js
 *
 * Created by niko on 1/21/14.
 */

var fs = require('fs'),
  _ = require('underscore'),
  mongoose = require('mongoose'),
  winston = require('winston');

var Game = require('mule-models').Game,
  gameConfigUtils = require('mule-utils/gameConfigUtils'),
  responseUtils = require('mule-utils/responseUtils'),
  gameHelper = require('./helper'),
  getUsersGamesQ = require('./getUsersGames');


exports.index = function (req, res) {
  winston.info('GET /users');

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
  winston.info('POST /games');

  var responseJSON = {
    status: 0,
    statusMsg: "Success",
    gameID: ""
  };

  gameConfigUtils.promiseToValidate(req.body.gameConfig)
    .done(function (result) {
      gameHelper.createQ({validatedParams: result, creator : req.user})
        .done(function (value) {
          responseJSON.gameID = value._id;
          return res.status(200).send(responseJSON);
        },  responseUtils.sendNotAcceptableErrorCallback(res));
    }, responseUtils.sendNotAcceptableErrorCallback(res) );
};

exports.read = function (req, res) {
  winston.info('GET /games/:id', req.params.id);

  gameHelper.readQ(req.params.id)
    .then(function (game){
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
  winston.info('GET /users/:id/games', req.params.id);

  getUsersGamesQ(req.params.id)
    .then(function (game){
      res.send(game);
    })
    .fail(responseUtils.sendNotFoundErrorCallback(res))
    .done();
};