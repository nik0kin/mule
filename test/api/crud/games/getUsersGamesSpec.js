/**
 * Test->API->CRUD-> getUsersGamesSpec.js
 *
 * Created by niko on 2/6/14.
 */

require ('../../../../server.js');

var _ = require('underscore'),
  should = require('should'),
  Q = require('q');

var loginHelper = require('../../loginHelper')('http://localhost:3130'),
  dbHelper = require('../../../dbHelper'),
  testHelper = require('../../../mochaHelper'),
  restHelper = require('../../restHelper'),
  userAPIHelper = require('../../userHelper'),
  gameAPIHelper = require('../../gameHelper'),
  validParams = require('../../../validParams/index'),
  gameUtils = require('mule-utils/generalGameUtils');

describe('API: ', function () {
  describe('Games: ', function () {
    describe('GET /users/:id/games : ', function () {
      var ourUserAgent;
      var ourUserID;

      var ourOtherUserAgent;

      beforeEach(function (done) {
        loginHelper.registerAndLoginQ()
          .then(function (agent) {
            ourUserAgent = agent;
            ourUserID = agent.userID;
            loginHelper.registerAndLoginQ()
              .then(function (agent) {
                ourOtherUserAgent = agent;
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      afterEach(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

      it('should return JSON', function (done) {
        restHelper.expectJson({
          done : done,
          userAgent : ourUserAgent,
          verb : 'GET',
          endpoint : '/users/' + ourUserID + '/games'});
      });

      it('should return an array', function (done) {
        ourUserAgent
          .get('/users/' + ourUserID + '/games')
          .send({})
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err){
              return done(err);
            }
            should(_.isArray(res.body)).ok;
            done();
          });
      });

      it('should return one game if the user is in (1/1) game', function (done) {
        //1 out of 1 total games

        //make a game
        var randomGameConfig = validParams.getRandomNamedValidConfig(2);
        gameAPIHelper.createGameQ({agent: ourUserAgent, gameConfig : randomGameConfig, expectedStatusCode : 200})
          .done(function (resultBody) {
            should(resultBody).ok;
            should(resultBody.gameID).ok
            var ourGameID = resultBody.gameID;

            gameAPIHelper.readUsersGamesQ({agent : ourUserAgent, userID : ourUserID, expectedStatusCode : 200})
              .done(function (resultBody2) {
                //check if its the same id
                should(resultBody2[0]).ok;
                var resultGame = resultBody2[0];
                should(resultGame._id).eql(ourGameID);

                //and that the player is in it
                should(gameUtils.doesGameContainPlayerID(ourUserID, resultBody2[0])).ok;

                done();
              }, testHelper.mochaError(done));
          },testHelper.mochaError(done));
      });

      it('should return one game if the user is in (1/2) games', function (done) {
        //make three games
        var randomGameConfig = validParams.getRandomNamedValidConfig(2);
        var randomGameConfig2 = validParams.getRandomNamedValidConfig(2);
        gameAPIHelper.createGameQ({agent: ourUserAgent, gameConfig : randomGameConfig, expectedStatusCode : 200})
          .done(function (resultBody) {
            should(resultBody).ok;
            should(resultBody.gameID).ok
            var ourGameID = resultBody.gameID;

            gameAPIHelper.createGameQ({agent: ourOtherUserAgent, gameConfig : randomGameConfig2, expectedStatusCode : 200})
              .done(function (resultBody) {
                should(resultBody).ok;
                should(resultBody.gameID).ok;

                gameAPIHelper.readUsersGamesQ({agent : ourUserAgent, userID : ourUserID, expectedStatusCode : 200})
                  .done(function (resultBody2) {
                    //check if its the same id
                    should(resultBody2[0]).ok;
                    var resultGame = resultBody2[0];
                    should(resultGame._id).eql(ourGameID);

                    should(resultBody2[1]).not.ok;

                    //and that the player is in it
                    should(gameUtils.doesGameContainPlayerID(ourUserID, resultBody2[0])).ok;

                    done();
                  }, testHelper.mochaError(done));
              }, testHelper.mochaError(done));
          },testHelper.mochaError(done));
      });

      it('should return 404 if invalid userID', function (done) {
        gameAPIHelper.readUsersGamesQ({agent : ourUserAgent, userID : "lolaodlasodl1998", expectedStatusCode : 404});
        done();
      });
    });
  });
});
