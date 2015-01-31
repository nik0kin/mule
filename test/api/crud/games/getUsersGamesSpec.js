/**
 * Test->API->CRUD-> getUsersGamesSpec.js
 *
 */

var initTestMule = require('../../../configUtils').initTestMule;

var _ = require('lodash'),
  should = require('should'),
  Q = require('q');

var loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  dbHelper = require('mule-models/test/dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  restHelper = require('mule-utils/lib/testUtils/api/restHelper'),
  gameAPIHelper = require('mule-utils/lib/testUtils/api/gameHelper'),
  validParams = require('../../../validParams/index'),
  gameUtils = require('mule-utils/generalGameUtils');

describe('API: ', function () {
  before(initTestMule);
  describe('Games: ', function () {
    describe('GET /users/:id/games : ', function () {
      var ourUserAgent;
      var ourUserId;

      var ourOtherUserAgent;

      beforeEach(function (done) {
        this.timeout(3000);
        loginHelper.registerAndLoginQ()
          .then(function (agent) {
            ourUserAgent = agent;
            ourUserId = agent.userId;
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
          endpoint : '/users/' + ourUserId + '/games'});
      });

      it('should return an array', function (done) {
        ourUserAgent
          .get('/users/' + ourUserId + '/games')
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
            should(resultBody.gameId).ok
            var ourGameId = resultBody.gameId;

            gameAPIHelper.readUsersGamesQ({agent : ourUserAgent, userId : ourUserId, expectedStatusCode : 200})
              .done(function (resultBody2) {
                //check if its the same id
                should(resultBody2[0]).ok;
                var resultGame = resultBody2[0];
                should(resultGame._id).eql(ourGameId);

                //and that the player is in it
                should(gameUtils.doesGameContainPlayerId(ourUserId, resultBody2[0])).ok;

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
            should(resultBody.gameId).ok
            var ourGameId = resultBody.gameId;

            gameAPIHelper.createGameQ({agent: ourOtherUserAgent, gameConfig : randomGameConfig2, expectedStatusCode : 200})
              .done(function (resultBody) {
                should(resultBody).ok;
                should(resultBody.gameId).ok;

                gameAPIHelper.readUsersGamesQ({agent : ourUserAgent, userId : ourUserId, expectedStatusCode : 200})
                  .done(function (resultBody2) {
                    //check if its the same id
                    should(resultBody2[0]).ok;
                    var resultGame = resultBody2[0];
                    should(resultGame._id).eql(ourGameId);

                    should(resultBody2[1]).not.ok;

                    //and that the player is in it
                    should(gameUtils.doesGameContainPlayerId(ourUserId, resultBody2[0])).ok;

                    done();
                  }, testHelper.mochaError(done));
              }, testHelper.mochaError(done));
          },testHelper.mochaError(done));
      });

      it('should return 404 if invalid userId', function (done) {
        gameAPIHelper.readUsersGamesQ({agent : ourUserAgent, userId : "lolaodlasodl1998", expectedStatusCode : 404});
        done();
      });
    });
  });
});
