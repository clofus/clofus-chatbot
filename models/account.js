var template = function (callback) {

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var _u = require("lodash");
    var crypto = require("crypto");
    var deepPopulate = require('mongoose-deep-populate')(mongoose);

    var modelName = "accounts";   //model name

    var model = new Schema({
        //account
        name: {type: String},
        country: {type: String},
        phone: {type: String},
        // profilepicture: {type: String},
        email: {type: String, required: true},
        username: {type: String, required: true},
        password: {type: String, required: true},
		// skypeid: {type: String},
        // emailToken: {type: String},
        // reason: {type: String},
		role: {type: String, enum: ["admin","leader","scorer","user"], default: "user"},
		// status: {type: String, enum: ["active", "inactive","block"], default: "inactive"},
        cd: {type: Date, default: Date.now},
        // lm: {type: Date, default: Date.now},
		// provider: {type:String, default:"self"}
    
    });

    model.pre('save', function(next) {
        var currentDate = new Date();

        this.updated_At = currentDate;
        if (!this.created_At)
            this.created_At = currentDate;

        next();
    });

    model.plugin(deepPopulate, {});

    try {
        if (mongoose.model(modelName))
            return mongoose.model(modelName);
    } catch (e) {
        if (e.name === 'MissingSchemaError') {
            console.log("Registered Model: "+ modelName);
            return mongoose.model(modelName, model);
        }
    }
};

module.exports = {
    getModel: template,
    registerModel: template
};

