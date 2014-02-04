/**
 * test/api/gameHelper
 *
 * Created by niko on 2/3/14.
 */

var Q = require('q');

exports.createGameQ = function (params) {
  var agent = params.agent;
  var gameConfig = params.gameConfig;

  return Q.promise(function (resolve, reject) {
    agent.post('/games').send({"gameConfig" : gameConfig}).expect(200).end(function(err, res){
      if (err)
        reject(err);
      else
        resolve(res.body);
    });
  });
};
