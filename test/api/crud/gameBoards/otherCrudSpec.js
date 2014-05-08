/**
 * GameBoard: otherCrudSpec
 */

require ('../../../../server.js');

var should = require('should'),
  _ = require('lodash');

var loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:3130'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  testParams = require('../games/createParams'),
  dbHelper = require('mule-models/test/dbHelper'),
  gameAPIHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var loggedInAgent;

var createdGameID;

describe('API: ', function () {
  describe('Games ', function () {
    before(function (done) {
      loginHelper.registerAndLoginQ()
        .then(function (agent) {
          loggedInAgent = agent;
          gameAPIHelper.createGameQ({agent : loggedInAgent, gameConfig : testParams.validCheckersGameConfig}, 200)
            .done(function (result) {
              should(result.gameID).is.ok;
              createdGameID = result.gameID;
              done();
            }, testHelper.mochaError(done));
        }, testHelper.mochaError(done));
    });

    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('GET /gameBoards', function () {
      it('should return an array', function (done) {
        loggedInAgent
          .get('/gameBoards')
          .send({})
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            should(res.body).be.an.Array;
            done();
          });
      });
    });

    describe('GET /gameBoards/:id', function () {
      it('should work', function (done) {
        gameAPIHelper.sendRestRequest({
          agent : loggedInAgent,
          verb: 'get',
          endpoint: '/games/' + createdGameID,
          expectedStatusCode: 200
        })
          .done(function (result) {
            var boardID = result.gameBoard;

            gameAPIHelper.sendRestRequest({
              agent : loggedInAgent,
              verb: 'get',
              endpoint: '/gameBoards/' + boardID,
              expectedStatusCode: 200
            })
              .done(function (result) {
                //result.board should be checkerslike
                should(result.boardType).eql('static');
                should(_.size(result.board)).eql(32);
                done();
              }, testHelper.mochaError(done));
          });
      });
    });

    describe('GET /games/:id/board', function () {
      it('should work', function (done) {
        gameAPIHelper.sendRestRequest({
          agent : loggedInAgent,
          verb: 'get',
          endpoint: '/games/' + createdGameID + '/board',
          expectedStatusCode: 200
        })
          .done(function (result) {
            //result.board should be checkerslike
            should(result.boardType).eql('static');
            should(_.size(result.board)).eql(32);
            done();
          }, testHelper.mochaError(done));
      })
    });
  });
});