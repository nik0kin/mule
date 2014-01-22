/*jshint expr: true*/
var mongoose = require('mongoose'),
    should = require('should'),
    app = require ('../../server.js'),
    User = require('../../app/models/User'),
    users = require('../../app/controllers/users');

describe('Controllers', function () {
  describe('Users: ', function() {
    beforeEach(function(done){
      User.collection.remove(function(err){
        if (err) return done(err);
          done();
      });
    });
/*    afterEach(function(){  //sanity test
      users.getAllUsers(function (users){
        console.log(users);
      });
    });*/
    describe('createUser: ', function(){
      it('should execute a callback with a valid User object',function (done){
        var _username = "toodly_woodly";
        users.createUserHelper(
          {
            username: _username,
            password: "testoff"
          },function(err,user){
            user.should.be.ok;
            user.username.should.eql(_username);
            done();
          });
      });
      it('should fail when you dont pass an username',function(done){
        users.createUserHelper({
            password: "justpass"
          }, function(err,user){
            should(user).not.be.ok;
            err.message.should.eql('Validation failed');
            done();
          });
      });
    });
    describe('getAllUsers: ',function(){
      it('should have a callback(err,[users])', function(done){
        users.getAllUsers(function(err,userz){
          userz.should.be.an.instanceOf(Array);
          userz.should.be.empty;

          //now put a user in, and check if its there
          users.createUserHelper({username:'fred',password: 'fredfish'},function(){
            users.getAllUsers(function (err, userz2){
              userz2.should.not.be.empty;
              userz2.pop().username.should.eql('fred');
              done();
            });
          });
        });
      });
      it('should return a Query object ', function(done){
        users.createUserHelper({username:'jeff',password: 'fej'},function(){
          var query = users.getAllUsers(function (err, users){});

          should(query).have.property('mongooseCollection');

          query.findOne({username:'jeff'},function(err,jeff){
            jeff.username.should.be.ok;
            jeff.username.should.eql('jeff');
          });
          done();
        });
      });
    });/*
    after(function(done){
      require('./helper').clearDb(function(){
        console.log('now here');
        mongooselearn.createUser({username:'bill'},function(err){
          if(err) console.log(err);
          console.log('created user');
          done();
        });
      });
    });*/
  });
});

