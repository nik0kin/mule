/**
 * utilsSpec.js
 *
 * Created by niko on 1/21/14.
 */

var should = require("should");

var utils = require("../app/utils");




describe("utils", function(){
  describe("validateJSONBody", function(){
    it("basic should work", function(){
      var object = utils.validateJSONBody({"key" : "value" });

      object.key.should.equal("value");
    });

    it("should have basic 'requiredparams' ", function(){
      var object = utils.validateJSONBody({"key" : "value" }, {key: true}, function(missingKey){
        throw "this shouldn't throw here";
      } );

      object.key.should.equal("value");
    });

    it("should call missingParamCallback when appropriate", function(done){
      var object = utils.validateJSONBody({"key" : "value" }, {missingkey: true}, function(missingKey){
        missingKey.should.equal("missingkey");
        done();
      });
    });

    it("should work with more data", function(){
      var object = utils.validateJSONBody({"username" : "testuser","password" : "testpass"});

      object.username.should.equal("testuser");
      object.password.should.equal("testpass");
    });
  });
});
