var template = function (callback) {

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var _u = require("lodash");
    var crypto = require("crypto");
    var deepPopulate = require('mongoose-deep-populate')(mongoose);

    var modelName = "stories";   //model name

    var model = new Schema({
        //account
        story_name: {type: String,required: true},
        intents: [
           {
            name:{type: String},
            utterences : [
                {
                    name: {type: String},
                    type: {type: String, enum: ["text","webhook","buttons"], default: "text"},
                    text: [{
                        text:{type: String}
                    }],
                    webhook : {type: String},
                    buttons : [{
                        title : {type: String}, 
                        payload : {type: String}
                    }]
                }
            ],
            inputs:[
                { 
                    text: {type: String},
                    entities : [{
                        start: {type: Number},
                        end: {type: Number},
                        value: {type: String},
                        entity: {type: String}
                    }]
                }
            ]
           }
        ],
        timestamp: {type: Date, default: Date.now},
        description: {type: String}
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

