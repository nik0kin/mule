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
    dateUtils = require(__dirname + '/app/utils/dateUtils');

/**
 * Configs
 */

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    mongoose = require('mongoose');

//Winston Config
winston.add(winston.transports.File, { filename: 'logs/mule' + dateUtils.getNiceDate()  + '.log' });
winston.remove(winston.transports.Console);

//Bootstrap db connection
mongoose.connect(config.db);

var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

// bootstrap passport config
require('./config/passport')(passport, config);

app = express();
// express settings
require('./config/express')(app, config, passport);

// Bootstrap routes
require('./config/routes')(app, passport);

//Start the app by listening on <port>
var port = process.env.PORT || 3130;
app.listen(port);
console.log('The Mule has started his journey ('+port+')');

//expose app
exports = module.exports = app;
