const firebaseConfig = {
  apiKey: "AIzaSyC68KITEcmHfXHUzq0jXjKEoukO16wmI8I",
  authDomain: "social-a26cf.firebaseapp.com",
  databaseURL: "https://social-a26cf-default-rtdb.firebaseio.com",
  projectId: "social-a26cf",
  storageBucket: "social-a26cf.firebasestorage.app",
  messagingSenderId: "351144305540",
  appId: "1:351144305540:web:08ff2d22059f1a707273d1",
  measurementId: "G-Z0FV8PGDDG",
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

const $ = (selector) => document.querySelector(selector);

