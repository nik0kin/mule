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
  gameAPIHelper = require('../../gameHelper');

describe('API: ', function () {
  describe('Games: ', function () {
    describe('GET /users/:id/games : ', function () {
      var ourUserAgent;
      var ourUserID;

      before(function (done) {
        loginHelper.registerAndLoginQ()
          .then(function (agent) {
            ourUserAgent = agent;
            done();
          }, testHelper.mochaError(done));
      });

      after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

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
        done();
      });

      it('should return one game if the user is in (1/3) games', function (done) {
        done();
      });

      it('should return three games if the user is in (3/5) games', function (done) {
        done();
      });

      it('should return 404 if invalid userID', function (done) {
        gameAPIHelper.readUsersGamesQ({agent : ourUserAgent, gameID : "lolaodlasodl1998", expectedStatusCode : 404});
        done();
      });
    });
  });
});
