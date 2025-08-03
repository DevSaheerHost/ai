<<<<<<< HEAD
# super-simple-website
=======
# Sales App
>>>>>>> master



<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Chatbot v2</title>
  <style>
  *{
    box-sizing: border-box;
  }
    body { font-family: sans-serif; background: #f0f0f0; padding: 20px; }
    #chat { max-height: 300px; overflow-y: auto; background: #fff; padding: 10px; border-radius: 10px; margin-bottom: 10px; }
    p { margin: 4px 0; }
    input, button, textarea { margin: 5px 0; padding: 6px; }
    i{
      color: #959595;
      font-size: 14px;
    }
    .input_box{
      background: #fff;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2rem;
    }
    #chat{
      
    }
  </style>
</head>
<body>

<h2>🧠 AI Chatbot (Vanilla JS)</h2>

<div id="chat"></div>

<div class="input_box">
  
<input id="userInput" placeholder="Say something..." />
<button onclick="handle()">Send</button>
<button onclick="speakLast()">🔊</button>
<br>


  

<textarea id="importData" placeholder="Paste memory JSON here..." rows="3" cols="40"></textarea><br>
<button onclick="importMemory()">📥 Import Memory</button>
<button onclick="exportMemory()">📤 Export Memory</button>
</div>
<script>
const chatBox = document.getElementById("chat");
let chatHistory = [];
let lastAIResponse = "";

// Synonyms
const greetingSynonyms = ["hi", "hello", "hey", "hola"];
const whoSynonyms = ["who made you", "who created you", "your creator"];

function learn(key, value) {
  localStorage.setItem(key.toLowerCase(), value);
}

function recall(key) {
  return localStorage.getItem(key.toLowerCase());
}

function handle() {
  const inputField = document.getElementById("userInput");
  const input = inputField.value.trim().toLowerCase();
  inputField.value = "";
  chatAppend("🧑", input);

  chatHistory.push({ user: input });
  
  // add person info
  // Inside handle()
if (processPersonalInfo(input)) return;

  // Correction
  if (input.startsWith("no,")) {
    const correction = input.replace("no,", "").trim();
    const [key, value] = correction.split(" = ");
    if (key && value) {
      learn(key, value);
      lastAIResponse = `Okay, I corrected "${key}" to "${value}"`;
      chatAppend("🤖", lastAIResponse);
    }
    return;
  }

  // Learning
  if (input.includes(" = ")) {
    const [key, value] = input.split(" = ");
    learn(key, value);
    lastAIResponse = `Learned: "${key}" = "${value}"`;
    chatAppend("🤖", lastAIResponse);
    return;
  }

  // Synonym match
  if (greetingSynonyms.some(g => input.includes(g))) {
    lastAIResponse = "Hello! 👋";
    chatAppend("🤖", lastAIResponse);
    return;
  }

  if (input.includes("how are you")) {
    lastAIResponse = "I'm a growing mind! Thanks!";
    chatAppend("🤖", lastAIResponse);
    return;
  }
  
  if (input.includes("who are you")) {
    lastAIResponse = `I'm a AI! Created by <b>Saheer Babu!</b>
    
    <br>And you?<br>
    
    <i>
    including Who created you...</i>
    `;
    chatAppend("🤖", lastAIResponse);
    return;
  }

  if (whoSynonyms.some(w => input.includes(w))) {
    lastAIResponse = "Saheer Babu taught me! 😎";
    chatAppend("🤖", lastAIResponse);
    return;
  }

  // Recall
  const words = input.split(" ");
  for (let word of words) {
    const meaning = recall(word);
    if (meaning) {
      lastAIResponse = `${word} is "${meaning}"`;
      chatAppend("🤖", lastAIResponse);
      return;
    }
  }
  
  
  function translate(term) {
  const dictionary = JSON.parse(localStorage.getItem("dictionary") || "{}");

  if (dictionary[term]) {
    return dictionary[term];
  } else {
    // Save to unknown_terms
    if (!dictionary.unknown_terms) dictionary.unknown_terms = {};
    if (!dictionary.unknown_terms[term]) {
      dictionary.unknown_terms[term] = "";
      localStorage.setItem("dictionary", JSON.stringify(dictionary));
    }
    return "(Unknown term - added for review)";
  }
}
  // Try to auto-detect unknown query pattern like "what is XYZ"
if (input.startsWith("what is ")) {
  const unknown = input.replace("what is", "").trim();
  chatAppend("🤖", `I don't know "${unknown}". Can you teach me? Use: ${unknown} = meaning`);
  return;
}
  
  

  // Unknown
  lastAIResponse = "I don't know that yet. Teach me using: `word = meaning`";
  chatAppend("🤖", lastAIResponse);
}

