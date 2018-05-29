'use strict';

var NodeHandlebars = require('./lib/node-handlebars');

exports = module.exports  = exphbs;
exports.create            = create;
exports.NodeHandlebars = NodeHandlebars;

// -----------------------------------------------------------------------------

function exphbs(config) {
    return create(config).engine;
}

function create(config) {
    return new NodeHandlebars(config);
}
