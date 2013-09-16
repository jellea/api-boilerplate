'use strict'

var express = require('express')
  , _ = require('underscore')
  , myOAP = require('./oauth').myOAP
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , file = require('file')
  , MemoryStore = express.session.MemoryStore

var app = express()

// all environments
app.set('port', process.env.PORT || 3000)
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(express.cookieParser())
app.use(express.session({store: new MemoryStore({reapInterval: 5 * 60 * 1000}), secret: 'abracadabra'}))
app.use(myOAP.oauth())
app.use(myOAP.login())
app.use(app.router)
//app.use(express.static(path.join(__dirname, 'public')))

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler())
}

// automagicly add routes to express
var routes_path = __dirname + '/routes'

var execFile = require('child_process').execFile;
execFile('find', [ routes_path ], function(err, stdout, stderr) {
  var file_list = stdout.split('\n');

  _.each(file_list, function (file) {
    if(file.substr(file.length - 3) === ".js"){
      // read the routes of the files
      var routes = require(file).routes || {}

      // make basepath for endpoints
      var baseuri = file.
          replace(routes_path, ""). // make filepath relative to folder
          replace(/(\w+.js$)/, "")  // strip off file

      _.each(routes, function (route, endpointname) {
        var endpoint = baseuri+endpointname

        _.each(route, function (val, httpmethod) {

          // add routes to express
          app[httpmethod](endpoint, val.action)

          // add routes to documentation
        });
      })
    }
  })

  console.log(app.routes);
});



app.get('/secret', function(req, res, next) {
  if(req.session.user) {
    res.end('proceed to secret lair, extra data: ' + JSON.stringify(req.session).data)
  } else {
    res.writeHead(403)
    res.end('no')
  }
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'))
})
