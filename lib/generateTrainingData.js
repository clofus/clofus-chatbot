var json2md = require('json2md');
var YAML = require('json2yaml');
const fs = require('fs');
var rmdir = require('rmdir');


var generate = function (agentname, data, entities, agentid, callback) {

    agentname = agentname.split(' ').join('_');

    var folder = `./clofusbot/projects/${agentname}`

    var ymlfile = folder + `/domain.yml`

    var spacyfile = folder+`/config_spacy.yml`

    createFolder(folder, function () {
        generateJSON(data, agentname, folder);
        generateMD(data, agentname, folder);
        writeYML(data, ymlfile, entities);
        generatespacy(spacyfile, callback);
    });
}

function generateJSON(data, agentname, foldername) {
    var file = `${foldername}/intents/${agentname}.json`
    var json = {
        rasa_nlu_data: {
            common_examples: []
        }
    };
    data.forEach(function (storydata, index) {
        var intentdata = storydata.intents;
        var storyname = storydata.story_name;
        for (var i = 0; i < intentdata.length; i++) {
            var intentname = intentdata[i].name;
            var intentinputs = {}
            intentdata[i].inputs.forEach(function (element, index) {
                var temp = {
                    intent: intentname,
                    entities: []
                }
                if (element.text) {
                    temp.text = element.text
                    element.entities.forEach(function (entity) {
                        if (element.entities.length > 0) {
                            var tempentities = {
                                start: entity.start,
                                end: entity.end,
                                value: entity.value,
                                entity: entity.entity
                            }
                            temp.entities.push(tempentities);
                        }
                    })
                }
                intentinputs = temp;
                json.rasa_nlu_data.common_examples.push(intentinputs);
            })
        }
    })
    writetofile(file, JSON.stringify(json, null, 4));
}

function generateMD(data, agentname, folder) {
    var filefoldername = `${folder}/stories/stories.md`

    data.forEach(function (storydata, index) {
        var intentdata = storydata.intents;
        var storyname = storydata.story_name;

        writetofile(filefoldername, '\n## ' + storyname);

        for (var i = 0; i < intentdata.length; i++) {
            var temptext = '';
            var name = intentdata[i].name;
            var withoutentity = false;

            intentdata[i].inputs.forEach(function (input) {
                if (input.entities) {
                    if (input.entities.length > 0) {
                        temptext += `\n* ${name}`;
                        var temp = {}
                        input.entities.forEach(function (entity) {
                            temp[entity.entity] = entity.value;
                        })
                        temptext += JSON.stringify(temp);
                        intentdata[i].utterences.forEach(function (elem) {
                            var utterencename = elem.name;
                            temptext += `\n  - ${utterencename}`
                        })
                    }else{
                        if (!withoutentity) {
                            withoutentity = true;
                            temptext += `\n* ${name}`;
                            intentdata[i].utterences.forEach(function (elem) {
                                var utterencename = elem.name;
                                temptext += `\n  - ${utterencename}`
                            })
                        }
                    }
                } else {
                    if (!withoutentity) {
                        withoutentity = true;
                        temptext += `\n* ${name}`;
                        intentdata[i].utterences.forEach(function (elem) {
                            var utterencename = elem.name;
                            temptext += `\n  - ${utterencename}`
                        })
                    }
                }
            })
            writetofile(filefoldername, temptext);
        }
    })
}

function writeYML(data, foldername, entitieslist) {
    var actions, intents, templates, entities, slots
    if (entitieslist) {
        if (entitieslist.length > 0) {
            entities = `entities:`
            slots = `slots:`
            entitieslist.forEach(function (data) {
                entities += `\n  - ${data.name}`;
                slots += `\n   ${data.name}:`;
                slots += `\n      type: text`;
            })
        }
    }
    actions = `actions:`
    intents = `intents:`
    templates = `templates:`
    data.forEach(function (storydata, index) {
        var intentdata = storydata.intents;
        for (var i = 0; i < intentdata.length; i++) {
            intents += `\n  - ${intentdata[i].name}`;
            intentdata[i].utterences.forEach(function (utter, index) {
                actions += `\n  - ${utter.name}`;
                templates += `\n  ${utter.name}:`

                if (utter.type == 'text') {
                    utter.text.forEach(function (txt, txtindex) {
                        templates += `\n    - text: "${txt.text}"`
                    })
                }
                if (utter.type == 'buttons') {
                    templates += `\n      buttons:`
                    utter.buttons.forEach(function (button, txtindex) {
                        templates += `\n      - title: "${button.title}"`;
                        templates += `\n        payload: "${button.payload}"`;
                    })
                }
                if (utter.type == 'webhook') {
                    templates += `\n    - webhook: "${utter.webhook}"`
                }
            })
        }
    })

    var yml = ``

    if(actions){
        yml += `${actions}`
    }
    if(intents){
        yml += `\n${intents}`
    }
    if(entities){
        yml += `\n${entities}`
    }
    if(slots){
        yml += `\n${slots}`
    }
    if(templates){
        yml += `\n${templates}`
    }

    writetofile(foldername, yml);

}

function writetofile(filename, data) {
    if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, data);
        console.log('file created');
    }
    else {
        fs.appendFile(filename, data, function (err) {
            if (err) throw err;
            console.log('added to existing file!');
        });
    }
}

function createFolder(dir, callback) {
    if (fs.existsSync(dir)) {
        rmdir(dir, function (err, dirs, files) {
            console.log('all files are removed');
            fs.mkdirSync(dir);
            fs.mkdirSync(`${dir}/intents`);
            fs.mkdirSync(`${dir}/models`);
            fs.mkdirSync(`${dir}/stories`);
            callback()
        });
    }
    else {
        fs.mkdirSync(dir);
        fs.mkdirSync(`${dir}/intents`);
        fs.mkdirSync(`${dir}/models`);
        fs.mkdirSync(`${dir}/stories`);
        callback()
    }
}

function generatespacy(destination,callback){
    var spacy = `language: "en"
    
pipeline:
- name: "nlp_spacy"
- name: "tokenizer_spacy"
- name: "intent_featurizer_spacy"
- name: "intent_classifier_sklearn"
- name: "ner_crf"
- name: "ner_synonyms"`

    writetofile(destination,spacy);

    callback();
}

module.exports = {
    generateTrainingfiles: generate
}