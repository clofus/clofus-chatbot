

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require("fs");
var http = require('http');

var config = require("./lib/configuration").getconfig();			
var Mongoose = require('./lib/mongooseConnect').initialize();

var app = express()
var server = http.createServer(app);

var timeout = require('connect-timeout'); //express v4
app.use(timeout(120000));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('./lib/cors'));

app.use(require('./lib/auth'));


app.use(function(req, res, next){
    res.setTimeout(480000, function(){ // 4 minute timeout adjust for larger uploads
        console.log('Request has timed out.');
            res.send(408);
        });
    next();
});

// Start the server



var routePath = "./routes/"; //add one folder then put your route files there my router folder name is routers
  fs.readdirSync(routePath).forEach(function (file) {
      if (file != ".DS_Store") {
          var route = "/api/"+config.service.apiversion + "/" + file.split(".")[0];
          var routeDef = require("./routes/" + file)(express, Mongoose);
          app.use(route, routeDef);
          console.log("Route Enabled: " + route);
      }
  });

// static webserver
app.use('/',express.static(__dirname + '/chatbot_ui'));


app.all("/*", function(req, res, next) {
    res.sendFile("index.html", { root: __dirname + "/client/app" });
});


// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  console.log("route not found")
  next();
});
 

app.get('/', function (req, res) {
  res.send('Hello World!')
});


app.set('port', config.service.port || 9090);

server.listen(app.get('port'),'0.0.0.0', function () {
  console.log('Server listening at port %d',app.get('port'));
});

