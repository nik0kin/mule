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
    _ = require('lodash'),
    passport = require('passport'),
    winston = require('winston'),
    mkdirp = require('mkdirp'),
    dateUtils = require('mule-utils/dateUtils');

var MuleUtils = require('mule-utils'),
  MuleRules = require('mule-rules'),
  MuleModels = require('mule-models');

var turnTimerSystem = require('./app/turnSystem/turnTimer'),
  autoCreateGameSystem = require('./app/autoCreateGame');

/**
 * Configs
 */

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    muleConfig = require('./config/muleConfig');

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
var router  = express.Router();
require('./app/routes')(router, passport);
app.use(config.routesPrefix, router);

// Load RuleBundles
var ruleBundleHelper = require('./app/routes/ruleBundles/crud/helper'); // BUT DUMB
require('mule-rules/lib/initRuleBundles').loadOnce(ruleBundleHelper, _.keys(muleConfig.ruleBundles), function () {
  // this calls back whether rulebundles are created or not
  autoCreateGameSystem.initAutoGameChecks(muleConfig.minimumAutoCreateGameTimerCheck);
});
turnTimerSystem.initTurnTimerChecks(muleConfig.minimumGameRoundTimerCheck);

//Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
console.log('The Mule has started his journey ('+port+')');

// dumb hack to avoid mongodb session-collection race condition for first rest call
/*setTimeout(function () {
  require('request')('localhost:' + port + '/' + config.routesPrefix + '/alive', function (error, response, body) {
    console.log('PINGED');
  });
}, 500);*/
var i, x=10000;
for(i=0;i<x;i++);


//expose app
exports = module.exports = app;
