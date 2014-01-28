/**
 * controllers/games/index.js
 *
 * Created by niko on 1/21/14.
 */

var fs = require('fs'),
  _ = require('underscore'),
  mongoose = require('mongoose'),
  winston = require('winston');

var Game = require('../../models/Game'),
  utils = require('../../utils/jsonUtils'),
  gameHelper = require('./helper');

var errorResponse = function (res) {
  return function (_err) {
    //logger.error(err);
    console.log("err:")
    console.log(_err);
    res.status(400).send({
      status: -1,
      statusMsg: _err
    });
  }
};

var error = function (err) {
  //logger.error(err);
  console.log("err:")
  console.log(err);
};

exports.index = function(req, res){
  console.log('GET /users');

  Game.find().execQ()
    .then(function (games) {
      res.send(games);
    })
    .fail(errorResponse(res))
    .done();
};

/*

I want to validateJSON

then

attempt to do make the game

 */

exports.create = function(req, res){
  var responseJSON = {
    originalURL : req.originalUrl,
    status: 0,
    statusMsg: "Success",
    gameID: ""
  };

  console.log("attempting to crate: ");
  console.log(req.body);

  var params = utils.validateJSONBody(req.body,{gameConfig : {required : true, type: 'object'}}, function(){
    console.log( "User attempting to create new game: params: " + JSON.stringify(params) );
    gameHelper.create(params, function (err, user){
      if (!err){
        return res.status(200).send(responseJSON);
      }
    });
  }, function(missingKey){
    responseJSON.status = -1;
    responseJSON.statusMsg = "Err on: " + JSON.stringify(missingKey) + " parameter";
    return res.status(400).send(responseJSON);
  });
};

exports.read = function (req, res){
  console.log('GET /users/:id');

  Game.findByIdQ(req.params.id)
    .then(function (game){
      res.send(game);
    })
    .fail(errorResponse(res))
    .done();
};

exports.update = function (req, res){
  res.status(200).send("update");
};

exports.destroy = function (req, res){
  res.status(200).send("destroy");
};