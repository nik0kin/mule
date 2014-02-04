/**
 * test/api/restHelper.js
 *
 * Created by niko on 2/3/14.
 */

var should = require('should');

exports.expectJson = function (done, user, endpoint, body) {
  user
    .post(endpoint)
    .send(body)
    .set('Accept', 'application/json')
    .expect(200)
    .end(function(err, res){
      if (err){
        console.log(res.body)
        return done(err);
      }

      should(res.body).be.an.instanceOf(Object);
      done();
    });
};