/**
 * test/controllers/userSpec.js
 *
 */

var initTestMule = require('../configUtils').initTestMule;

var should = require('should'),
  Q = require('q'),
  _ = require('lodash');

var users,
  dbHelper = require('mule-models/test/dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper');

describe('Controllers: ', function () {
  before(function (done) {
    initTestMule(function () {
      users = require('../../app/routes/users/crud/helper');
      done();
    });
  });
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
                  console.log(JSON.stringify(value));
                  should(value).have.property('username');
                  should(value).have.property('_id');
                  should(value.salt).not.ok;
                  should(value.hashed_password).not.ok;
                });
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });
    });
  });
});

