/**
 * utilsSpec.js
 *
 * Created by niko on 1/25/14.
 *
 * http://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
 */
var mongoose =require('mongoose');

//var app = require ('../../../server.js');

var should = require('should'),
  User = require('../../../app/models/User'),
  Game = require('../../../app/models/Game');
var app = require ('../../../server.js');

var request = require('supertest');

var serverIP = 'http://localhost:3130';

var user1 = request.agent(serverIP);

describe('API', function () {
  var fakeuser = {username: "nikolas", password: "poklitar"};
  var registerAndLogin = function (callback) {
    user1.post('/users').send(fakeuser).expect(200).end(function(err, res){
      callback();
    });
  };

  describe('Games: ', function () {

    beforeEach(function (done){
      User.collection.remove(function (err){
        if (err) return done(err);
        registerAndLogin(done);
      });
    });

    var validCreateGamesBody = {
      gameConfig : {
        "name": "fun game 3v3",
        "numofplayers": 6,
        "width": 40,
        "height": '40',
        "fog": 'false',
        "turnstyle": "realtime"
      }
    } ;

    describe('POST /games', function () {
      it('reject missing gameConfig', function (done) {
        user1 //"http://localhost:3130")
          .post('/games')
          .send({'fart' : 'dumb'})
          .set('Accept', 'application/json')
          .expect(400)
          .end(function(err, res){
            if (err) return done(err);
            done()
          });
      });
      it('respond with json', function (done) {
        user1 //"http://localhost:3130")
          .post('/games')
          .send(validCreateGamesBody)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            done()
          });
      });

      it('take a correct gameConfig, save to DB, and return _id ', function (done) {
        done();
      });
      it('reject an incorrect gameConfig', function (done) {
        done();
      });
    });
  });
});

