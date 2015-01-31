/**
 * Test->API->userServices-> loginSpec.js
 *
 */

var initTestMule = require('../../configUtils').initTestMule;

var muleServer = 'http://localhost:8011/';

var should = require('should'),
  request = require('supertest');

var testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  dbHelper = require('mule-models/test/dbHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:8011');

describe('API: ', function () {
  before(initTestMule);
  describe('User Services: ', function () {
    describe('POST /LoginAuth: ', function () {
      var validAccountCredentials = {username: 'validuser', password : 'validpw'};

      var ourUserId;

      before(function (done) {
        //make one valid user
        loginHelper.registerAndLoginQ(validAccountCredentials)
          .done(function (agent) {
            ourUserId = agent.userId;
            done();
          }, testHelper.mochaError(done));
      });

      after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

      it('should work with a valid registered username/password', function (done) {
        request(muleServer)
          .post('/LoginAuth')
          .send(validAccountCredentials)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            should(res.body.status).eql(0);
            done();
          });
      });

      it('shouldn\'t work with an invalid username/password', function (done) {
        request(muleServer)
          .post('/LoginAuth')
          .send({username : 'amadeupname', password : 'afakepassword'})
          .set('Accept', 'application/json')
          .expect(401)
          .end(function(err, res){
            if (err) return done(err);
            done();
          });
      });

      it('shouldn\'t work with no username submitted', function (done) {
        request(muleServer)
          .post('/LoginAuth')
          .send({password : 'validpw'})
          .set('Accept', 'application/json')
          .expect(400)
          .end(function(err, res){
            if (err) return done(err);
            done();
          });
      });

      it('shouldn\'t work with no password submitted', function (done) {
        request(muleServer)
          .post('/LoginAuth')
          .send({username : 'validuser'})
          .set('Accept', 'application/json')
          .expect(400)
          .end(function(err, res){
            if (err) return done(err);
            done();
          });
      });

      it('should return the users ID on success', function (done) {
        request(muleServer)
          .post('/LoginAuth')
          .send(validAccountCredentials)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            should(res.body.status).eql(0);
            should(res.body.userId).ok;
            should(res.body.userId).eql(ourUserId);
            done();
          });
      });
    });
  });
});
