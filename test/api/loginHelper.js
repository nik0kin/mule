/**
 * test/api/loginHelper.js
 *
 * Created by niko on 1/28/14.
 */


var request = require('supertest'),
  Q = require('q');

module.exports = function(serverIP){
  var fakeUserCredentials = {username: "nikolas", password: "poklitar"};

  var that = {};
  that.registerAndLoginQ = function (credentials) {
    var ourAgent = request.agent(serverIP);
    var loginCredentials = credentials || fakeUserCredentials;

    return Q.promise(function (resolve, reject) {
      ourAgent.post('/users').send(loginCredentials).expect(200).end(function(err, res){
        if (err)
          reject(err);
        else {
          ourAgent.userID = res.body.userID;
          resolve(ourAgent);
        }
      });
    });
  };

  return that;
};

