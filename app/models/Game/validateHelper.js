/**
 * app/models/Game/validateHelper.js
 *
 * Created by niko on 1/28/14.
 */
var _ = require('underscore');

var gameStatusUtils = require('../../utils/gameStatusUtils');

exports.addValidators = function (GameSchema) {
  GameSchema.path('width').validate(validateWidthAndHeight, 'width must be within the range: 1 - 500');
  GameSchema.path('height').validate(validateWidthAndHeight, 'height must be within the range: 1 - 500');
  GameSchema.path('gameStatus').validate(gameStatusUtils.validateGameStatus, 'gameStatus must equal one of the following: open, inProgress, or finished');
  GameSchema.path('numberOfPlayers').validate(validateNumberOfPlayers, 'numberOfPlayers must be within the range: 2 - 10');
};

var validateWidthAndHeight = function (number) {
  return _.isNumber(number) && number > 0 && number <= 500;
};

var validateNumberOfPlayers = function (number) {
  return _.isNumber(number) && number >= 2 && number <= 10;
};

