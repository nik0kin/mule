/**
 * Controllers->Users-> index.js
 *
 * Created by niko on 2/4/14.
 */

var _ = require('underscore'),
  mongoose = require('mongoose-q')(require('mongoose')),
  Q = require('q'),
  winston = require('winston');

var jsonUtils = require('../../../utils/jsonUtils'),
  User = mongoose.model('User'),
  helper = require('./helper');


exports.index = function (req, res){
  helper.indexQ()
    .done(function (users) {
      return res.status(200).send(users);
    }, function (err) {
      return res.status(500).send(err);
    });
};

var userParamSpec = {
  username : {required : true, type: 'string'},
  password : {required : true, type: 'string'}
};

exports.create = function (req, res){
  var responseJSON = {
    originalURL : req.originalUrl,
    status: 0,
    statusMsg: "Success",
    "userID": ""
  };

  jsonUtils.validateJSONBody(req.body, userParamSpec, function (validatedParams) {
    winston.log('info', "User attempting to register: params: ", validatedParams );

    helper.createQ(validatedParams)
      .done(function (user) {
        // manually login the user once successfully signed up
        req.logIn(user, function(err) {
          if (err)
            return next(err); //TODO change this to... ???
        });

        responseJSON.userID = user._id;
        winston.info('\'' + user.username +'\' created and logged in');
        return res.status(200).send(responseJSON);
      }, function (err) {
        winston.info('register failed');
        responseJSON.status = -1;
        responseJSON.statusMsg = err;
        return res.status(400).send(responseJSON);
      });
  }, function(missingKey) {
    responseJSON.status = -1;
    responseJSON.statusMsg = "Missing: " + missingKey + " parameter";
    return res.status(406).send(responseJSON);
  });
};

exports.read = function (req, res){
  helper.readQ(req.params.id)
    .done(function (foundUser) {
      return res.status(200).send(foundUser);
    }, function (err) {
      return res.status(404).send(err);
    });
};

exports.update = function (req, res){
  res.status(501).send("update");
};

exports.destroy = function (req, res){
  res.status(501).send("destroy");
};



