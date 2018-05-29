'use strict';

module.exports = function (express, mongoose) {

    var router = express.Router();                
    var request = require('request');
    var Ajent = require("../models/agents").getModel(mongoose);
    var YAML = require('yamljs');

    var getTemplateIfExists = function(output, project){
        var action = output.next_action;

        var templates = YAML.load('./clofusbot/projects/'+project+'/domain.yml');
        console.log("templateSSS",templates, action)
        if(templates.templates[action]){
            var utterences = templates.templates[action];
            var template = utterences[Math.floor(Math.random()*utterences.length)];
            return template;
        }else{
            return "";
        }
    }

    var question = {
        parse: function (req, res) {
            //curl -XPOST localhost:5005/conversations/default/parse -d '{"query":"hello there"}'
            var agentid = req.query.id;
            Ajent.findOne({_id:agentid})
            .exec((err,results)=>{
                if(err) res.send({status:'Cannot find agent', error : err});
                else {
                    var port = results.port;
                    if(req.body.query){
                        var query = req.body.query;
                        var sender_id = req.params.sender_id;
                        var project = results.agentname.split(' ').join('_');
                    
                        var input = {
                            query:req.body.query
                        }
                        console.log("input ", input)
                        request.post({
                            url:'http://localhost:'+port+'/conversations/'+sender_id+'/parse',
                            json: true,
                            body: input
                        }, function (error, response, output) {
                            console.log('response:', output); // Print the HTML for the Google homepage.
                            if(output && typeof output.next_action !="undefined"){
                                output.template = getTemplateIfExists(output, project);
                                res.json({"status":"success", "data": output});
                            }else{
                                res.json({"status":"error", "data":"no_response"});
                            }
                        });
                    }else{
                        res.json({"status":"error","data":"invalid_query"})
                    }
                }
            })
        },

        continue: function (req, res) {
            //curl -XPOST http://localhost:5005/conversations/default/continue -d '{"executed_action": "utter_ask_howcanhelp", "events": []}'
            var agentid = req.query.id;
            Ajent.findOne({_id:agentid})
            .exec((err,results)=>{
                if(err) res.send({status:'Cannot find agent', error : err});
                else {
                    var port = results.port;
                    if(req.body){
                        var query = req.body.query;
                        var sender_id = req.params.sender_id;
                        var input = req.body;
                        var project = results.agentname.split(' ').join('_');
                        request.post({
                            url:'http://localhost:'+port+'/conversations/'+sender_id+'/continue',
                            json: true,
                            body: input
                        }, function (error, response, output) {
                            if(output && typeof output.next_action !="undefined"){
                                console.log('response:', output); // Print the HTML for the Google homepage.
                                output.template = getTemplateIfExists(output,project);
                                res.json({"status":"success","data":output})
                            }else{
                                res.json({"status":"error","data":output})
                            }
                        });
                    }else{
                        res.json({"status":"error","data":"invalid_query"})
                    }
                }
            })
        }
    };
	
    router.post('/:sender_id/parse', question.parse);
    router.post('/:sender_id/continue', question.continue);

    return router;
};