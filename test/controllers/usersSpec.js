/**
 * test/controllers/userSpec.js
 *
 */

require('../../server.js');

var should = require('should'),
  Q = require('q'),
  _ = require('underscore');

var User = require('mule-models').User,
  users = require('../../app/controllers/users/crud/helper'),
  dbHelper = require('../dbHelper'),
  testHelper = require('../mochaHelper');

describe('Controllers: ', function () {
  describe('Users (helper): ', function() {
    afterEach(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('createQ: ', function(){
      it('should execute a callback with a valid User object',function (done){
        var _username = "toodly_woodly";
        users.createQ({ username: _username, password: "testoff"})
          .done(function(user){
            user.should.be.ok;
            user.username.should.eql(_username);
            done();
          }, testHelper.mochaError(done));
      });
      /* TODO redo when adding must be a unique username
       it('should fail when you dont pass an username',function(done){
       users.createQ({ password: "justpass"})
       .done(function(user){
       should(user).not.be.ok;
       err.message.should.eql('Validation failed');
       done();
       }, testHelper.mochaError(done));
       });*/
    });
    describe('indexQ: ', function () {
      it('should return a list with only _id and username\'s', function (done) {
        Q.all([users.createQ({ username: 'MYUSERNAME', password: "mypassword"}),
            users.createQ({ username: 'myotherusername', password: "mypassword2"})])
          .done(function () {
            users.indexQ()
              .done( function (results) {
                should(results).ok;
                should(results).be.instanceOf(Array);
                _.each(results, function (value) {
                  should(value).ok;
                  should(value).have.property('username');
                  should(value).have.property('_id');
                  should(value).not.have.property('hashed_password');
                  should(value).not.have.property('salt');
                });
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });
    });
  });
});

