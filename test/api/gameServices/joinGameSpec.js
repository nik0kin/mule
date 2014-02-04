/**
 * joinGameSpec.js
 *   @nikpoklitar
 */

var should = require('should');

require('../../../server.js');

var params = require('./joinGameParams'),
  dbHelper = require('../../dbHelper'),
  restHelper = require('../restHelper'),
  testHelper = require('../../helper'),
  loginHelper = require('../loginHelper')('http://localhost:3130'),
  gameHelper = require('../gameHelper');

describe('API: ', function () {
  describe('Game Services: ', function () {
    var gameCreatorUserAgent;
    var createdGameID;

    var ourUserAgent;

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('Join Game: ', function () {
      before(function (done) {
        //create both users
        loginHelper.registerAndLoginQ({username: 'gameCreator89', password : 'OWWOWOWOAKDAS9'})
          .done(function (user1) {
            gameCreatorUserAgent = user1;

            loginHelper.registerAndLoginQ({username: 'NIKOLAS', password : 'poklitar'})
              .done(function (user) {
                ourUserAgent = user;
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done))
      });

      beforeEach(function (done) {
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent, gameConfig : params.validGameConfig})
          .done(function (result) {
            createdGameID = result.gameID;
            should(createdGameID).ok;
            done();
          }, testHelper.mochaError(done));
      });

      it('should return json' , function (done) {
        restHelper.expectJson(done, ourUserAgent, '/games/' + createdGameID + '/join', {});
      });

      it('basic should work' , function () {

      });


      describe('reject if' , function () {
        it('should reject an invalid gameID' , function () {

        });
        it('should reject if you are in the game' , function () {

        });
        it('should reject if its full' , function () {

        });
        it('should reject if its not a joinable game (inProgress or finished)' , function () {

        });
      });

    });

  });
});