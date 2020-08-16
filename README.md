# Clofus® Chat Bot Platform
Clofus® Chat Bot Platform is a web application built using latest frameworks and database such as nodejs, expressjs, vuejs, mongodb etc., on top of Rasa NLU and Rasa Core.
Clofus® Chat Bot Platform provides a web application to quickly and easily be able to create agents, define intents, entities and stories, It also provides some convenience features for Rasa NLU, like training your models testing chat interface, multi domain support.

## Demo
[Live Chat Demo](https://clofus.github.io/clofus-chatbot/)


## Goal
The goal of this project is to build an opensource chat platform better than proprietary Google DialogFlow, Alexa etc., using machine learning multi turn story conversations without using any proprietary API


## Differentiator
- Training data stored in Mongo DB
- UI for managing training data both NLU and Stories
- This is the only project I found to have support for multi domain conversation using rasa core and rasa NLU
- Has integrated chat interface
- Has integrated train/start/stop server
- Built on top of modern frameworks such as express, vuejs and mongodb

### Prerequisites

[Rasa NLU](https://github.com/golastmile/rasa_nlu) - Version Master branch

[Rasa Core](https://github.com/golastmile/rasa_nlu) - Version Master branch

[Mongodb](https://www.mongodb.com) - Used for storing training data (entities, intents, synonyms, stories etc.)

[Node.js/npm](https://nodejs.org/en/) - Serves Clofus Chat Bot UI for both training and chat interface)


## Setup project
```
git clone https://github.com/clofus/clofus-chatbot.git

npm install

(cd chatbot_ui && npm install)
```

## Start server
- node server.js

## Browser Demo Link
- http://localhost:9090/#/


## Screenshot

![Screenshot1](https://github.com/clofus/clofus-chatbot/blob/master/resources/screenshot.png)


## Contribution
We are open to Contributions from everyone to this project inorder to make this a open chat bot platform that works 100% offline without any proprietary API


## For Support & more information
Visit us at [https://clofusinnovations.com](https://clofusinnovations.com)

Visit us at [https://clofus.com](https://clofus.com)

For any queries email me at karthikbalu.meng@gmail.com
