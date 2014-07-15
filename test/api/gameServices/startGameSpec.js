
var should = require('should'),
  _ = require('lodash');

require('../../../server.js');

var dbHelper = require('mule-models/test/dbHelper'),
  restHelper = require('mule-utils/lib/testUtils/api/restHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:3130'),
  gameHelper = require('mule-utils/lib/testUtils/api/gameHelper'),
  createGameParams = require('./startGameParams');

describe('API: ', function () {
  describe('Game Services: ', function () {
    var gameCreatorUserAgent;
    var createdGameID;



    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('Create MuleSprawl Game: ', function () {
      before(function (done) {
        //one both users
        loginHelper.registerAndLoginQ({username: 'gameCreator89', password : 'OWWOWOWOAKDAS9'})
          .done(function (user1) {
            gameCreatorUserAgent = user1;
            done();
          }, testHelper.mochaError(done))
      });

      it('basic should work',function (done) {
        this.timeout(10000);
        //create the game with the first user
        gameHelper.createGameQ({agent: gameCreatorUserAgent, gameConfig : createGameParams})
          .done(function (result) {
            createdGameID = result.gameID;
            should(createdGameID).ok;
            done();
          }, testHelper.mochaError(done));
      });
    });
  });
});