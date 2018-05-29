var template = function (callback) {
	
	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var modelName = "oauths";   //model name
	var model = new Schema({
        user_id: {type: String, required: true},
        token: {type: String},
		session: {type: Date, default: Date.now}
    });
	
    model.pre('save', function(next) {
        var currentDate = new Date();

        this.updated_At = currentDate;
        if (!this.created_At)
            this.created_At = currentDate;

        next();
    });

    try {
        if (mongoose.model(modelName))
            return mongoose.model(modelName);
    } catch (e) {
        if (e.name === 'MissingSchemaError') {
            return mongoose.model(modelName, model);
        }
    }
}

module.exports = {
    getModel: template,
    registerModel: template
};