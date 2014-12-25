/**
 * test/api/crud/userSpec.js
 *
 */

require('../../../server.js');

var should = require('should'),
  request = require('supertest');

var User = require('mule-models').User,
  dbHelper = require('mule-models/test/dbHelper');

describe('API', function () {
  describe('Users: ', function() {
    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    var dumbAccount = {username: "fart", password: "piss"};
    var dumbAccount2 = {username: "beerman", password: "pissalot"};

    describe('POST /users', function(){
      it('respond with json', function(done){
        request(app) //"http://localhost:3130")
          .post('/users')
          .send(dumbAccount)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            done()
          });
      });
      it('should respond with status===0 when all goes well', function(done){
        request(app)
          .post('/users')
          .send(dumbAccount2)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            should(0).eql(res.body.status);
            done()
          });
      });
      it('should respond with _id of created user', function(done){
        request(app)
          .post('/users')
          .send(dumbAccount2)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            should(res.body.userId).ok;
            done()
          });
      });
    });
    describe('GET /users', function () {
      it('should respond with an array', function (done) {
        request(app)
          .get('/users')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            should(res.body).be.instanceOf(Array);
            done()
          });
      });
    });
    describe('GET /users/:id', function () {
      it('should respond with an object containing username and _id', function (done) {
        request(app) //create a user to look for
          .post('/users')
          .send(dumbAccount2)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            should(res.body.userId).ok;
            var userId = res.body.userId;

            //look for the user
            request(app)
              .get('/users/' + userId)
              .expect(200)
              .end(function(err, res){
                if (err) return done(err);
                var user = res.body;
                should(user).ok;
                should(user.username).ok;
                should(user._id).ok;
                should(user).not.have.property('hashed_password');
                should(user).not.have.property('salt');
                done()
              });
          });
      });
      it('should respond a 404 for a invalid userId', function (done) {
        request(app)
          .get('/users/adsfdsdfNOTREAL')
          .expect(404)
          .end(function(err, res){
            if (err) return done(err);
            done()
          });
      });
    });
  });
});

