# Train intents and entities with Rasa NLU
python -m rasa_nlu.train -c nlu_model_config.json --fixed_model_name current

# Train dialog flow and stories
python -m rasa_core.train -s stories/* -d domain.yml -o models/dialogue --epochs 300

# visualize story flow
python -m rasa_core.visualize -d domain.yml -s stories/stories.md -o graph.png; open graph.png

# Run the bot
python -m rasa_core.run -d models/dialogue -u models/nlu/simpletalk/current/