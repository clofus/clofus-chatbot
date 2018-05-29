'use strict';

// global variables
var templateurl = "http://localhost:9090/api/v1/"

var notify = function(message,type,iconclass){
    $.notify({                              // plugin documentation http://bootstrap-notify.remabledesigns.com/#documentation-how-to-use
        message: message,
        icon: iconclass
      },{
        type: type,
        allow_dismiss: true,
        newest_on_top: true,
        z_index: 1031,
        delay: 3000,
        url_target: '_blank',
        onShow: null,
        onShown: null,
        onClose: null,
        onClosed: null,
        icon_type: 'class'
      });
}


// components

Vue.component('agentmodal', {
    props: ['agentdetails','createflag'],
    data : function(){
        return{
            agent : {}
        }
    },
    template: '#agent-modal-template',
    methods: {
        updateAgents(data) {
            const self = this;
            if(self.createflag){
                axios.post(templateurl + 'agents', data)
                .then(function (response) {
                    var icon
                    if(response.data.results) icon = 'fa fa-check'
                    else icon = 'fa fa-warning'
                    notify(response.data.status,'success',icon);
                    self.$emit('close');
                })
                .catch(function (err) {

                });
            }else{
                axios.put(templateurl + 'agents', data)
                .then(function (response) {
                    var icon
                    if(response.data.results) icon = 'fa fa-check'
                    else icon = 'fa fa-warning'
                    notify(response.data.status,'success',icon);
                    self.$emit('close');
                })
                .catch(function (err) {

                });
            }
        },
        validatefields(data){
            let message = 'Fill out all the required fields'
            let icon = 'fa fa-warning'
            if(data.agentname && data.port){
                if(data.agentname != '' && data.port != ''){
                    this.updateAgents(data);
                }else  notify(message,'warning',icon);
            }
            else{
                notify(message,'warning',icon);
            }
        }
    },
    created : function(){
        if(!this.createflag){
            this.agent  = this.agentdetails;
        }
    }
})

Vue.component('storymodal', {
    props: ['storydata','createflag','agentid'],
    data: function(){
        return{
            story : {}
        }
    },
    template: '#story-modal-template',
    methods: {
        updateStories(data) {
            const self = this;
            if(self.createflag){
                axios.post(templateurl + 'stories?agentid=' + this.agentid, data)
                .then(function (response) {
                    self.$emit('close');
                })
                .catch(function (err) {

                });
            }else{
                axios.put(templateurl + 'stories', data)
                .then(function (response) {
                    self.$emit('close');
                })
                .catch(function (err) {

                });
            }
        }
    },
    created : function(){
        if(!this.createflag){
            this.story = this.storydata;
        }
    }
})

Vue.component('entitymodal', {
    props: ['entitydata', 'agentid','createflag'],
    data : function(){
        return{
            entity : {}
        }
    },
    template: '#entity-modal-template',
    methods: {
        updateEntity(data) {
            const self = this;
            if(this.createflag){
                axios.post(templateurl + 'stories/newentity?agentid=' + this.agentid, data)
                .then(function (response) {
                    self.$emit('close');
                })
                .catch(function (err) {

                });
            }else{
                axios.put(templateurl + 'stories/entity?id=' + self.agentid, data)
                .then(function (response) {
                    self.$emit('close');
                })
                .catch(function (err) {

                });
            }
        }
    },
    created: function(){
        if(!this.createflag){
            this.entity = this.entitydata
        }
    }
})

