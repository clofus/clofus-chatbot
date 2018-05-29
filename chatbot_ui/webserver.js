var express = require('express');
var app = express();

app.use(express.static('./'))

app.all("/*", function(req, res, next) {
    console.log("root", __dirname)
    res.sendFile("index.html", { root: __dirname + "/" });
});


app.set('port', 9900);
 
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
