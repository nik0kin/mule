var _ = require('lodash'),
    path = require('path');

var Logger = require('mule-utils').logging;

/**
 * Express dependencies.
 */

var express = require('express'),
  session = require('express-session'),
  cors = require('cors'),
  MongoStore = require('connect-mongo')(session),
  compression = require('compression'),
  morgan = require('morgan'),
  favicon = require('serve-favicon'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
  pkg = require('../package.json');

module.exports = function (app, config, dbUrl, passport) {

  app.set('showStackError', true);

  app.use(cors());

  // should be placed before express.static
  app.use(compression({
    filter: function (req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    threshold: 9
  }));

  // statically serve folders from user config
  _.each(config.serveStaticFolders, function (pathToFolder, route) {
    var fullRoute = path.join(config.routesPrefix, route);
    Logger.vog('Statically serving ' + pathToFolder + ' at ' + fullRoute);
    app.use(fullRoute, express.static(pathToFolder));
  });

  //statically serve test site
  var publicPath = path.normalize(__dirname + '/..' + '/public');
  app.use(config.routesPrefix + '/public', express.static(publicPath));

  app.use(function(req, res, next) {
    if(req.url === config.routesPrefix)
      res.redirect(config.routesPrefix + '/public');
    else
      next();
  });

  // don't use logger for test env
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(':remote-addr :status :response-time ms :method :url'));
  }

  // expose package.json to views
  app.use(function (req, res, next) {
    res.locals.pkg = pkg;
    next();
  });

  app.use(favicon(__dirname + '/../public/favicon.ico'));

  // cookieParser should be above session
  app.use(cookieParser());

  // bodyParser should be above methodOverride
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  //app.use(express.methodOverride());

  // express/mongo session storage
  app.use(session({
    secret: 'mulejs',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: dbUrl,
      collection : 'sessions'
    })
  }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    // should be declared after session and flash
   // app.use(helpers(pkg.name));
    /*

    // adds CSRF support
    if (process.env.NODE_ENV !== 'test') {
      app.use(express.csrf());

      // This could be moved to view-helpers :-)
      app.use(function(req, res, next){
        res.locals.csrf_token = req.csrfToken();
        next();
      });
    }
     */
    // routes should be at the last
    //app.use(app.router);

    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    /*app.use(function(err, req, res, next){
      // treat as 404
      if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next();
      }

      // log it
      // send emails if you want
      console.error(err.stack);

      // error page
      res.status(500).render('500', { error: err.stack });
    });*/

    // assume 404 since no middleware responded
    /*app.use(function(req, res, next){
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      });
    });*/
  
    /*app.get('*', function (req, res) {
      res.send("<b>mule</b><br>" + req.originalUrl + " : loooooooooool 404");
    });*/
  // development env config
 // app.configure('development', function () {
    app.locals.pretty = true;
 // });
};