Vue.component('chatbotnew', {
    props: ['agentdata'],
    template: '#chatbotnew',
    data : function(){
        return {
            sender_id : '',
            BOT_IMG : "https://image.flaticon.com/icons/svg/327/327779.svg",
            PERSON_IMG : "https://image.flaticon.com/icons/svg/145/145867.svg",
            message : '',
            // url : '',
            headers : 'application/json',
            errormessage : "sorry!, I am not able to connect with my server"
        }
    },
    methods: {
        appendMessage(name, img, side, text) {
            //   Simple solution for small apps
            var msgHTML = "\n    <div class=\"msg " + side + "-msg\">\n      <div class=\"msg-img\" style=\"background-image: url(" + img + ")\"></div>\n\n      <div class=\"msg-bubble\">\n        <div class=\"msg-info\">\n          <div class=\"msg-info-name\">" + name + "</div>\n          <div class=\"msg-info-time\">" + this.formatDate(new Date()) + "</div>\n        </div>\n\n        <div class=\"msg-text\">" + text + "</div>\n      </div>\n    </div>\n  ";
            var msgerChat = this.get(".msger-chat");
            msgerChat.insertAdjacentHTML("beforeend", msgHTML);
            msgerChat.scrollTop += 500;
            this.message = '';
        },
        sendMessage(message){
            var self=this;
            this.appendMessage('You',this.PERSON_IMG,'right',message);

            axios.post(templateurl+'conversations/'+this.sender_id+'/parse?id='+self.agentdata._id, {
                "query": message
            })
            .then(function (response) {
                console.log(response);
                self.vaidateresponse(response);
                if(response.data.data.next_action != "action_listen") {
                    axios.post(templateurl+'conversations/'+self.sender_id+'/continue?id='+self.agentdata._id, {
                            "executed_action": response.data.data.next_action,
                            "events": []
                        })
                        .then(function (response2) {
                            console.log(response);
                            self.vaidateresponse(response2)
                        })
                        .catch(function (error) {
                            console.log(error);
                            self.appendMessage('Bot',self.BOT_IMG,'left',self.errormessage)
                        });
                }
            })
            .catch(function (error) {
                console.log(error);
                self.appendMessage('Bot',self.BOT_IMG,'left',self.errormessage);
            });
        },
        formatDate(date) {
            var h = "0" + date.getHours();
            var m = "0" + date.getMinutes();
            return h.slice(-2) + ":" + m.slice(-2);
        },
        get(selector) {
            var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
            return root.querySelector(selector);
        },
        uuid4 () {
            //// return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            var uuid = '', ii;
            for (ii = 0; ii < 32; ii += 1) {
              switch (ii) {
              case 8:
              case 20:
                uuid += '-';
                uuid += (Math.random() * 16 | 0).toString(16);
                break;
              case 12:
                uuid += '-';
                uuid += '4';
                break;
              case 16:
                uuid += '-';
                uuid += (Math.random() * 4 | 8).toString(16);
                break;
              default:
                uuid += (Math.random() * 16 | 0).toString(16);
              }
            }
            return uuid;
        },
        vaidateresponse(response){
            if (typeof response.data.data.template != "undefined" && response.data.data.next_action!= "action_listen"){
                if(typeof response.data.data.template.text != "undefined" && response.data.data.template.text.length > 0) {
                    var buttons = [];
                    if(typeof response.data.data.template.buttons != "undefined" && response.data.data.template.buttons.length > 0) {
                        buttons = response.data.data.template.buttons;
                    }
                // text: response.data.data.template.text,
                    this.appendMessage('Bot',this.BOT_IMG,'left',response.data.data.template.text)
                }else {
                    this.appendMessage('Bot',this.BOT_IMG,'left',this.errormessage)
                }
            }else if(response.data.data.next_action == "action_listen") {}
            else {
                this.appendMessage('Bot',this.BOT_IMG,'left',this.errormessage)
            }
        },
        resetchat(){
            this.sender_id = '';
        }
    },
    created:function(){
        // this.url = `http://localhost:${this.agentdata.port}`;
        this.sender_id = this.uuid4();
    }
})


// directives

// Vue.use(VeeValidate);

Vue.directive('tooltip', {
    componentUpdated(el, binding, vnode, oldVnode) {
        vnode.data._div = oldVnode.data._div
        vnode.data._div.innerHTML = '<span>' + binding.value + '</span>'
    },
    inserted(el, binding, vnode) {
        // create div
        const div = document.createElement('div')
        vnode.data._div = div
        el.insertAdjacentElement('beforeend', div)
        div.classList.add('my-tooltip')
        div.innerHTML = '<span>' + binding.value + '</span>'

        el.addEventListener('dblclick', () => {
            div.classList.add('my-tooltip-active')
        })
        $(document).keyup(function (e) {
            if (e.keyCode == 27) { // escape key keycode `27`
                div.classList.remove('my-tooltip-active')
            }
            window.onclick = function (event) {
                div.classList.remove('my-tooltip-active')
            }
        });

    }
})
// add this to implement:   v-tooltip="intentindex" style="position: relative"  



