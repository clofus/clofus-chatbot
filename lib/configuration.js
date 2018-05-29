var configuration = function(){
	var config;
	
	if(process.env.ENVIRONMENT){
		var configfile = "../config/config."+process.env.ENVIRONMENT +".js";
		console.log(configfile)
		config = require(configfile);
		//console.log("Current ENVIRONMENT is "+process.env.ENVIRONMENT);
	}else{
		process.env.ENVIRONMENT = 'dev';
		var configfile = "../config/config.dev.js";
		console.log(configfile);
		config = require(configfile);
		
		console.log("Set ENVIRONMENT=dev|test|prod");
	}
	return config;
};

module.exports = {
	getconfig : configuration
};

/*
 var config = require("../common/configuration").getconfig();
* */