
var should = require('should');

var vikingBoardGenerator = require('mule-rules/bundles/vikings/boardGenerator');


describe('BoardGenerator', function () {
  describe('vikings', function () {
    it('should work', function (done) {
      vikingBoardGenerator({width: 20, height: 20})
        .done(function (result) {
          //console.log(result);
          done();
        });

    });
  })
});