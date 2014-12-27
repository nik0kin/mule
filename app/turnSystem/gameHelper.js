var Q = require('q'),
  _ = require('lodash');

var startGameQ = require('./startGame').startGameQ,
  History = require('mule-models').History.Model,
  bundleHooks = require('../bundleHooks');

exports.joinGameQ = function (game, player) {
  return game.joinGameQ(player)
    .then(function (savedGame) {
      // if game full, start game
      if (savedGame.full) {
        return startGameQ(savedGame);
      }
      // always return the savedGame
      return savedGame;
    });
};

exports.checkWinConditionQ = function (gso) {
  return bundleHooks.winConditionHookQ(gso)
    .then(function (winner) {
      if (winner) {
        return gso.game.setWinnerAndSaveQ(winner)
          .then(function () {
            return History.setWinnerAndSaveQ(gso.history._id, winner);
          });
      }
    });
};
