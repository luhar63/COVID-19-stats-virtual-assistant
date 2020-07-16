"use strict";

require("dotenv").config();
const dialogflow = require("dialogflow");
const uuid = require("uuid");

const LANGUAGE_CODE = "en-US";

const express = require("express");
const app = express();

app.use(express.static(__dirname + "/views")); // html
app.use(express.static(__dirname + "/public")); // js, css, images

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express server listening on port ${server.address().port} in ${app.settings.env} mode`);
});

const io = require("socket.io")(server);
io.on("connection", function (socket) {
  console.log("a user connected");
});

// Web UI
app.get("/", (req, res) => {
  res.sendFile("index.html");
});

class DialogFlow {
  constructor(projectId) {
    this.projectId = projectId;

    let privateKey =
      process.env.NODE_ENV == "production"
        ? JSON.parse(process.env.DIALOGFLOW_PRIVATE_KEY)
        : process.env.DIALOGFLOW_PRIVATE_KEY;
    let clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL;
    let config = {
      credentials: {
        private_key: privateKey,
        client_email: clientEmail,
      },
    };

    this.sessionClient = new dialogflow.SessionsClient(config);
  }

  async sendTextMessageToDialogFlow(textMessage, sessionId, socket) {
    // Define session path
    const sessionPath = this.sessionClient.sessionPath(
      this.projectId,
      sessionId
    );
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textMessage,
          languageCode: LANGUAGE_CODE,
        },
      },
    };
    try {
      let [responses] = await this.sessionClient.detectIntent(request);
      console.log("DialogFlow.sendTextMessageToDialogFlow: Detected intent");
      console.log("-------------");
      // console.log(responses.queryResult.fulfillmentMessages);

      socket.emit("bot reply", parseText(responses), responses.outputAudio);
      console.log("-------------");
      return responses;
    } catch (err) {
      console.error("DialogFlow.sendTextMessageToDialogFlow ERROR:", err);
      throw err;
    }
  }
}

function parseText(response) {
  const msg = response.queryResult.fulfillmentMessages;
  return msg.reduce((final, every) => {
    return final + " " + every.text.text[0];
  }, "");
}

let dgflow = new DialogFlow("nuispring2020-ixsgie");
const sessionId4 = uuid.v4();

io.on("connection", function (socket) {
  socket.on("chat message", (text) => {
    console.log("Message: " + text);
    dgflow
      .sendTextMessageToDialogFlow(text, sessionId4, socket)
      .catch((err) => console.log(err));
  });
});
