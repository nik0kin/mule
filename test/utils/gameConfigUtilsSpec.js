/**
 * gameConfigUtilsSpec.js
 *
 * Created by niko on 1/26/14.
 */

var should = require('should');

var help = require('./helper'),
  gameConfigUtils = require('../../app/utils/gameConfigUtils');

describe('Utils', function() {
  describe('gameConfigUtils: ', function() {
    describe('validate():', function() {
      var validGameConfig = {
        "name": "SILYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
        "numberOfPlayers": 6333,
        "width": 01,
        "height": 313,
        "fog": true,
        "turnStyle": "realtime"
      };
      var validGameConfig2 = {
        "name": "fun game 3v3",
        "numberOfPlayers": 6,
        "width": 40,
        "height": '40',
        "fog": 'false',
        "turnStyle": "realtime"
      };
      var invalidGameConfig = {
        "name": "fun game 3v3",
        "numberOfPlayers": 6,
        "fog": false,
        "turnStyle": "realtime"
      };
      var invalidGameConfig2 = {
        "name": "SILYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
        "numberOfPlayers": "notanumber",
        "width": 01,
        "height": 313,
        "fog": "notabloolean",
        "turnStyle": "realtime"
      };

      it('should accept a basic gameConfig', function(done) {
        gameConfigUtils.promiseToValidate(validGameConfig)
          .done(function(value) {
            should(value).have.property("height", 313);
            should(value).have.property("fog", 'true');
            done();
          }, help.shouldGoHereCallback(done));
      });
      it('should accept a gameConfig with some non-string values as strings', function(done) {
        gameConfigUtils.promiseToValidate(validGameConfig2)
          .done(function(value) {
            should(value).have.property("height", 40);
            should(value).have.property("fog", 'false');
            done();
          }, help.shouldGoHereCallback(done));
      });
      it('should reject a string gameConfig', function(done) {
        gameConfigUtils.promiseToValidate('dong')
          .done(help.shouldntGoHereCallback(done), help.shouldGoHereCallback(done));
      });
      it('should reject a gameConfig missing 2 parameters', function(done) {
        gameConfigUtils.promiseToValidate(invalidGameConfig)
          .done(help.shouldntGoHereCallback(done), help.shouldGoHereCallback(done));
      });
      it('should reject a gameConfig with correct keys, but incorrect types', function(done) {
        gameConfigUtils.promiseToValidate(invalidGameConfig2)
          .done(help.shouldntGoHereCallback(done), help.shouldGoHereCallback(done));
      });
    });
  });
})
