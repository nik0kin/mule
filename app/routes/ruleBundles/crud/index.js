/**
 * Controllers->RuleBundle->CRUD-> index.js
 *
 */

var fs = require('fs'),
  _ = require('lodash'),
  mongoose = global.getMongoose(),
  winston = require('winston');

var RuleBundle = require('mule-models').RuleBundle,
  responseUtils = require('mule-utils/responseUtils'),
  ruleBundleHelper = require('./helper');


exports.index = function (req, res) {
  winston.info('GET /ruleBundles');

  ruleBundleHelper.indexQ()
    .then(function (ruleBundles) {
      res.send(ruleBundles);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};

exports.create = function (req, res) {
  winston.info('POST /ruleBundles');

  var responseJSON = {
    status: 0,
    statusMsg: "Success",
    ruleBundleID: ""
  };

  ruleBundleHelper.createQ(req.body.ruleBundleConfig)
    .done(function (value) {
      responseJSON.ruleBundleID = value._id;
      return res.status(200).send(responseJSON);
    },  responseUtils.sendNotAcceptableErrorCallback(res));
};

exports.read = function (req, res) {
  winston.info('GET /ruleBundles/:id', req.params.id);

  ruleBundleHelper.readQ(req.params.id)
    .then(function (ruleBundle){
      if (!ruleBundle) {
        responseUtils.sendNotFoundError(res, 'Not Found');
      } else
        res.send(ruleBundle);
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
