/*jshint expr: true*/
var mongoose = require('mongoose'),
  should = require('should');
 // User = require('../../app/models/User');
 var app = require ('../../server.js');

var request = require('supertest');

describe('API', function () {
  describe('Users: ', function() {
    /*beforeEach(function(done){
      User.collection.remove(function(err){
        if (err) return done(err);
        done();
      });
    });*/

    var dumbAccount = {accountName: "fart", password: "piss"};

    describe('POST /users', function(){
      it('respond with json', function(done){
        request(app) //"http://localhost:3130")
          .post('/users')
          .send({accountName: "fart", password: "piss"})
          //.set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            done()
          });
      });
      it('TMP: should send a token which is your user name', function(done){
        request("http://localhost:3130")
          .post('/users')
          .send(dumbAccount)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            dumbAccount.accountName.should.equal(res.body.token);

            done()
          });
      });
    });

  });
});

