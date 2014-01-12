/*jshint expr: true*/
var app = require('../../learn/promises_without.js');
var should = require('should');
console.log('hello');

describe('Promises-Learn Functions:', function(){
  describe('serveHellos:', function(){
    it('should load', function(){
      app.serveHellos.should.be.ok;
    });
    it('should call a callback with the responseString', function(){
      app.serveHellos(function(err,responseString){
        should(err).not.be.ok;
        responseString.should.be.ok; 
      });
    });
  });
});
