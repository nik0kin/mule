/**
 * gameConfigUtilsSpec.js
 *
 * Created by niko on 1/26/14.
 */
var gameConfigUtils = require('../../app/utils/gameConfigUtils');

describe('Utils', function() {
  describe('gameConfigUtils: ', function() {
    describe('validate():', function() {
      it('should work', function(done) {
        gameConfigUtils.validate(15)
          .then(function(value) {
            console.log(value);
            return value + value;
          })
          .then(function(value){
            console.log("w "+value);
            done()
          });
      });
    });
  });
})
