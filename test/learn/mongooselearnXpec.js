/*jshint expr: true*/
var mongoose = require('mongoose'),
    should = require('should'),
    mongooselearn = require ('../../learn/mongooselearn.js');

describe('learn: User functions: ', function () {
  console.log("WOW A");
/*  before(function(){
    //add one user
    mongooselearn.createUser({accountName: "db ghost"},function(){});
  });*/
  describe('addUser: ', function(){
    beforeEach(function(done){
      User.collection.remove(function(err){
        if (err) return done(err);
          done();
      });
    });

    it('should execute a callback with a valid User object',function (done){
      var _accountName = "toodly_woodly";
      mongooselearn.createUser(
        { 
          accountName: _accountName,
          password: "testoff"
        },function(err,user){
          user.should.be.ok; 
          user.accountName.should.eql(_accountName);
    //      console.log("added: "+ user.accountName);
          done();
        });
    });
    it('should fail when you dont pass an accountName',function(done){
      mongooselearn.createUser(
        {
          password: "justpass"
        }, function(err,user){
          should(user).not.be.ok;
          err.message.should.eql('Validation failed');
          done();
        });
      //  done();
    });
  });
  describe('getAllUsers: ',function(){
    beforeEach(function(done){
      User.collection.remove(function(err){
        if (err) return done(err);
          done();
      });
    });
    it('should have a callback([users])', function(done){
      mongooselearn.getAllUsers(function(users){
        users.should.be.an.instanceOf(Array);
        done();
      });
    });
    it('should return a Query object ', function(done){
      mongooselearn.createUser({accountName:'jeff',password: 'fej'},function(){
        var query = mongooselearn.getAllUsers(function (users){});

        should(query).have.property('mongooseCollection');

        query.findOne({accountName:'jeff'},function(err,jeff){
          jeff.accountName.should.be.ok;
          jeff.accountName.should.eql('jeff');
        });
        done();
      });
    });
  });
/*  after(function(done){
    require('./helper').clearDb(function(){
      console.log('now here');
      mongooselearn.createUser({accountName:'bill'},function(err){
        if(err) console.log(err);
        console.log('created user');
        done();
      });
    });
  });
*/
});

