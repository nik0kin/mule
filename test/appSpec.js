/*jshint expr: true*/
//just some silly smoke tests

process.env.NODE_ENV = 'test';

var app = require('../server');

var request = require('supertest'),
  should = require('should');

/**
 *
 */

describe('App', function(){
  var url = 'http://localhost:3130';

  describe('Smoke Tests:', function(){
    it('express should not be null', function(done){
      should(app).be.ok;
      done();
    });
    /*it('site should be served on /public', function(done){
       request(url)
            .get('/public')
            .expect(200)
            .end(function(err, res) {
               if (err) {
                  throw err;
               }
               var text = res.text;

               text.should.include('Login/Register');
               done();
            });
    });*/
  });
});
/*
   after(function(done){
      require('./helper').clearDb(done);//clear out db
  });
*/
