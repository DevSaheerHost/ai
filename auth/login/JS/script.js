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
const showHint = text=>{
    $("#hint").innerText=text
}
authenticate = (type) => {
    const userRef = database.ref("user");
    console.log(type);
  
    if (type === "login") {
      userRef.once("value", (snapshot) => {
        const users = snapshot.val();
  
        // Convert users object into an array
        const usersArray = Object.values(users); // This converts the object to an array of user objects
  
        const user = usersArray.find(
          (user) =>
            user.email === $("#loginEmail").value &&
            user.password === $("#loginPass").value
        );
  
        if (user) {
          // Success: user found and credentials match
          console.log("User logged in successfully");
        } else {
          // Failure: incorrect email or password
          showHint("Email or password is incorrect");
        }
      });
    } else if (type === "signup") {
      userRef.once("value", (snapshot) => {
        const users = snapshot.val();
  
        // Convert users object into an array
        const usersArray = Object.values(users); // This converts the object to an array of user objects
  
        const existingUser = usersArray.find(
          (user) =>
            user.email === $("#signupEmail").value ||
            user.number === $("#number").value
        );
  
        if (existingUser) {
          // Failure: email or number already registered
          showHint("This email ID or phone number is already registered!");
        } else {
          // Success: email and number are available
          showHint(""); // Clear any error hints if input is valid
          // Proceed with the signup process
          const newUser = {
            name: $("#name").value,
            email: $("#signupEmail").value,
            password: $("#signupPass").value,
            number: $("#number").value,
          };
  
          // Get the current number of users and use it as the new user ID
          const newUserId = Object.keys(users).length; // This gives the next available user ID
          
          // Upload the new user data to the database using a sequential user ID
          const newUserRef = userRef.child(newUserId.toString()); // Set user ID as "0", "1", "2", ...
          newUserRef.set(newUser)
            .then(() => {
              // Successfully uploaded user data
              console.log("User signed up successfully");
              showHint("Signup successful!"); // Display success message
            })
            .catch((error) => {
              // Handle error during data upload
              console.error("Error signing up user:", error);
              showHint("Error during signup. Please try again.");
            });
        }
      });
    }
  };
  