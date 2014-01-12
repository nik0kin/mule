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
    describe('addUser: ', function(){
      it('should execute a callback with a valid User object',function (done){
        var _accountName = "toodly_woodly";
        users.createUser(
          { 
            accountName: _accountName,
            password: "testoff"
          },function(err,user){
            user.should.be.ok; 
            user.accountName.should.eql(_accountName);
            done();
          });
      });
      it('should fail when you dont pass an accountName',function(done){
        users.createUser({
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
          users.createUser({accountName:'fred',password: 'fredfish'},function(){
            users.getAllUsers(function (err, userz2){
              userz2.should.not.be.empty;
              userz2.pop().accountName.should.eql('fred');
              done();
            });
          });
        });
      });
      it('should return a Query object ', function(done){
        users.createUser({accountName:'jeff',password: 'fej'},function(){
          var query = users.getAllUsers(function (err, users){});

          should(query).have.property('mongooseCollection');

          query.findOne({accountName:'jeff'},function(err,jeff){
            jeff.accountName.should.be.ok;
            jeff.accountName.should.eql('jeff');
          });
          done();
        });
      });
    });/*
    after(function(done){
      require('./helper').clearDb(function(){
        console.log('now here');
        mongooselearn.createUser({accountName:'bill'},function(err){
          if(err) console.log(err);
          console.log('created user');
          done();
        });
      });
    });*/
  });
});

