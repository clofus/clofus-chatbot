var express = require("express");

var cors = express.Router();
cors.use(function(req, res, next){
    
    // Disable caching for content files
	res.setHeader('Last-Modified', (new Date()).toUTCString());

    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
	
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization, refresh_token, grant_type, enctype, client_id');

    next();

});

module.exports = cors;