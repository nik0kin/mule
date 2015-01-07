var _ = require('lodash'),
  Q = require('q');

var muleConfig = require('../../config/muleConfig'),
  logging = require('mule-utils').logging,
  RuleBundle = require('mule-models').RuleBundle.Model,
  Game = require('mule-models').Game.Model,
  createGameQ = require('../routes/games/crud/createGameHelper');

var MS_PER_SEC = 1000;

var timeoutId, minTimerCheck;

exports.initAutoGameChecks = function (minimumTimerCheck) {
  minTimerCheck = minimumTimerCheck;

  // attach ruleBundle ids
  RuleBundle.findQ()
    .then(function (ruleBundles) {
      _.each(muleConfig.ruleBundles, function (value, key) {
        if (!value.autoCreateGame) return;

        //find key in rule bundles
        var ruleBundle = _.find(ruleBundles, function (rb) {
          return rb.name.toLowerCase() === key.toLowerCase();
        });
        value.autoCreateGame.ruleBundle = { id: ruleBundle._id };
      });

      exports.checkForNoOpenGames();
    });

};

exports.checkForNoOpenGames = function () {
  logging.log('Checking for no Open Games');
  _.each(muleConfig.ruleBundles, function (value, key) {
    if (value.autoCreateGame) {
      var gameConfig = _.clone(value.autoCreateGame);
      exports.checkForNoOpenRuleBundleGames(gameConfig, key);
    }
  });

  timeoutId = setTimeout(exports.checkForNoOpenGames, minTimerCheck * MS_PER_SEC);
};

exports.checkForNoOpenRuleBundleGames = function (config, rulebundleName) {
  var conditions = {
    'gameStatus': {
      $regex: 'open'
    }
  };

  Game.findQ(conditions)
    .then(function (results) {
      //filter by config.ruleBundle.id
      results = _.filter(results, function (resultGame) {
        return _.isEqual(resultGame.ruleBundle.id + '', config.ruleBundle.id + '');
      });

      if (results && results.length === 0) {
        // create new game
        logging.log('creating new game: ' + rulebundleName + '[' + config.id + ']');
        createGameQ({validatedParams: config})
          .done(function (result) {
            logging.log('autogame created successfully: gameId=' + result._id);
          }, function (err) {
            logging.err('error creating autogame', null, err);
          });
      }
    });
};
