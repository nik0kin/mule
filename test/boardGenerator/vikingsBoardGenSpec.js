
var should = require('should');

var vikingBoardGenerator = require('../../app/boardGenerator');


describe('BoardGenerator', function () {
  describe('vikings', function () {
    it('should work', function (done) {
      vikingBoardGenerator.generateVikingsBoardQ({width: 20, height: 20})
        .done(function (result) {
          //console.log(result);
          done();
        });

    });
  })
});