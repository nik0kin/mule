/**
 * Controllers->RuleBundle->CRUD-> index.js
 */

var RuleBundle = require('mule-models').RuleBundle,
  logging = require('mule-utils').logging,
  responseUtils = require('mule-utils/responseUtils'),
  ruleBundleHelper = require('./helper');


exports.index = function (req, res) {
  logging.vog('GET /ruleBundles');

  ruleBundleHelper.indexQ()
    .then(function (ruleBundles) {
      res.send(ruleBundles);
    })
    .fail(responseUtils.sendBadRequestCallback(res))
    .done();
};

exports.create = function (req, res) {
  logging.vog('POST /ruleBundles');

  var responseJSON = {
    status: 0,
    statusMsg: "Success",
    ruleBundleId: ""
  };

  ruleBundleHelper.createQ(req.body.ruleBundleConfig)
    .done(function (value) {
      responseJSON.ruleBundleId = value._id;
      return res.status(200).send(responseJSON);
    },  responseUtils.sendNotAcceptableErrorCallback(res));
};

exports.read = function (req, res) {
  logging.vog('GET /ruleBundles/:id', req.params.id);

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
