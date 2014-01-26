/**
 * utilsSpec.js
 *
 * Created by niko on 1/25/14.
 */
var mongoose =require('mongoose');

//var app = require ('../../../server.js');

var should = require('should'),
  User = require('../../../app/models/User'),
  Game = require('../../../app/models/Game');
var app = require ('../../../server.js');

var request = require('supertest');

var serverIP = 'http://localhost:3130';

describe('API', function () {
  var fakeuser = {username: "nikolas", password: "poklitar"};
  var registerAndLogin = function (callback) {
    request(app).post('/users').send(fakeuser).expect(200).end(function(err, res){
      //console.log("register callback");
      login(callback);
    });
  };
  var login = function (callback) {
    request(app).post('/LoginAuth').send(fakeuser).expect(200).end(function(err, res){
      //console.log("login callback");
      callback();
    });
  };
  describe('Games: ', function() {

    beforeEach(function(done){
      User.collection.remove(function(err){
        if (err) return done(err);

        registerAndLogin(done);
      });
    });
    /*it('helper funcs', function(done) {
      done();           //registerAndLogin()
    });*/

    describe('POST /games', function() {
      it('respond with json', function(done) {
        request(app) //"http://localhost:3130")
          .post('/games')
          .send({gameConfig: {} })
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            done()
          });
      });
    });
  });
});

