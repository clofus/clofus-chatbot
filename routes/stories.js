'use strict';

module.exports = function (express, mongoose) {

    var express = require('express');
    var router = express.Router();
    var gencode = require('../lib/gencode');
    var Ajent = require("../models/agents").getModel(mongoose);
    var stories = require("../models/stories").getModel(mongoose);
    
    var storiesroutes = {
        getStorieslist : function(req,res){
            var options = {}
            options._id = mongoose.Types.ObjectId(req.query.id);
            Ajent.findOne(options)
            .populate('stories')
            .exec((err,results)=>{
                if(err) res.send(err);
                else res.send(results);
            })
        },
        createStoryToAgent : function(req,res){
            const agentId = req.query.agentid;
            const storydata = new stories(req.body);
            storydata.save((err,result)=>{
                if(err) res.send(err);
                else{
                    const storyid = result._id;
                    Ajent.findOne({_id: agentId})
                    .exec((err,agentdata)=>{
                        if(err) res.send(err);
                        else{
                            agentdata.stories = agentdata.stories.concat([storyid]);
                            //agentdata.stories.push(storyid);
                            agentdata.save((err,response)=>{
                                if(err) res.send(err);
                                else {
                                    res.send(response);
                                }
                            })
                        }
                    })
                }
            })
        },
        deleteStory: function(req,res){
            var options = {}
            if(req.query.id){
                options._id = mongoose.Types.ObjectId(req.query.id);
            }
            stories.findOneAndRemove(options)
            .exec((err,results)=>{
                if(err) res.send(err);
                else res.send(results);
            })
        },
        updateStories: function(req,res){
            var options = {}
            options._id = mongoose.Types.ObjectId(req.body._id);
            const data = req.body
            const agentid = mongoose.Types.ObjectId(req.query.agentid);
            stories.findOneAndUpdate(options,data)
            .exec((err,results)=>{
                if(err) res.send(err);
                else {
                    Ajent.findByIdAndUpdate({_id:agentid},{status:'created'})
                    .exec((error,results)=>{
                        if(error) res.send({status : 'error',error : error});
                        else{
                            res.send({status:'success',data:results});
                        }
                    })
                }
            })
        },
        getStorybyId : function(req,res){
            const storyid = mongoose.Types.ObjectId(req.query.id);
            stories.findOne({_id:storyid})
            .exec((err,response)=>{
                if(err) res.send(err);
                else res.send(response);
            })
        },
        createEntity : function(req,res){
            var agentid = mongoose.Types.ObjectId(req.query.agentid);
            var newEntity = req.body;
            Ajent.findOne({_id:agentid})
            .exec((err,response)=>{
                if(err) res.send(err);
                else{
                    var agentdata = response;
                    var exists = false;
                    agentdata.entities.forEach(function(ent){
                        if(ent.name == newEntity.name){
                            exists = true;
                        }
                    })

                   if(exists){
                    res.send({status:'Entity Already Exists'})
                   }else{
                        agentdata.entities = agentdata.entities.concat([newEntity]);
                        //agentdata.entities.push(newEntity);
                        agentdata.save((err,result)=>{
                            if(err) res.send(err);
                            else{
                                res.send({status: 'success', data:result})
                            }
                        })
                   }
                }
            })
        },
        updateEntity : function(req,res){
            var agentid = mongoose.Types.ObjectId(req.query.id);
            var entity = req.body;
            Ajent.findOne({_id:agentid})
            .exec((err,response)=>{
                if(err) res.send(err);
                else{
                    var agentdata = response;
                    var entityindex;
                    agentdata.entities.forEach(function(val,index){
                        if(val._id == entity._id){
                            entityindex = index;
                        }
                    })
                    if(entityindex || entityindex ==0){
                        agentdata.entities[entityindex].name = entity.name;
                    }

                    agentdata.save((err,result)=>{
                        if(err) res.send(err);
                        else{
                            res.send({status: 'success', data:result})
                        }
                    })
                }
            })
        },
        deleteEntity : function(req,res){
            var agentid = mongoose.Types.ObjectId(req.query.agentid);
            var entityId = req.query.entityid;
            Ajent.findOne({_id:agentid})
            .exec((err,response)=>{
                if(err) res.send(err);
                else{
                    var agentdata = response;
                    var entityindex;
                    agentdata.entities.forEach(function(val,index){
                        if(val._id == entityId){
                            entityindex = index;
                        }
                    })
                    if(entityindex || entityindex ==0)
                        agentdata.entities.splice(entityindex,1);
                    agentdata.save((err,result)=>{
                        if(err) res.send(err);
                        else{
                            res.send({status: 'success', data:result})
                        }
                    })
                }
            })
        }
};


router.get('/', storiesroutes.getStorieslist);
router.get('/intents', storiesroutes.getStorybyId);
router.post('/', storiesroutes.createStoryToAgent);
router.post('/newentity', storiesroutes.createEntity);
router.put('/', storiesroutes.updateStories);
router.put('/entity', storiesroutes.updateEntity);
router.delete('/', storiesroutes.deleteStory);
router.delete('/entity', storiesroutes.deleteEntity);

return router;

}