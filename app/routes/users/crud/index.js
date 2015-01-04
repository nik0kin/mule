/**
 * Controllers->Users-> index.js
 */

var _ = require('lodash'),
  mongoose = global.getMongoose(),
  Q = require('q'),
  winston = require('winston');

var jsonUtils = require('mule-utils/jsonUtils'),
  responseUtils = require('mule-utils/responseUtils'),
  User = require('mule-models').User,
  helper = require('./helper');


exports.index = function (req, res) {
  helper.indexQ()
    .done(function (users) {
      return res.status(200).send(users);
    }, responseUtils.sendInternalServerErrorCallback(res));
};

var userParamSpec = {
  username : {required : true, type: 'string'},
  password : {required : true, type: 'string'}
};

exports.create = function (req, res) {
  var responseJSON = responseUtils.getNewResponseJSON();
  responseJSON.userId = "";

  jsonUtils.validateJSONBody(req.body, userParamSpec, function (validatedParams) {
    winston.log('info', "User attempting to register: params: ", validatedParams );

    helper.createQ(validatedParams)
      .done(function (user) {
        // manually login the user once successfully signed up
        req.logIn(user, function (err) {
          if (err)
            return next(err); //TODO change this to... ???
        });

        responseJSON.userId = user._id;
        responseJSON.username = user.username;
        winston.info('\'' + user.username +'\' created and logged in');
        return res.status(200).send(responseJSON);
      }, function (err) {
        winston.info('register failed');
        return responseUtils.sendInternalServerError(res, err);
      });
  }, function (missingKey) {
    responseJSON.status = -1;
    responseJSON.statusMsg = "Missing: " + JSON.stringify(missingKey) + " parameter";
    return res.status(406).send(responseJSON);
  });
};

exports.read = function (req, res) {
  helper.readQ(req.params.id)
    .done(function (foundUser) {
      if (!foundUser) {
        responseUtils.sendNotFoundError(res, 'Not Found');
      } else {
        return res.status(200).send(foundUser);
      }
    }, responseUtils.sendNotFoundErrorCallback(res));
};

exports.update = function (req, res) {
  responseUtils.sendNotYetImplemented(res, "update");
};

exports.destroy = function (req, res) {
  responseUtils.sendNotYetImplemented(res, "destroy");
};
