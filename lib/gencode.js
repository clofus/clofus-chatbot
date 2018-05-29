function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

var guidCode = function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

var genPwd = function () {

    return s4() + s4()+ s4();
};

var genfilename = function () {

    return s4() + s4()+ s4()+ s4();
};

/*var gendbname = function (dbname, callback) {
	
	var newdbname = "client"+dbname.replace(" ", "").substring(0, 7).toLowerCase() + s4() + s4();
    return newdbname;
};*/


module.exports = {
    generateToken: guidCode,
    generatePassword: genPwd,
    generateFilename: genfilename
	//generateDbname: gendbname
};
