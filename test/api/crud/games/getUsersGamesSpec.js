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
    });
  });
});
