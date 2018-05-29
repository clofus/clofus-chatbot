var mongoose = function () {
    var fs = require("fs");
    var Mongoose = require('mongoose');
    var nconf = require('nconf');
    nconf.argv()
        .env()
        .file({ file:
            './config.json'
        });
		
	var queryString = require('query-string');
    var config = require('../config/config.' + nconf.get('ENVIRONMENT'));
    var connecturi, options={};
	
	
	if(nconf.get('ENVIRONMENT') == "test"){
		connecturi = 'mongodb://' + config.database.username + ":" + config.database.password + "@";
		
		var replicaSets = config.database.replicaSets; 
		
		for(var i=0;i<replicaSets.nodes.length;i++){
			if(i>0 && i<replicaSets.nodes.length){
				connecturi = connecturi + ","
			}
			connecturi = connecturi + replicaSets.nodes[i].host + ":" + replicaSets.nodes[i].port
		}
		
		connecturi = connecturi + "/" + config.database.db;
		connecturi = connecturi + "?" + queryString.stringify(replicaSets.options);
		
	}else{	
		connecturi = 'mongodb://'+ config.database.username + ":" + config.database.password + "@" + config.database.host + '/' + config.database.db;
	}

	console.log("Connecting...", connecturi)		
    Mongoose.connect(connecturi);

    var modelsPath = __dirname + "/../models/"; //add one folder then put your route files there my router folder name is routers
    fs.readdirSync(modelsPath).forEach(function (file) {
        if (file != ".DS_Store") {
            require(modelsPath + file).registerModel(Mongoose);
        }
    });


    var db = Mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', function callback() {
        console.log("Connection with database succeeded - " + config.database.db);
    });

    return Mongoose;

};


module.exports = {
    initialize: mongoose
};
