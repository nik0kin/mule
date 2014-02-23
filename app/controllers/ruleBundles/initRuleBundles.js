/**
 * Created by niko on 2/9/14.
 */

var _ = require('underscore'),
  winston = require('winston');

var ruleBundleHelper = require('./crud/helper');

exports.loadOnce = function () {
  ruleBundleHelper.indexQ()
    .done(function (result) {
      if (_.isEqual([], result)) {
        winston.log('Loading RuleBundles')
        ruleBundleHelper.createQ(require('mule-rules').getRuleBundleJSON('checkers'));
        ruleBundleHelper.createQ(require('mule-rules').getRuleBundleJSON('backgammon'));
        ruleBundleHelper.createQ(require('mule-rules').getRuleBundleJSON('vikings'));
      }

    }, function (err) {
      console.log(err);
      throw 'wtf :' + err;
    });
};