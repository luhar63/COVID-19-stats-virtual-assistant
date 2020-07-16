# A Simple Voice AI Bot with Web Speech API and Node.js

## A virtual assistant(interactive chatbot) for COVID-19 stats

This is how this web app works:

1. Using the Web Speech API’s `SpeechRecognition` interface to listen your voice from a microphone
2. Send your message to [Dialogflow](https://dialogflow.com/) (the natural language understanding platform which makes it easy to design and integrate a conversational user interface) API, running in node server, as a text string
3. Wait fot the response from the `Dialogflow`: it returns the reply text or the audio
4. If audio, then plays the audio otherwise use the `SpeechSynthesis` interface to give it a synthetic voice.

## SETUP

1. npm install
2. Setup your DIALOGFLOW_PRIVATE_KEY and DIALOGFLOW_CLIENT_EMAIL in the .env file
3. npm start
