/**
 * test/api/gameHelper
 *
 * Created by niko on 2/3/14.
 */

var Q = require('q');

exports.createGameQ = function (params, expectedStatusCode) {
  var agent = params.agent;
  var gameConfig = params.gameConfig;
  var expectedStatusCode = params.expectedStatusCode || expectedStatusCode; //TODO refactor second function param out

  return Q.promise(function (resolve, reject) {
    agent.post('/games').send({"gameConfig" : gameConfig}).expect(expectedStatusCode || 200).end(function(err, res){
      if (err)
        reject(err);
      else
        resolve(res.body);
    });
  });
};

exports.readGameQ = function (params) {
  var agent = params.agent;
  var gameID = params.gameID;

  return Q.promise(function (resolve, reject) {
    agent.get('/games/' + gameID).send({}).expect(200).end(function(err, res){
      if (err)
        reject(err);
      else
        resolve(res.body);
    });
  });
};

exports.joinGameQ = function (params) {
  var agent = params.agent;
  var gameID = params.gameID;       //TODO i think we can refactor out params.fail
  var expectedStatusCode = params.expectedStatusCode ? params.expectedStatusCode : (params.fail ? 400 : 200);

  return Q.promise(function (resolve, reject) {
    var request = agent.post('/games/' + gameID + '/join').send({});

    request.expect(expectedStatusCode);

    request.end(function(err, res){
      if (err)
        reject(err);
      else
        resolve(res.body);
    });
  });
};

///////////////////////////////////////////////////////////

exports.readUsersGamesQ = function (params) {
  var agent = params.agent;
  var userID = params.userID;
  var expectedStatusCode = params.expectedStatusCode || 200;

  return Q.promise(function (resolve, reject) {
    var request = agent.get('/users/' + userID + '/games').send({});

    request.expect(expectedStatusCode);

    request.end(function(err, res){
      if (err)
        reject(err);
      else
        resolve(res.body);
    });
  });
};