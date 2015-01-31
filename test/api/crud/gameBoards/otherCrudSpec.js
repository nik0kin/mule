/**
 * GameBoard: otherCrudSpec
 */

var initTestMule = require('../../../configUtils').initTestMule;

var should = require('should'),
  _ = require('lodash');

var loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  testParams = require('../games/createParams'),
  dbHelper = require('mule-models/test/dbHelper'),
  gameAPIHelper = require('mule-utils/lib/testUtils/api/gameHelper');

var loggedInAgent;

var createdGameId;

describe('API: ', function () {
  before(initTestMule);
  describe('GameBoards ', function () {
    before(function (done) {
      this.timeout(5000)
      loginHelper.registerAndLoginQ()
        .then(function (agent) {
          loggedInAgent = agent;
          gameAPIHelper.createGameQ({agent : loggedInAgent, gameConfig : testParams.validBackgammonGameConfig}, 200)
            .done(function (result) {
              should(result.gameId).is.ok;
              createdGameId = result.gameId;
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
          endpoint: '/games/' + createdGameId,
          expectedStatusCode: 200
        })
          .done(function (result) {
            var gameboardId = result.gameBoard;

            gameAPIHelper.sendRestRequest({
              agent : loggedInAgent,
              verb: 'get',
              endpoint: '/gameBoards/' + gameboardId,
              expectedStatusCode: 200
            })
              .done(function (result) {
                //result.board should be checkerslike
                should(result.boardType).eql('static');
                should(_.size(result.board)).eql(28);
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
          endpoint: '/games/' + createdGameId + '/board',
          expectedStatusCode: 200
        })
          .done(function (result) {
            //result.board should be checkerslike
            should(result.boardType).eql('static');
            should(_.size(result.board)).eql(28);
            done();
          }, testHelper.mochaError(done));
      })
    });
  });
});
