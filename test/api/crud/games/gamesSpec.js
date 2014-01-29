/**
 * utilsSpec.js
 *
 * Created by niko on 1/25/14.
 *
 * http://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
 */
var mongoose = require('mongoose'),
  _ = require('underscore'),
  should = require('should'),
  Q = require('q');

var loginHelper = require('../../loginHelper')('http://localhost:3130'),
  User = require('../../../../app/models/User'),
  Game = require('../../../../app/models/Game/index');
var app = require ('../../../../server.js');


var loggedInUser;

describe('API', function () {
  describe('Games: ', function () {
    before(function (done){
      loginHelper.registerAndLoginQ
        .then(function (user) {
          loggedInUser = user;
          done();
        }, function (err) {
          done(err);
        });
    });

    after(function (done) {
      Q.all([User.collection.removeQ, Game.collection.removeQ])
        .done(function (value) {
          done()
        }, function (err) {
          done(err);
        });
    });

    var validCreateGamesBody = {
      gameConfig : {
        "name": "fun game 3v3",
        "numberOfPlayers" : '6',
        "width" : 40,
        "height" : '40',
        "fog" : 'false',
        "turnStyle" : "realtime"
      }
    };

    var expectedCreatedGameBody = {
      "name": "fun game 3v3",
      "numberOfPlayers" : 6,
      "width" : 40,
      "height" : 40,
      "fog" : 'false',
      "turnStyle" : "realtime"
    };

    var validCreateGamesBodyWithAlteredGameStatus = {
      gameConfig : {
        "name": "fun game 3v3",
        "numberOfPlayers" : '6',
        "width" : 40,
        "height" : '40',
        "fog" : 'false',
        "turnStyle" : "realtime",
        "gameStatus" : "}{}#$%#$^sh run OMG hax"
      }
    };

    var invalidCreateGamesBody = {
      gameConfig : {
        "name": "fun game 3v3",
        "numberOfPlayers" : '6',
        "width" : 0,
        "height" : -1,
        "fog" : 'false',
        "turnStyle" : "realtime"
      }
    };
    var invalidCreateGamesBody2 = {
      gameConfig : {
        "name": "fun game 3v3",
        "numberOfPlayers" : '6',
        "width" : 50000,
        "height" : 501,
        "fog" : 'false',
        "turnStyle" : "realtime"
      }
    };
    var invalidCreateGamesBody3 = {
      gameConfig : {
        "name": "fun game 3v3",
        "numberOfPlayers" : '11',
        "width" : 5,
        "height" : 5,
        "fog" : 'false',
        "turnStyle" : "realtime"
      }
    };
    var invalidCreateGamesBody4 = {
      gameConfig : {
        "name": "fun game 3v3",
        "numberOfPlayers" : '1',
        "width" : 5,
        "height" : 5,
        "fog" : 'false',
        "turnStyle" : "realtime"
      }
    };

    describe('POST /games', function () {
      it('reject missing gameConfig', function (done) {
        loggedInUser //"http://localhost:3130")
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
        loggedInUser //"http://localhost:3130")
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
        loggedInUser
          .post('/games')
          .send(validCreateGamesBody)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);

            var gameID = res.body.gameID;
            should(gameID).ok;
            //now check if we can GET it
            loggedInUser
              .get('/games/'+gameID)
              .send()
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res){
                if (err) return done(err);

                var body = res.body;
                _.each(expectedCreatedGameBody, function (value, key) {
                  //console.log(key + ': ' + body[key] + ' ?= ' + value)
                  should(body[key]).equal(value);
                });

                done();
              });
          });
      });

      it('take a correct gameConfig LACKING gameStatus, the system should set gameStatus to \'open\'', function (done) {
        loggedInUser
          .post('/games')
          .send(validCreateGamesBody)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);

            var gameID = res.body.gameID;
            should(gameID).ok;
            loggedInUser
              .get('/games/'+gameID)
              .send()
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res){
                if (err) return done(err);

                should(res.body).have.property('gameStatus', 'open');

                done();
              });
          });
      });

      it('take a correct gameConfig WITH a invalid gameStatus value, the system should ignore it, and set gameStatus to \'open\'', function (done) {
        loggedInUser
          .post('/games')
          .send(validCreateGamesBodyWithAlteredGameStatus)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);

            var gameID = res.body.gameID;
            should(gameID).ok;
            loggedInUser
              .get('/games/'+gameID)
              .send()
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res){
                if (err) return done(err);

                should(res.body).have.property('gameStatus', 'open');

                done();
              });
          });
      });

      describe('reject an incorrect gameConfig: ', function () {
        it('valid parameter types, but height/width needs to be greater than 0', function (done) {
          loggedInUser
            .post('/games')
            .send(invalidCreateGamesBody)
            .set('Accept', 'application/json')
            .expect(400)
            .end(function(err, res){
              if (err) return done(err);

              var body = res.body;
              should(body).ok;
              should(body.statusMsg).ok;
              should(body.statusMsg.errors).ok;
              should(body.statusMsg.errors).have.property('height');
              should(body.statusMsg.errors).have.property('width');
              done();
            });
        });
        it('valid parameter types, but height/width needs to be less or equal to 500', function (done) {
          loggedInUser
            .post('/games')
            .send(invalidCreateGamesBody2)
            .set('Accept', 'application/json')
            .expect(400)
            .end(function(err, res){
              if (err) return done(err);

              var body = res.body;
              should(body).ok;
              should(body.statusMsg).ok;
              should(body.statusMsg.errors).ok;
              should(body.statusMsg.errors).have.property('height');
              should(body.statusMsg.errors).have.property('width');
              done();
            });
        });

        it('valid parameter types, but numberOfPlayers needs to be 10 or less', function (done) {
          loggedInUser
            .post('/games')
            .send(invalidCreateGamesBody3)
            .set('Accept', 'application/json')
            .expect(400)
            .end(function(err, res){
              if (err) return done(err);

              var body = res.body;
              should(body).ok;
              should(body.statusMsg).ok;
              should(body.statusMsg.errors).ok;
              should(body.statusMsg.errors).have.property('numberOfPlayers');
              done();
            });
        });
        it('valid parameter types, but numberOfPlayers needs to be 2 or greater', function (done) {
          loggedInUser
            .post('/games')
            .send(invalidCreateGamesBody4)
            .set('Accept', 'application/json')
            .expect(400)
            .end(function(err, res){
              if (err) return done(err);

              var body = res.body;
              should(body).ok;
              should(body.statusMsg).ok;
              should(body.statusMsg.errors).ok;
              should(body.statusMsg.errors).have.property('numberOfPlayers');
              done();
            });
        });
      });
    });
  });
});

