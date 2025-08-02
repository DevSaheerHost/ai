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
  
  
  
  const globalAnswer = await fetchGlobalKnowledge(input);
if (globalAnswer) {
  chatAppend("GPT", globalAnswer);
  return;
}


  // ✅ If user says "yes" after a suggestion
  if (input === "yes" && lastSuggestedWord && lastUserUnknownWord) {
  // First try to get from global
  let meaning = await globalRecall(lastSuggestedWord);

  // ✅ fallback if not found
  if (!meaning) {
    meaning = await fetchGlobalKnowledge(lastSuggestedWord);
  }

  if (meaning) {
    lastAIResponse = `${lastSuggestedWord} means: "${meaning}"`;
    chatAppend("GPT", lastAIResponse);

    // ✅ Auto-learn: wrong word → correct meaning
    learn(lastUserUnknownWord, meaning);

    // ✅ Reset memory
    lastSuggestedWord = null;
    lastUserUnknownWord = null;
  } else {
    chatAppend("GPT", `Sorry, I still couldn't find "${lastSuggestedWord}".`);
  }
  return;
}

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
  
  // ✅ ADD THIS LINE
  ensureGlobalKnowledge(key, value);
  
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
    let meaning = await recall(word);
    if (!meaning) {
      meaning = await globalRecall(word);
    }

    if (meaning) {
      lastAIResponse = `${word} means: "${meaning}"`;
      chatAppend("GPT", lastAIResponse);
      return;
    } else {
      // ❓ Not found → suggest
      
      // Before calling suggestSimilarWords()
const cleanedInput = input.replace(/s$/, ''); // "leds" => "led"

// Use cleanedInput in further logic
let meaning = await recall(cleanedInput);
if (!meaning) {
  meaning = await globalRecall(cleanedInput);
}

      const suggestions = await suggestSimilarWords(word);
      if (suggestions.length > 0) {
        lastSuggestedWord = suggestions[0];           // ✅ remember top suggestion
        lastUserUnknownWord = word;                   // ✅ remember unknown original
        lastAIResponse = `I don't know "${word}", but did you mean: ${suggestions.join(", ")}? 🤔`;
        chatAppend("GPT", lastAIResponse);
        return;
      }
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
// Change this inside chatAppend()
function chatAppend(sender, msg) {
  chatBox.innerHTML += `<div class='chatParent ${sender.toLowerCase()}'><p class='${sender.toLowerCase()}'><b>${sender}:</b> ${msg}</p></div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  // ✅ Temporarily store user + GPT pair for combined save
  if (sender === "You") {
    // Store user message to a variable
    window.__lastUserMessage = msg;
  } else if (sender === "GPT" && window.__lastUserMessage) {
    // Save both user & GPT message to Firebase as one object
    const timeId = Date.now();
    database.ref(`users/${userId}/chats/${timeId}`).set({
      user: window.__lastUserMessage,
      gpt: msg,
      time: new Date().toISOString()
    });

    // Clear temporary user msg
    window.__lastUserMessage = null;
  }
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




async function globalRecall(key) {
  const cleanKey = key.toLowerCase().trim().replace(/\s+/g, "_");
  try {
    const snapshot = await database.ref(`knowledge/${cleanKey}`).once("value");
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (e) {
    return null;
  }
}








async function fetchGlobalKnowledge(query) {
  const cleanKey = query.toLowerCase().trim().replace(/\s+/g, "_");
  
  // Try: what_is_water → water
  let keyword = cleanKey;
  if (cleanKey.startsWith("what_is_")) {
    keyword = cleanKey.replace("what_is_", "");
  } else if (cleanKey.startsWith("define_")) {
    keyword = cleanKey.replace("define_", "");
  } else if (cleanKey.startsWith("tell_me_about_")) {
    keyword = cleanKey.replace("tell_me_about_", "");
  }

  try {
    const snapshot = await database.ref(`global_knowledge/${keyword}`).once("value");
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (e) {
    console.error("Global knowledge fetch error:", e);
    return null;
  }
}





function levenshteinDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[a.length][b.length];
}

async function suggestSimilarWords(inputWord, threshold = 2) {
  const suggestions = [];
  const globalSnap = await database.ref("global_knowledge").once("value");
  const globalWords = globalSnap.exists() ? Object.keys(globalSnap.val()) : [];

  for (let word of globalWords) {
    const distance = levenshteinDistance(inputWord, word);
    if (distance <= threshold) {
      suggestions.push({ word, distance });
    }
  }

  suggestions.sort((a, b) => a.distance - b.distance);
  return suggestions.map(s => s.word);
}




async function ensureGlobalKnowledge(word, meaning) {
  const key = word.toLowerCase().trim().replace(/\s+/g, "_");
  const refPath = database.ref(`global_knowledge/${key}`);
  const snap = await refPath.once("value");
  if (!snap.exists()) {
    await refPath.set(meaning);
    console.log(`${word} added to global knowledge.`);
  } else {
    console.log(`${word} already exists.`);
  }
}

// Use this
ensureGlobalKnowledge("capacitor", "A device that stores electrical energy");