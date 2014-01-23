/**
 * controllers/games/index.js
 *
 * Created by niko on 1/21/14.
 */

var _ = require('underscore'),
  mongoose = require('mongoose'),
  winston = require('winston');

var gameHelper = require('./helper');

exports.index = function(req, res){
  res.status(200).send("index");
};

exports.create = function(req, res){
  res.status(200).send("create");
};

exports.read = function(req, res){
  res.status(200).send("read");
};

exports.update = function(req, res){
  res.status(200).send("update");
};

exports.destroy = function(req, res){
  res.status(200).send("destroy");
};