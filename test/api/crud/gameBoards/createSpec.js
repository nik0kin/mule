/**
 * GameBoard: createSpec
 */

require ('../../../../server.js');

var should = require('should'),
  _ = require('underscore');

var loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:3130'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  dbHelper = require('mule-models/test/dbHelper');

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


    describe('create Game -> creates GameBoard ', function () {
      it('boardType: built, should ..', function () {

      });

      it('boardType: static, should ..', function () {

      });
    });
  });
});