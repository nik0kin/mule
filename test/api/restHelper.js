/**
 * test/api/restHelper.js
 *
 * Created by niko on 2/3/14.
 */

var should = require('should');

exports.expectJson = function (params) {
  var done = params.done;
  var userAgent = params.userAgent;
  var endpoint = params.endpoint;
  var body = params.body || {};
  var verb = params.verb;

  var request = userAgent;

  switch (verb.toUpperCase()) {
    case 'POST':
      request = request.post(endpoint);
      break;
    case 'GET':
      request = request.get(endpoint);
      break;
    case 'PUT':
      request = request.put(endpoint);
      break;
    case 'DEL':
      request = request.del(endpoint);
      break;
  };

  request.send(body)
    .set('Accept', 'application/json')
    .expect(200)
    .end(function(err, res){
      if (err){
        console.log(err);
        return done(err);
      }
      should(res.body).be.an.instanceOf(Object);
      done();
    });
};