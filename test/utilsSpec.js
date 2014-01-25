/**
 * utilsSpec.js
 *
 * Created by niko on 1/21/14.
 */

var should = require("should");

var utils = require("../app/utils");




describe("utils", function(){
  var shouldThrowHereCallback = function(done) {
    return function(err){
      done();
    };
  };

  var shouldntThrowHereCallback = function(err){
    throw "this shouldn't throw here: " + err;
  };

  describe("validateJSONBody", function() {
    it("basic should work", function() {
      var object = utils.validateJSONBody({"key" : "value" });

      object.key.should.equal("value");
    });

    it("should have basic 'requiredparams' ", function() {
      var object = utils.validateJSONBody({"key" : "value" }, {key: true}, function(missingKey){
        throw "this shouldn't throw here";
      } );

      object["key"].should.equal("value");
    });

    it("should call missingParamCallback when appropriate", function(done) {
      var object = utils.validateJSONBody({"key" : "value" }, {missingkey: true}, function(missingKey){
        missingKey.should.equal("missingkey");
        done();
      });
    });

    it("should work with more data", function() {
      var object = utils.validateJSONBody({"username" : "testuser","password" : "testpass"});

      object.username.should.equal("testuser");
      object.password.should.equal("testpass");
    });
    describe("required attribute:", function() {

    });

    describe("validate types per parameter", function(){
      describe("Boolean: ", function(){
        var requiredParams = {
          booleankey: {
            required: true,
            type: "Boolean"
          }
        };

        it("'true' works" , function(done) {
          var jsonBody = {"booleankey" : true };
          var object = utils.validateJSONBody(jsonBody, requiredParams, shouldntThrowHereCallback);
          done();
        });
        it("'false' works" , function(done) {
          var jsonBody = {"booleankey" : "false" };
          var object = utils.validateJSONBody(jsonBody, requiredParams, shouldntThrowHereCallback);
          done();
        });
        it("reject a string" , function(done) {
          var jsonBody = {"booleankey" : "badvaluelol" };
          var object = utils.validateJSONBody(jsonBody, requiredParams, shouldThrowHereCallback(done));
        });
      });

      describe("Number:" , function() {
        var requiredParams = {
          numberkey: {
            required: true,
            type: "number"
          }
        };

        it("integers work" , function(done) {
          var output = utils.validateJSONBody({"numberkey" : 1 }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('numberkey', 1);

          output = utils.validateJSONBody({"numberkey" : "1000000000000" }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('numberkey', 1000000000000);

          var output = utils.validateJSONBody({"numberkey" : -1 }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('numberkey', -1);

          var output = utils.validateJSONBody({"numberkey" : 0 }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('numberkey', 0);

          done();
        });
        it("decimals work" , function(done) {
          var output = utils.validateJSONBody({"numberkey" : 1.1 }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('numberkey', 1.1);

          output = utils.validateJSONBody({"numberkey" : "1000000000000.1" }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('numberkey', 1000000000000.1);

          var output = utils.validateJSONBody({"numberkey" : -1.1 }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('numberkey', -1.1);

          var output = utils.validateJSONBody({"numberkey" : 0.0 }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('numberkey', 0.0);

          done();
        });
        it("reject a string" , function(done) {
          var jsonBody = {"numberkey" : "badvaluelol" };
          var object = utils.validateJSONBody(jsonBody, requiredParams, shouldThrowHereCallback(done));
        });
      });
      describe("String:" , function() {
        var requiredParams = {
          stringkey: {
            required: true,
            type: "String"
          }
        };

        it("anything thats a string works?" , function(done) {
          var output = utils.validateJSONBody({"stringkey" : "apple" }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('stringkey', "apple");

          output = utils.validateJSONBody({"stringkey" : "1000000000000" }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('stringkey', "1000000000000");

          var output = utils.validateJSONBody({"stringkey" : "" }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('stringkey', "");

          var output = utils.validateJSONBody({"stringkey" : "/oaldoasd?Adadkloakdadad/ aae 23 534534 65 asda dz d" }, requiredParams, shouldntThrowHereCallback);
          should(output).have.property('stringkey', "/oaldoasd?Adadkloakdadad/ aae 23 534534 65 asda dz d");

          done();
        });
        describe("reject: ", function() {
          it("integers", function(done){
            var jsonBody = {"stringkey" : 12 };
            var object = utils.validateJSONBody(jsonBody, requiredParams, shouldThrowHereCallback(done));
          });
          it("decimals", function(done){
            var jsonBody = {"stringkey" : 1.3 };
            var object = utils.validateJSONBody(jsonBody, requiredParams, shouldThrowHereCallback(done));
          });
          it("objects", function(done){
            var jsonBody = {"stringkey" : {"farting": "wow"} };
            var object = utils.validateJSONBody(jsonBody, requiredParams, shouldThrowHereCallback(done));
          });
          it("arrays", function(done){
            var jsonBody = {"stringkey" : ["nonya"] };
            var object = utils.validateJSONBody(jsonBody, requiredParams, shouldThrowHereCallback(done));
          });
        });
      });
    });
  });
});
