var _ = require('lodash'),
  Q = require('q');

var logging = require('mule-utils').logging,
  RuleBundle = require('mule-models').RuleBundle.Model,
  Game = require('mule-models').Game.Model,
  createGameQ = require('../routes/games/crud/createGameHelper');

var muleConfig;

var MS_PER_SEC = 1000;

var timeoutId, minTimerCheck;

var initAutoGameChecks = function (_muleConfig) {
  muleConfig = _muleConfig;
  minTimerCheck = muleConfig.minimumAutoCreateGameTimerCheck;

  RuleBundle.findQ()
    .then(function (ruleBundles) {
      // get rulebundle ids
      var ruleBundleIds = {};
      _.each(ruleBundles, function (rb) {
        ruleBundleIds[rb.name.toLowerCase()] = rb._id;
      });

      // attach ruleBundle ids to config settings
      var attachIdToGameConfig = function (gameConfig, rulebundleName) {
        var ruleBundleId = ruleBundleIds[rulebundleName];
        gameConfig.ruleBundle = {id: ruleBundleId};
      };

      _.each(muleConfig.ruleBundles, function (value, key) {
        if (!value.autoCreateGame) return;

        // autoCreateGame can be game settings or an array of game settings
        if (_.isArray(value.autoCreateGame)) {
          _.each(value.autoCreateGame, function (v) {
            attachIdToGameConfig(v, key.toLowerCase());
          });
        } else {
          attachIdToGameConfig(value.autoCreateGame, key.toLowerCase());
        }
      });

      checkForNoOpenGames();
    });

};

exports.initAutoGameChecks = initAutoGameChecks;

var checkForNoOpenGames = function () {
  logging.log('Checking for any Auto Games that need to be created');

  var checkPerGameConfig = function (gameConfig, ruleBundleName) {
    gameConfig = _.clone(gameConfig);
    checkForNoOpenRuleBundleGames(gameConfig, ruleBundleName);
  };
  _.each(muleConfig.ruleBundles, function (value, key) {
    if (!value.autoCreateGame) return;

    if (_.isArray(value.autoCreateGame)) {
      _.each(value.autoCreateGame, function (v) {
        checkPerGameConfig(v, key.toLowerCase());
      });
    } else {
      checkPerGameConfig(value.autoCreateGame, key.toLowerCase());
    }
  });

  timeoutId = setTimeout(checkForNoOpenGames, minTimerCheck * MS_PER_SEC);
};

var checkForNoOpenRuleBundleGames = function (config, rulebundleName) {
  var conditions = {
    'name': config.name,
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
        logging.log('creating new game: ' + rulebundleName);
        createGameQ({validatedParams: config})
          .done(function (result) {
            logging.log('autogame created successfully: gameId=' + result._id);
          }, function (err) {
            logging.err('error creating autogame', null, err);
          });
      }
    });
};
