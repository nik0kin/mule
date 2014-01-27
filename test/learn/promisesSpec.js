/**
 * Created by niko on 1/26/14.
 */

var plearn = require("../../learn/promises");

describe('jsonUtilsHelpers:', function() {
  it('should work', function(done) {
    plearn.promiseMeChicken(true)
      .done(function(value) {
        done();
      }, function(err) {
        throw "incorect";
      });
  });
  it('shouldnt work', function(done) {
    plearn.promiseMeChicken()
      .done(function(value) {
        throw "incorect";
      }, function(err) {
        done();
      });
  });
});