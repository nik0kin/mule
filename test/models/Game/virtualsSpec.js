/**
 * Test->Models->Game-> virtualsSpec.js
 *
 */

var should = require('should');

var dbHelper = require('../../dbHelper'),
  validParams = require('../../validParams/gameConfig'),
  testHelper = require('../../helper');
      /*
describe('Models: ', function () {
  describe('Game: ', function () {
    describe('Virtuals: ', function () {
      describe('player.count: ', function () {
        it('should return a number', function (done) {
          dbHelper.addGameQ(validParams.validGameParams)
            .done(function (game) {
              dbHelper.getGameQ(game._id)
                .done(function (gotGame) {
                  should(gotGame).ok;
                  winston.log(gotGame)
                  should(gotGame.players.count).ok;
                  should(gotGame.players.count).be.a.Number;
                }, testHelper.mochaError(done))
            }, testHelper.mochaError(done))
        })
      });
    });
  });
});
        */