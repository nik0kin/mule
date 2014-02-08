/**
 * Test->API->userServices-> loginSpec.js
 *
 * Created by niko on 2/5/14.
 */

var app = require('../../../server');

var should = require('should'),
  request = require('supertest');

var testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  dbHelper = require('mule-models/test/dbHelper'),
  loginHelper = require('mule-utils/lib/testUtils/api/loginHelper')('http://localhost:3130');

describe('API: ', function () {
  describe('User Services: ', function () {
    describe('POST /LoginAuth: ', function () {
      var validAccountCredentials = {username: 'validuser', password : 'validpw'};

      var ourUserID;

      before(function (done) {
        //make one valid user
        loginHelper.registerAndLoginQ(validAccountCredentials)
          .done(function (agent) {
            ourUserID = agent.userID;
            done();
          }, testHelper.mochaError(done));
      });

      after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

      it('should work with a valid registered username/password', function (done) {
        request(app)
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
        request(app)
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
        request(app)
          .post('/LoginAuth')
          .send({password : 'validpw'})
          .set('Accept', 'application/json')
          .expect(401)
          .end(function(err, res){
            if (err) return done(err);
            done();
          });
      });

      it('shouldn\'t work with no password submitted', function (done) {
        request(app)
          .post('/LoginAuth')
          .send({username : 'validuser'})
          .set('Accept', 'application/json')
          .expect(401)
          .end(function(err, res){
            if (err) return done(err);
            done();
          });
      });

      it('should return the users ID on success', function (done) {
        request(app)
          .post('/LoginAuth')
          .send(validAccountCredentials)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            should(res.body.status).eql(0);
            should(res.body.userID).ok;
            should(res.body.userID).eql(ourUserID);
            done();
          });
      });
    });
  });
});
