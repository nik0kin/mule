/**
 * Created with IntelliJ IDEA.
 * User: npoklitar
 * Date: 1/30/14
 * Time: 12:28 AM
 * To change this template use File | Settings | File Templates.
 */

var should = require('should')

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