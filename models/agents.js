var template = function (callback) {

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var _u = require("lodash");
    var crypto = require("crypto");
    var deepPopulate = require('mongoose-deep-populate')(mongoose);

    var modelName = "agents";   //model name

    var model = new Schema({
        //account
        agentname: {type: String,required: true, unique: true },
        description: {type: String},
		// role: {type: String, enum: ["admin","leader","scorer","user"], default: "user"},
        timestamp: {type: Date, default: Date.now},
        stories : [{type: Schema.Types.ObjectId, ref: 'stories'}],
        entities : [
            {
                name : {type: String}
            }
        ],
        port : {type: String, unique: true },
        status : {type: String, enum: ["created","training","trained","started","stopped"], default: "created"}
    
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

