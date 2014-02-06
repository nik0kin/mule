/**
 * utilsSpec.js
 *
 * Created by niko on 1/25/14.
 *
 * http://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
 */
require ('../../../../server.js');

var mongoose = require('mongoose'),
  _ = require('underscore'),
  should = require('should'),
  Q = require('q');

var loginHelper = require('../../loginHelper')('http://localhost:3130'),
  dbHelper = require('../../../dbHelper'),
  User = require('../../../../app/models/User'),
  Game = require('../../../../app/models/Game/index'),
  testHelper = require('../../../mochaHelper'),
  testParams = require('./createParams'),
  gameAPIHelper = require('../../gameHelper');

var loggedInUser;

describe('API', function () {
  describe('Games: ', function () {
    before(function (done){
      loginHelper.registerAndLoginQ()
        .then(function (user) {
          loggedInUser = user;
          done();
        }, testHelper.mochaError(done));
    });

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    var validCreateGamesBody = testParams.validCreateGamesBody;
    var expectedCreatedGameBody = testParams.expectedCreatedGameBody;

    var validCreateGamesBodyWithAlteredGameStatus = testParams.validCreateGamesBodyWithAlteredGameStatus;

    var invalidCreateGamesBody = testParams.invalidCreateGamesBody;
    var invalidCreateGamesBody2 = testParams.invalidCreateGamesBody2;
    var invalidCreateGamesBody3 = testParams.invalidCreateGamesBody3;
    var invalidCreateGamesBody4 = testParams.invalidCreateGamesBody4;

    describe('POST /games', function () {
      it('reject missing gameConfig', function (done) {
        loggedInUser //"http://localhost:3130")
          .post('/games')
          .send({'fart' : 'dumb'})
          .set('Accept', 'application/json')
          .expect(406)
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

      it('take a correct gameConfig, save to DB, and user should exist in players object ', function (done) {
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
                  should(body[key]).equal(value);
                });

                should(_.size(body.players)).eql(1);
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
            .expect(406)
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
            .expect(406)
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

        it('valid parameter types, but maxPlayers needs to be 10 or less', function (done) {
          loggedInUser
            .post('/games')
            .send(invalidCreateGamesBody3)
            .set('Accept', 'application/json')
            .expect(406)
            .end(function(err, res){
              if (err) return done(err);

              var body = res.body;
              should(body).ok;
              should(body.statusMsg).ok;
              should(body.statusMsg.errors).ok;
              should(body.statusMsg.errors).have.property('maxPlayers');
              done();
            });
        });
        it('valid parameter types, but maxPlayers needs to be 2 or greater', function (done) {
          loggedInUser
            .post('/games')
            .send(invalidCreateGamesBody4)
            .set('Accept', 'application/json')
            .expect(406)
            .end(function(err, res){
              if (err) return done(err);

              var body = res.body;
              should(body).ok;
              should(body.statusMsg).ok;
              should(body.statusMsg.errors).ok;
              should(body.statusMsg.errors).have.property('maxPlayers');
              done();
            });
        });

        it('no gameConfig in body', function (done) {
          gameAPIHelper.createGameQ({agent : loggedInUser, gameConfig : {}}, 406)
            .done(function (result) {
              done();
            }, testHelper.mochaError(done));
        });

        //not checking values when making the model
        it('if it has zeros for all the numbers', function (done) {
          gameAPIHelper.createGameQ({agent : loggedInUser, gameConfig : testParams.invalidZerosGameConfig}, 406)
            .done(function (result) {
              done();
            }, testHelper.mochaError(done));
        });
      });
    });
  });
});

