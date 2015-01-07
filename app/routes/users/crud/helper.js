/**
 * Controllers->Users-> helper.js
 */

var _ = require('lodash'),
  Q = require('q');

var User = require('mule-models').User.Model,
  logging = require('mule-utils').logging;

exports.indexQ = function () {
  return User.find({}, 'username _id').execQ();
};

exports.createQ = function (validatedParams) {
  logging.log('Attempting to create user: params: ', null, validatedParams);

  var newUser = new User(validatedParams);
  newUser.provider = 'local';

  return newUser.saveQ();
};

exports.readQ = function (userId){
  return User.findByIdQ(userId, 'username _id');
};

exports.updateQ = function () {
  //TODO later
};

exports.destroyQ = function () {
  //TODO later
};
