/***************************************
 * ------ Server.js                    *
 *                                     *
 *    the driver for our server        *
 *
 *    based off this example:
 *    https://github.com/madhums/node-express-mongoose-demo
 **************************************/

/**
 * Module dependencies.
 */

var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    winston = require('winston'),
    mkdirp = require('mkdirp'),
    dateUtils = require('mule-utils/dateUtils');

/**
 * Configs
 */

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

//Winston Config
mkdirp('logs', function (err) {
  if (err) console.error(err);

  winston.add(winston.transports.File, { filename: 'logs/mule' + dateUtils.getNiceDate()  + '.log' });
  winston.remove(winston.transports.Console);
});

//Bootstrap connection
require('mule-models');
mongoose = global.getMongoose();

// bootstrap passport config
require('./config/passport')(passport, config);

app = express();
// express settings
require('./config/express')(app, config, passport);

// Bootstrap routes
require('./app/routes')(app, passport);

// Load RuleBundles
require('mule-rules/lib/initRuleBundles').loadOnce(require('./app/routes/ruleBundles/crud/helper'));

//Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
console.log('The Mule has started his journey ('+port+')');

//expose app
exports = module.exports = app;
