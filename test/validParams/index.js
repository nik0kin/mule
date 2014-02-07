/**
 * index
 * - @nikpoklitar
 */
var _ = require('underscore'),
  randomWords = require('random-words');

var gameConfigs = require('./gameConfig');

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