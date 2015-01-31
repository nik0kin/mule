/*jshint expr: true*/
//just some silly smoke tests

var request = require('supertest'),
  should = require('should');

var initTestMule = require('./configUtils').initTestMule;

describe('App', function(){
  var url = 'http://localhost:8011';

  before(initTestMule);

  describe('Smoke Tests:', function(){
    it('express should be serving', function(done){
       request(url)
            .get('/alive')
            .expect(200)
            .end(function(err, res) {
               if (err) {
                  throw err;
               }
               should(JSON.parse(res.text).msg).eql('yee');
               done();
            });
    });
  });
});
