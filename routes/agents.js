'use strict';

module.exports = function (express, mongoose) {

    var express = require('express');
    var router = express.Router();
    var gencode = require('../lib/gencode');
    var Ajent = require("../models/agents").getModel(mongoose);
    var generete = require('../lib/generateTrainingData');
    var command = require('../lib/executecommand');

    var ajentroutes = {

        getapplicant: function (req, res) {
            var options = {};
            if (req.query.id) {
                options._id = mongoose.Types.ObjectId(req.query.id);
            }
            applicant.find(options)
                .populate('answers.questionid')
                .exec(function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                })
        },

        createAgent: function (req, res) {
            var data = req.body;
            let port = req.body.port;
            var newAgent = new Ajent(data);
            newAgent.save((err, result) => {
                if (err) {
                    // console.log(err, 'errrr');
                    if (err.code == 11000) {
                        res.send({ status: 'Given username or port already exists', error: err });
                    } else {
                        res.send({ status: 'failed to save agent', error: err });
                    }
                } else {
                    res.send({ status: 'Created sucessfully', results: result });
                }
            })
        },

        getAgent: function (req, res) {
            var options = {}
            if (req.query.id) {
                options._id = mongoose.Types.ObjectId(req.query.id);
            }
            Ajent.find(options)
                .exec((err, results) => {
                    if (err) res.send(err);
                    else res.send(results);
                })
        },

        updateAgent: function (req, res) {
            var data = req.body;
            let port = req.body.port;
            var options = {}
            if (req.body._id) {
                options._id = mongoose.Types.ObjectId(req.body._id);
            }
            Ajent.findOneAndUpdate(options, req.body)
                .exec((err, results) => {
                    if (err) {
                        if (err.code == 11000) {
                            res.send({ status: 'Given username or port already exists', error: err });
                        }
                        else res.send({ status: 'failed to update agent', error: err });
                    }
                    else res.send({ status: 'Updated sucessfully', results: results });
                })
        },

        deleteAgent: function (req, res) {
            var options = {}
            if (req.query.id) {
                options._id = mongoose.Types.ObjectId(req.query.id);
            }
            Ajent.findOneAndRemove(options)
                .exec((err, results) => {
                    if (err) res.send({ status: 'error', error: err });
                    else {
                        res.send({
                            status: 'Sucessfully deleted',
                            results: results
                        });
                    }
                })
        },

        trainagent: function (req, res) {
            var agentid = mongoose.Types.ObjectId(req.query.id);
            Ajent.findOne({ _id: agentid })
                .populate('stories')
                .exec((err, results) => {
                    if (err) res.send({ error: err });
                    else {
                        var agentname = results.agentname.split(' ').join('_');
                        var stories = results.stories;
                        var entities = results.entities
                        generete.generateTrainingfiles(agentname, stories, entities, results._id, function () {
                            var cmd = `
                        python3 -m clofusbot.rasa train-nlu ${agentname}
                        python3 -m clofusbot.rasa train-dialogue ${agentname}
                        `
                            command.run(cmd, function () {
                                var data = {
                                    status: 'trained'
                                }
                                Ajent.findByIdAndUpdate({ _id: results._id }, data)
                                    .exec((err, results) => {
                                        if (err) res.send({ error: err });
                                        else {
                                            console.log('training completed');
                                        }
                                    })
                            })
                        });
                        Ajent.findOneAndUpdate({ _id: agentid }, { status: 'training' })
                            .exec((err, results) => {
                                if (err) res.send({ error: err })
                                else {
                                    res.send({
                                        status: 'Training process Started'
                                    })
                                }
                            })
                    }
                })
        },

        startserver: function (req, res) {
            var agentid = req.query.id;
            Ajent.findOne({ _id: agentid })
                .exec((err, results) => {
                    if (err) res.send({ status: 'Cannot find agent', error: err });
                    else {
                        var port = results.port;
                        var agentname = results.agentname.split(' ').join('_');

                        var cmd = `
                    python3 -m rasa_core.server -p ${port} -d clofusbot/projects/${agentname}/models/dialogue -u clofusbot/projects/${agentname}/models/nlu/default/current
                    `
                        command.run(cmd, function (port) { console.log('server started'); })
                        Ajent.findOneAndUpdate({ _id: agentid }, { status: 'started' })
                            .exec((err, results) => {
                                if (err) res.send({ error: err })
                                else {
                                    res.send({
                                        status: `Server started sucessfully at port ${port}`
                                    })
                                }
                            })
                    }
                })
        },

        stopserver: function (req, res) {
            var agentid = req.query.id;
            Ajent.findOne({ _id: agentid })
                .exec((err, results) => {
                    if (err) res.send({ status: 'Cannot find agent', error: err });
                    else {
                        var port = results.port;
                        var cmd = `
                    kill -9 $(lsof -ti:${port})
                    `
                        command.run(cmd, function () {
                            Ajent.findOneAndUpdate({ _id: agentid }, { status: 'stopped' })
                                .exec((err, results) => {
                                    if (err) res.send({ error: err })
                                    else {
                                        res.send({
                                            status: `Server Killed sucessfully`
                                        })
                                    }
                                })
                        })
                    }
                })

        }
    };


    router.post('/', ajentroutes.createAgent);
    router.put('/', ajentroutes.updateAgent);
    router.put('/trainagent', ajentroutes.trainagent);
    router.put('/startserver', ajentroutes.startserver);
    router.put('/stopserver', ajentroutes.stopserver);
    router.get('/', ajentroutes.getAgent);
    router.delete('/', ajentroutes.deleteAgent);


    return router;

}