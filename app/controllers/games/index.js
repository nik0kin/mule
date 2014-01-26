/**
 * controllers/games/index.js
 *
 * Created by niko on 1/21/14.
 */

var _ = require('underscore'),
  mongoose = require('mongoose'),
  winston = require('winston');

var fs = require('fs');

var utils = require('../../utils/jsonUtils');
var gameHelper = require('./helper');

exports.index = function(req, res){
  res.status(200).send("index");
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

  var params = utils.validateJSONBody(req.body,{gameConfig : true}, function(){
    console.log( "User attempting to create new game: params: " + JSON.stringify(params) );
    gameHelper.create(params, function(err, user){
      if (!err){
        return res.status(200).send(responseJSON);
      }
    });
  }, function(missingKey){
    responseJSON.status = -1;
    responseJSON.statusMsg = "Err on: " + missingKey + " parameter";
    return res.status(400).send(responseJSON);
  });
};

exports.read = function(req, res){
  res.status(200).send("read");
};

exports.update = function(req, res){
  res.status(200).send("update");
};

exports.destroy = function(req, res){
  res.status(200).send("destroy");
};