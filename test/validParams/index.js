/**
 * index
 * - @nikpoklitar
 */
var _ = require('lodash'),
  randomWords = require('random-words');

var gameConfigs = require('./gameConfig');

exports.generateRandomUserCredentials = function () {
  return {
    username : getRandomWordWithLengthEqualOrUnder(10) + _.random(10, 99) ,
    password : getRandomWordWithLengthEqualOrUnder(10)
  };
};


exports.getRandomGameConfig = function () {
  return gameConfigs[_.random(0, _.size(gameConfigs) - 1)];
};

exports.getRandomNamedValidConfig = function (players) {
  var config = _.clone(gameConfigs.validGameConfig);

  config.maxPlayers = players || config.maxPlayers;
  config.name = getRandomWordWithLengthEqualOrUnder(12)  + ' vs ' +  getRandomWordWithLengthEqualOrUnder(12);

  return config;
}

var getRandomWordWithLengthEqualOrUnder = function (number) {
  var s;
  do {
    s = randomWords() + randomWords();
  } while (s.length > number);
  return s;
};