/**
 * Controllers->Users-> helper.js
 *
 * Created by niko on 2/4/14.
 */

var _ = require('underscore'),
  mongoose = require('mongoose-q')(require('mongoose')),
  Q = require('q'),
  winston = require('winston');

var User = mongoose.model('User');

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

exports.readQ = function (userID){
  winston.info('reading User: ' + userID);
  return User.findByIdQ(userID, 'username _id');
};

exports.updateQ = function () {
  //TODO later
};

exports.destroyQ = function () {
  //TODO later
};
