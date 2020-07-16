"use strict";

const socket = io();

const outputYou = document.querySelector(".output-you");
const outputBot = document.querySelector(".output-bot");

function createYouConversation(text) {
  const convContainer = document.querySelector(".conv-container");
  const elm = document.getElementById("youSaid");
  const newElem = elm.cloneNode(true);
  newElem.removeAttribute("id");
  newElem.setAttribute("class", "you-message");
  newElem.querySelector(".you-output").textContent = text;
  convContainer.appendChild(newElem);
  convContainer.scrollTop = convContainer.scrollHeight;

  // childElement.innerHTML = You said: <em class="output-you">...</em>
  // const p = "<p></p>"
}

function createBotConversation(text) {
  const convContainer = document.querySelector(".conv-container");
  const elm = document.getElementById("botSaid");
  const newElem = elm.cloneNode(true);
  newElem.removeAttribute("id");
  newElem.setAttribute("class", "bot-message");
  newElem.querySelector(".bot-output").textContent = text;
  convContainer.appendChild(newElem);
  convContainer.scrollTop = convContainer.scrollHeight;
  // childElement.innerHTML = You said: <em class="output-you">...</em>
  // const p = "<p></p>"
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "en-IN";
// recognition.interimResults = false;
recognition.maxAlternatives = 1;
// recognition.continuous = true;
recognition.interimResults = false;

document.querySelector(".micro").addEventListener("click", (e) => {
  const btn = document.querySelector(".micro");
  if (btn.classList.length == 1) {
    recognition.start();
    btn.classList.add("record");
  } else {
    recognition.stop();
    btn.classList.remove("record");
  }
});

recognition.addEventListener("speechstart", () => {
  console.log("Speech has been detected.");
});

recognition.addEventListener("result", (e) => {
  console.log("Result has been detected.");

  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;
  createYouConversation(text);
  // outputYou.textContent = text;
  console.log("Confidence: " + e.results[0][0].confidence);
  socket.emit("chat message", text);
  const recent = document.querySelector(".recent");
  recent.classList.add("loading");
});

recognition.addEventListener("speechend", () => {
  console.log("ending speech");
  const btn = document.querySelector(".micro");
  btn.classList.remove("record");
  recognition.stop();
});

recognition.addEventListener("error", (e) => {
  const btn = document.querySelector(".micro");
  btn.classList.remove("record");
  // createBotConversation("I am Sorry! There has been an error.");
  consolelog("there has been some error");
  // outputBot.textContent = "Error: " + e.error;
});

function synthVoice(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  synth.cancel();
  synth.speak(utterance);
}

function playByteArray(byteArray, callback) {
  let context = new AudioContext();
  let duration = 1;
  context
    .decodeAudioData(
      byteArray,
      function (buffer) {
        duration = play(buffer);
      }.bind(this)
    )
    .then(() => {
      setTimeout(() => {
        callback();
      }, duration * 1000);
    });
}

function play(buf) {
  // Create a source node from the buffer
  let context = new AudioContext();
  var source = context.createBufferSource();
  source.buffer = buf;
  // Connect to the final output node (the speakers)
  source.connect(context.destination);
  // Play immediately
  source.start(0);
  return source.buffer.duration;
}

socket.on("bot reply", function (reply, audio) {
  console.log(reply);
  const recent = document.querySelector(".recent");
  recent.classList.remove("loading");
  if (!reply || !reply.trim()) {
    reply = "I am sorry! Right now I can't get the data! Can you try again?";
    createBotConversation(reply);
    synthVoice(reply);
    return;
  }

  playByteArray(audio, () => {
    const btn = document.querySelector(".micro");
    btn.classList.add("record");
    recognition.start();
  });
  // synthVoice(replyText);
  createBotConversation(reply);
  // outputBot.textContent = reply;
});
