## Train NLU
python -m clofusbot.rasa train-nlu schooltalk

## Train Story
python -m clofusbot.rasa train-dialogue schooltalk

## Test Bot
python -m clofusbot.rasa test-bot schooltalk

## Talk to bot
python -m clofusbot.rasa respond schooltalk hi

## Run Server
cd ..
python -m rasa_core.server -p <port> -d clofusbot/projects/<foldername>/models/dialogue -u clofusbot/projects/<foldername>/models/nlu/default/current