// Display chat
function chatAppend(sender, msg) {
  chatBox.innerHTML += `<p><b>${sender}:</b> ${msg}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Voice output
function speakLast() {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(lastAIResponse);
    speechSynthesis.speak(utterance);
  } else {
    alert("Speech not supported");
  }
}

// Export memory as JSON
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

// Import memory from textarea
function importMemory() {
  const json = document.getElementById("importData").value;
  try {
    const data = JSON.parse(json);
    for (let key in data) {
      localStorage.setItem(key.toLowerCase(), data[key]);
    }
    alert("Memory imported successfully!");
  } catch (e) {
    alert("Invalid JSON!");
  }
}





function processPersonalInfo(input) {
  const patterns = [
    { pattern: /^my name is (.+)/, key: "my name", reply: name => `Nice to meet you, ${name}! 😊` },
    { pattern: /^i live in (.+)/, key: "my location", reply: loc => `Got it! You live in ${loc}. 🏡` },
    { pattern: /^i am (\d+) years old/, key: "my age", reply: age => `You are ${age} years old. 👶` },
    { pattern: /^my favorite color is (.+)/, key: "my color", reply: color => `Your favorite color is ${color}. 🎨` },
  ];

  for (const { pattern, key, reply } of patterns) {
    const match = input.match(pattern);
    if (match) {
      const value = match[1].trim();
      learn(key, value);
      lastAIResponse = reply(value);
      chatAppend("🤖", lastAIResponse);
      return true; // means handled
    }
  }

  // Recall triggers
  const recalls = {
    "what is my name": "my name",
    "where do i live": "my location",
    "how old am i": "my age",
    "what is my favorite color": "my color",
  };

  for (const phrase in recalls) {
    if (input.includes(phrase)) {
      const val = recall(recalls[phrase]);
      if (val) {
        lastAIResponse = `Your ${recalls[phrase].replace("my ", "")} is ${val}.`;
      } else {
        lastAIResponse = `I don't know your ${recalls[phrase].replace("my ", "")} yet. Tell me: ${phrase.replace("what", "").trim()} is ___`;
      }
      chatAppend("🤖", lastAIResponse);
      return true;
    }
  }

  return false; // not handled
}
</script>

</body>
</html>





users
 └── user_1690983423
     ├── memory
     │    ├── motherboard: "PCB which connects components"
     │    └── capacitor: "stores electrical energy"
     └── profile
          ├── my name: "Saheer"
          └── my location: "Malappuram"
          
          
          
          
          
users
 └── user_1723457623
     ├── memory
     ├── profile
     └── chats
         ├── -N8asdasdas123
         │    ├── sender: "You"
         │    ├── message: "what is motherboard"
         │    └── timestamp: 1723457623000
         └── -N8asdasdas124
              ├── sender: "GPT"
              ├── message: "motherboard is 'PCB where...'"
              └── timestamp: ...
              
              
              
knowledge/
  ├── water_is_liquid: "Water is a liquid"
  ├── motherboard: "A main circuit board in a computer or mobile"
  ├── capacitor: "Stores electrical energy in a circuit"
  
  
  
  
  
  
  async function uploadGlobalKnowledgeFromJSON() {
  try {
    const response = await fetch('data.json'); // Make sure this file is accessible in your server/public folder
    const globalData = await response.json();

    for (const key in globalData) {
      const cleanKey = key.toLowerCase().trim().replace(/\s+/g, "_");
      const answer = globalData[key];
      await firebase.database().ref(`global_knowledge/${cleanKey}`).set(answer);
      console.log(`✅ Uploaded: ${cleanKey}`);
    }

    alert("✅ All global knowledge uploaded!");
  } catch (err) {
    console.error("🔥 Error uploading global knowledge:", err);
    alert("❌ Failed to upload global knowledge.");
  }
}


//document.body.onclick=()=>uploadGlobalKnowledgeFromJSON()