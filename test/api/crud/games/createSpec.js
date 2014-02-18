/**
 * utilsSpec.js
 *
 * Created by niko on 1/25/14.
 *
 * http://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
 */
require ('../../../../server.js');

var _ = require('underscore'),
  should = require('should'),
  Q = require('q');

var loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:3130'),
  dbHelper = require('mule-models/test/dbHelper'),
  User = require('mule-models').User,
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  testParams = require('./createParams'),
  gameAPIHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var loggedInAgent;

describe('API', function () {
  describe('Games: ', function () {
    before(function (done) {
      loginHelper.registerAndLoginQ()
        .then(function (agent) {
          loggedInAgent = agent;
          done();
        }, testHelper.mochaError(done));
    });

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    var validCreateGamesBody = testParams.validCreateGamesBody;
    var expectedCreatedGameBody = testParams.expectedCreatedGameBody;

    var validCreateGamesBodyWithAlteredGameStatus = testParams.validCreateGamesBodyWithAlteredGameStatus;

    describe('POST /games', function () {
      it('reject missing gameConfig', function (done) {
        loggedInAgent //"http://localhost:3130")
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
        loggedInAgent //"http://localhost:3130")
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
        loggedInAgent
          .post('/games')
          .send(validCreateGamesBody)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);

            var gameID = res.body.gameID;
            should(gameID).ok;
            //now check if we can GET it
            loggedInAgent
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

                should(body.ruleBundleGameSettings.customBoardSettings.size).eql(8);

                should(_.size(body.players)).eql(1);
                done();
              });
          });
      });

      it('take a correct gameConfig WITH a invalid gameStatus value, the system should ignore it, and set gameStatus to \'open\'', function (done) {
        loggedInAgent
          .post('/games')
          .send(validCreateGamesBodyWithAlteredGameStatus)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);

            var gameID = res.body.gameID;
            should(gameID).ok;
            loggedInAgent
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

      it('should accept a maxPlayer value thats within vikings range', function (done) {
        loggedInAgent
          .post('/games')
          .send(testParams.validVikingGameConfigBody)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            done();
          });
      });

      it('should ignore (extra, non-rulebundle) customBoardSettings, backgammon with a width parameter', function (done) {
        gameAPIHelper.createGameQ({agent : loggedInAgent, gameConfig : testParams.validBackgammonWithExtras}, 200)
          .done(function (result) {
            gameAPIHelper.readGameQ({gameID: result.gameID, agent: loggedInAgent})
              .done(function (gameResult) {
                should(gameResult.ruleBundleGameSettings).not.ok;
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      describe('reject an incorrect gameConfig: ', function () {

        it('no gameConfig in body', function (done) {
          gameAPIHelper.createGameQ({agent : loggedInAgent, gameConfig : {}}, 406)
            .done(function (result) {
              done();
            }, testHelper.mochaError(done));
        });

        //not checking values when making the model
        it('if it has zeros for all the numbers', function (done) {
          gameAPIHelper.createGameQ({agent : loggedInAgent, gameConfig : testParams.invalidZerosGameConfig}, 406)
            .done(function (result) {
              done();
            }, testHelper.mochaError(done));
        });

        it('if sending an incorrect size (13) for a checkers gameConfig', function (done) {
          gameAPIHelper.createGameQ({agent : loggedInAgent, gameConfig : testParams.invalidCheckersGameConfig}, 406)
            .done(function (result) {
              should(result.statusMsg).have.property('size');
              done();
            }, testHelper.mochaError(done));
        });

        it('if sending not including width and height for a vikings gameConfig', function (done) {
          gameAPIHelper.createGameQ({agent : loggedInAgent, gameConfig : testParams.invalidVikingsGameConfig}, 406)
            .done(function (result) {
              should(result.statusMsg).have.property('width');
              should(result.statusMsg).have.property('height');
              done();
            }, testHelper.mochaError(done));
        });
      });
    });
  });
});