// router controllers
const agents = {
    template: '#intents',
    data: function () {
        return {
            loading: false,
            agents: {},
            error: null,
            showModal: false,
            createflag: '',
            editModalData:{},
            showbotflag : false,
            chatagentdata : {},
        }
    },
    created() {
        this.fetchAgents()
    },
    watch: {
        '$route': 'fetchAgents'
    },
    methods: {
        reloadPage(){
            window.location.reload();
        },
        fetchAgents() {
            const self = this;
            axios.get(templateurl + 'agents')
            .then(function (response) {
                self.agents = response.data;
            })
            .catch(function (err) {
                console.log(err);
            });
        },
        deleteAgent(id) {
            const self = this;
            axios.delete(templateurl + 'agents?id=' + id)
            .then(function (response) {
                var icon
                if(response.data.results) icon = 'fa fa-check'
                else icon = 'fa fa-warning'
                notify(response.data.status,'success',icon);
                self.fetchAgents()
            })
            .catch(function (err) {
                console.log(err);
            })
        },
        trainAgent(id) {
            const self = this;
            axios.put(templateurl + 'agents/trainagent?id=' + id)
            .then(function (response) {
                notify(response.data.status,'success','fa fa-check');
                self.fetchAgents()
            })
            .catch(function (err) {
                console.log(err);
            })
        },
        startchat(id){
            const self = this;
            axios.put(templateurl + 'agents/startserver?id=' + id)
            .then(function (response) {
                notify(response.data.status,'success','fa fa-check');
                self.fetchAgents()
            })
            .catch(function (err) {
                console.log(err);
            })
        },
        stopagentchat(id){
            const self = this;
            axios.put(templateurl + 'agents/stopserver?id=' + id)
            .then(function (response) {
                notify(response.data.status,'success','fa fa-check');
                self.fetchAgents()
            })
            .catch(function (err) {
                console.log(err);
            })
        },
        modalclose() {
            this.showModal = false;
            this.fetchAgents();
            this.editModalData = {};
            this.showbotflag = false;
            this.chatagentdata = {};
            this.createflag = '';
        }
    }
};

const storylist = {
    template: '#storieslist',
    props: ['id'],
    data: function () {
        return {
            storylist: [],
            entitylist: [],
            showModal: false,
            createflag : '',
            editModalData:{}
        }
    },
    created() {
        this.fetchStories(this.$route.params.agentid)
    },
    methods: {
        fetchStories(agentid) {
            const self = this;
            axios.get(templateurl + 'stories?id=' + agentid)
            .then(function (response) {
                self.storylist = response.data.stories;
                self.entitylist = response.data.entitylist;
            })
            .catch(function (err) {
                console.log(err);
            });
        },
        deletestory(id) {
            const self = this;
            axios.delete(templateurl + 'stories?id=' + id)
            .then(function (response) {
                self.fetchStories(self.$route.params.agentid);
            })
            .catch(function (err) {
                console.log(err);
            });
        },
        modalclose() {
            this.showModal = false;
            this.fetchStories(this.$route.params.agentid);
            this.editstorydata = {};
            this.editModalData={};
            this.createflag = '';
        }
    }
}

