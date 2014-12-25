/**
 * Controllers->Users-> helper.js
 *
 * Created by niko on 2/4/14.
 */

var _ = require('lodash'),
  Q = require('q'),
  winston = require('winston');

var User = require('mule-models').User.Model;

exports.indexQ = function () {
  return User.find({}, 'username _id').execQ();
};

exports.createQ = function (validatedParams) {
  return Q.promise( function (resolve, reject) {
    winston.info( "Attempting to create user: params: ", validatedParams );

    var newUser = new User(validatedParams);
    newUser.provider = 'local';

    newUser.saveQ()
      .done(resolve, reject);
  });
};

exports.readQ = function (userId){
  winston.info('reading User: ' + userId);
  return User.findByIdQ(userId, 'username _id');
};

exports.updateQ = function () {
  //TODO later
};

exports.destroyQ = function () {
  //TODO later
};
