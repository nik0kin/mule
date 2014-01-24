/**
 * utilsSpec.js
 *
 * Created by niko on 1/21/14.
 */

var should = require("should");

var utils = require("../app/utils");




describe("utils", function(){
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
          var object = utils.validateJSONBody(jsonBody, requiredParams, function(err){
            throw "this shouldn't throw here: " + err;
          });
          done();
        });
        it("'false' works" , function(done) {
          var jsonBody = {"booleankey" : "false" };
          var object = utils.validateJSONBody(jsonBody, requiredParams, function(err){
            throw "this shouldn't throw here " + err;
          });
          done();
        });
        it("reject a string" , function(done) {
          var jsonBody = {"booleankey" : "badvaluelol" };
          var object = utils.validateJSONBody(jsonBody, requiredParams, function(err){
            done();
          });
        });
      });

      it("type: Number" , function() {

      });
      it("type: String" , function() {

      });
    });
  });
});