const entitylist = {
    template: '#entitylist',
    props: ['id'],
    data: function () {
        return {
            entitylist: [],
            showModal: false,
            agentdata: {},
            editModalData:{},
            createflag:'',
            items: [
                {
                    message: 'example of error message.'
                },
                {
                    type: 'Success',
                    color: '#2ecc71',
                    dismissable: false,
                    message: 'example of success message.'
                }
            ]
        }
    },
    created() {
        this.fetchEntities(this.$route.params.agentid)
    },
    methods: {
        fetchEntities(agentid) {
            const self = this;
            axios.get(templateurl + 'stories?id=' + agentid)
                .then(function (response) {
                    self.entitylist = response.data.entities;
                    self.agentdata = response.data;
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        deleteEntity(eid) {
            const self = this;
            var id = self.$route.params.agentid;
            axios.delete(templateurl + 'stories/entity?agentid=' + id + '&entityid=' + eid)
                .then(function (response) {
                    self.fetchEntities(self.$route.params.agentid);
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        modalclose() {
            this.showModal = false;
            this.fetchEntities(this.$route.params.agentid);
            this.editModalData={}; 
            this.createflag='';           
        }
    }
}

const stories = {
    template: '#stories',
    data: function () {
        return {
            stories: {}
        };
    },
    created() {
        this.fetchStoryById(this.$route.params.storyid);
    },
    methods: {
        getWord(data, intentIndex, inputIndex) {
            var selected = window.getSelection().toString();
            var json = {}
            json.start = data.indexOf(selected);
            json.end = json.start + selected.length;
            json.value = selected;
            json.entity = "";
            this.stories.intents[intentIndex].inputs[inputIndex].entities.unshift(json);
        },
        addIntent() {
            var newintent = {
                name: '',
                utterences: [
                    {
                        name: '',
                        type: '',
                        text: ''
                    }
                ],
                inputs: [
                    {
                        text: '',
                        entities: []
                    }
                ]
            }
            this.stories.intents.push(newintent);
        },
        removeintent(index) {
            this.stories.intents.splice(index, 1);
        },
        addInput(intentIndex) {
            var input = {
                text: '',
                entities: []
            }
            this.stories.intents[intentIndex].inputs.push(input);
        },
        removeInput(intentIndex, inputindex) {
            this.stories.intents[intentIndex].inputs.splice(inputindex, 1);
        },
        addEntity(intentIndex, inputindex) {
            var entity = {
                "value": "",
                "entity": ""
            }
            this.stories.intents[intentIndex].inputs[inputindex].entities.push(entity);
        },
        removeEntity(intentIndex, inputindex, entityindex) {
            this.stories.intents[intentIndex].inputs[inputindex].entities.splice(entityindex, 1);
        },
        addAction(intentIndex) {
            var temp = {
                name: '',
                type: 'text',
                text: ''
            }
            this.stories.intents[intentIndex].utterences.push(temp);
        },
        removeAction(intentIndex, utterenceIndex) {
            this.stories.intents[intentIndex].utterences.splice(utterenceIndex, 1);
        },
        buttonOnChange(intentindex, utterenceindex) {
            if (this.stories.intents[intentindex].utterences[utterenceindex].type == "buttons") {
                if (!this.stories.intents[intentindex].utterences[utterenceindex].buttons) {
                    this.stories.intents[intentindex].utterences[utterenceindex].buttons = [{ title: '', payload: '' }];
                } else if (this.stories.intents[intentindex].utterences[utterenceindex].buttons.length == 0) {
                    this.stories.intents[intentindex].utterences[utterenceindex].buttons = [{ title: '', payload: '' }];
                }
            }
            if (this.stories.intents[intentindex].utterences[utterenceindex].type == "text") {
                if (!this.stories.intents[intentindex].utterences[utterenceindex].text) {
                    this.stories.intents[intentindex].utterences[utterenceindex].text = [{ text: '' }];
                } else if (this.stories.intents[intentindex].utterences[utterenceindex].text.length == 0) {
                    this.stories.intents[intentindex].utterences[utterenceindex].text = [{ text: '' }];
                }
            }
        },
        addActionButton(intentindex, utterenceindex) {
            var temp = { title: '', payload: '' }
            this.stories.intents[intentindex].utterences[utterenceindex].buttons.push(temp);
        },
        removeActionButton(intentindex, utterenceindex, buttonindex) {
            this.stories.intents[intentindex].utterences[utterenceindex].buttons.splice(buttonindex, 1);
        },
        addActionText(intentindex, utterenceindex) {
            console.log(this.stories.intents[intentindex].utterences[utterenceindex].text.length);
            var temp = { text: '' }
            this.stories.intents[intentindex].utterences[utterenceindex].text.push(temp);
        },
        removeActionText(intentindex, utterenceindex, textIndex) {
            this.stories.intents[intentindex].utterences[utterenceindex].text.splice(textIndex, 1);
        },
        fetchStoryById(id) {
            const self = this;
            axios.get(templateurl + 'stories/intents?id=' + id)
                .then(function (response) {
                    self.stories = response.data;
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        saveStory(data) {
            const self = this;
            axios.put(templateurl + 'stories?agentid='+self.$route.params.agentid, data)
            .then(function (response) {
                if(response.status == 200 && response.statusText == 'OK'){
                    notify('Saved Sucessfully','success','fa fa-check');
                    // self.fetchStoryById(self.$route.params.storyid);
                    self.$router.push('/');
                }
            })
            .catch(function (err) {
                console.log(err);
            });
        },
        validatejson(data){
            console.log(data);
            var result = true;
            data.intents.forEach(function(intent,intentIndex){
                intent.inputs.forEach(function(input,inputIndex){
                    input.entities.forEach(function(entity,entityIndex){
                        if(entity.start.toString() && entity.end.toString() && entity.entity && entity.value){
                            if(entity.start=='' || entity.end=='' || entity.entity=='' || entity.value==''){
                                result = false;
                            }
                        }else{
                            result = false;
                        }
                    })
                })
            })

            return result;

        }
    }
}

const graphs = {};





const routes = [
    { path: '/', component: agents },
    { path: '/stories/list/:agentid', name: 'storylist', component: storylist, props: true },
    { path: '/graphs', component: graphs },
    { path: '/entities/:agentid', name: 'entitylist', component: entitylist, props: true },
    { path: '/stories/:storyid', name: 'storydetails', component: stories, props: true }
]

// create router instanse
const router = new VueRouter({ routes })

// add router instance to app
const app = new Vue({
    router,
}).$mount('#target')




