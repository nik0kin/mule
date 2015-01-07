/**
 * Controllers->RuleBundle->CRUD-> helper.js
 */

var utils = require('mule-utils/jsonUtils'),
  logging = require('mule-utils').logging,
  RuleBundle = require('mule-models').RuleBundle.Model;

exports.indexQ = function () {
  return RuleBundle.find().execQ();
};

exports.createQ = function (params) {
  // TODO wtf is this shit, users arent allowed to create RBs
  logging.vog("User attempting to create new RuleBundle: params: ", null, params);

  var newRoleBundle = new RuleBundle(params);
  return newRoleBundle.saveQ();
};

exports.readQ = function (ruleBundleId){
  return RuleBundle.findByIdQ(ruleBundleId);
};

exports.update = function (parameters, callback) {

};

exports.destroy = function (parameters, callback) {

};
