/**
 * GameBoard: otherCrudSpec
 */

require ('../../../../server.js');

var should = require('should'),
  _ = require('underscore');

var loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:3130'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  testParams = require('../games/createParams'),
  dbHelper = require('mule-models/test/dbHelper'),
  gameAPIHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var loggedInAgent;

describe('API: ', function () {
  describe('Games ', function () {
    before(function (done) {
      loginHelper.registerAndLoginQ()
        .then(function (agent) {
          loggedInAgent = agent;
          done();
        }, testHelper.mochaError(done));
    });

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('GET /gameboards', function () {
      it('should return an array', function (done) {
        gameAPIHelper.createGameQ({agent : loggedInAgent, gameConfig : testParams.validCheckersGameConfig}, 200)
          .done(function (result) {
            loggedInAgent
              .get('/gameboards')
              .send({})
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res){
                if (err) return done(err);
                should(res.body).be.an.Array;
                done();
              });

          }, testHelper.mochaError(done));
      });
    });
  });
});