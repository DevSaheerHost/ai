// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC68KITEcmHfXHUzq0jXjKEoukO16wmI8I",
  authDomain: "social-a26cf.firebaseapp.com",
  databaseURL: "https://social-a26cf-default-rtdb.firebaseio.com",
  projectId: "social-a26cf",
  storageBucket: "social-a26cf.firebasestorage.app",
  messagingSenderId: "351144305540",
  appId: "1:351144305540:web:08ff2d22059f1a707273d1",
  measurementId: "G-Z0FV8PGDDG"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM shortcut
const $ = (selector) => document.querySelector(selector);

// UI
const chatBox = document.getElementById("chat");
let chatHistory = [];
let lastAIResponse = "";

// Synonyms
const greetingSynonyms = ["hi", "hello", "hey", "hola", 'hy', 'hoy'];
const whoSynonyms = ["who made you", "who created you", "your creator"];



// Learn (store to both Firebase + localStorage)
function learn(key, value) {
  const cleanKey = key.toLowerCase().trim();
  localStorage.setItem(cleanKey, value);
  database.ref(`users/${userId}/memory/${cleanKey}`).set(value);
}

// Recall (try Firebase first, fallback to localStorage)
async function recall(key) {
  const cleanKey = key.toLowerCase().trim();
  try {
    const snapshot = await database.ref(`users/${userId}/memory/${cleanKey}`).once("value");
    if (snapshot.exists()) return snapshot.val();
    return localStorage.getItem(cleanKey);
  } catch (e) {
    return localStorage.getItem(cleanKey);
  }
}

// Process input
async function handle() {
  const inputField = document.getElementById("userInput");
  const input = inputField.value.trim().toLowerCase();
  inputField.value = "";
  chatAppend("You", input);

  chatHistory.push({ user: input });

  if (await processPersonalInfo(input)) return;

  if (input.startsWith("no,")) {
    const correction = input.replace("no,", "").trim();
    const [key, value] = correction.split(" = ");
    if (key && value) {
      learn(key, value);
      lastAIResponse = `Okay, I corrected "${key}" to "${value}"`;
      chatAppend("GPT", lastAIResponse);
    }
    return;
  }

  if (input.includes(" = ")) {
    const [key, value] = input.split(" = ");
    learn(key, value);
    lastAIResponse = `Learned: "${key}" = "${value}"`;
    chatAppend("GPT", lastAIResponse);
    return;
  }

  if (greetingSynonyms.some(g => input.includes(g))) {
    lastAIResponse = "Hello! 👋";
    chatAppend("GPT", lastAIResponse);
    return;
  }

  if (input.includes("how are you")) {
    lastAIResponse = "I'm a growing mind! Thanks!";
    chatAppend("GPT", lastAIResponse);
    return;
  }

  if (input.includes("who are you")) {
    lastAIResponse = `I'm an AI created by <b>Saheer Babu</b> 😄<br>And you?`;
    chatAppend("GPT", lastAIResponse);
    return;
  }

  if (whoSynonyms.some(w => input.includes(w))) {
    lastAIResponse = "Saheer Babu taught me! 😎";
    chatAppend("GPT", lastAIResponse);
    return;
  }

  const words = input.split(" ");
  for (let word of words) {
    const meaning = await recall(word);
    if (meaning) {
      lastAIResponse = `${word} is "${meaning}"`;
      chatAppend("GPT", lastAIResponse);
      return;
    }
  }

  if (input.startsWith("what is ")) {
    const unknown = input.replace("what is", "").trim();
    chatAppend("GPT", `I don't know "${unknown}". Can you teach me? Use: ${unknown} = meaning`);
    return;
  }
  
  

  lastAIResponse = "I don't know that yet. Teach me using: `word = meaning`";
  chatAppend("GPT", lastAIResponse);
}

// Show chat
function chatAppend(sender, msg) {
  chatBox.innerHTML += `<div class='chatParent ${sender.toLowerCase()}'><p class='${sender.toLowerCase()}'><b>${sender}:</b> ${msg}</p></div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Voice Output
function speakLast() {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(lastAIResponse);
    speechSynthesis.speak(utterance);
  } else {
    alert("Speech not supported");
  }
}

// Export memory (only local)
function exportMemory() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    data[k] = localStorage.getItem(k);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ai-memory.json";
  a.click();
}

// Import memory (local only)
function importMemory() {
  const json = document.getElementById("importData").value;
  try {
    const data = JSON.parse(json);
    for (let key in data) {
      learn(key, data[key]); // this will sync to Firebase also
    }
    alert("Memory imported successfully!");
  } catch (e) {
    alert("Invalid JSON!");
  }
}

// Process personal data
async function processPersonalInfo(input) {
  const patterns = [
    { pattern: /^my name is (.+)/, key: "my name", reply: name => `Nice to meet you, ${name}! 😊` },
    { pattern: /^i live in (.+)/, key: "my location", reply: loc => `Got it! You live in ${loc}. 🏡` },
    { pattern: /^i am (\d+) years old/, key: "my age", reply: age => `You are ${age} years old. 👶` },
    { pattern: /^my favorite color is (.+)/, key: "my color", reply: color => `Your favorite color is ${color}. 🎨` },
    { pattern: /^i'm (.+)/, key: "my name", reply: name => `Nice to meet you, ${name}! 😊` }
  ];

  for (const { pattern, key, reply } of patterns) {
    const match = input.match(pattern);
    if (match) {
      const value = match[1].trim();
      learn(key, value);
// Add this line after storing to local
database.ref(`users/${userId}/profile/${key}`).set(value);
      lastAIResponse = reply(value);
      chatAppend("GPT", lastAIResponse);
      return true;
    }
  }

  const recalls = {
    "what is my name": "my name",
    "where do i live": "my location",
    "how old am i": "my age",
    "what is my favorite color": "my color",
  };

  for (const phrase in recalls) {
    if (input.includes(phrase)) {
      const val = await recall(recalls[phrase]);
      if (val) {
        lastAIResponse = `Your ${recalls[phrase].replace("my ", "")} is ${val}.`;
      } else {
        lastAIResponse = `I don't know your ${recalls[phrase].replace("my ", "")} yet. Tell me: ${phrase.replace("what", "").trim()} is ___`;
      }
      chatAppend("GPT", lastAIResponse);
      return true;
    }
  }

  return false;
}



// Generate userID if not already stored
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = "user_" + Date.now();
  localStorage.setItem("userId", userId);
}