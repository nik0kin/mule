/**
 * models/Game/instanceMethodsHelper.js
 *
 * Created by niko on 1/28/14.
 */

var Q = require('q');

//resolves playerPosition (relative to game)
exports.joinGameQ = function (playerID) {
  return Q.promise(function (resolve, reject) {
    console.log('HELLO')
    console.log(playerID);
    resolve();
  });
};
