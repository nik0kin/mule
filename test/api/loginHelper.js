/**
 * test/api/loginHelper.js
 *
 * Created by niko on 1/28/14.
 */


var request = require('supertest'),
  Q = require('q');

module.exports = function(serverIP){
  var fakeUserCredentials = {username: "nikolas", password: "poklitar"};
  var ourUser = request.agent(serverIP);

  var that = {};
  that.registerAndLoginQ = Q.promise(function (resolve, reject) {
    ourUser.post('/users').send(fakeUserCredentials).expect(200).end(function(err, res){
      if (err)
        reject(err);
      else
        resolve(ourUser);
    });
  });

  return that;
};

