import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJk8A5p5HYuf_7Z2411klEVQWzxfoF_FM",
  authDomain: "eclipse-ec559.firebaseapp.com",
  projectId: "eclipse-ec559",
  storageBucket: "eclipse-ec559.appspot.com",
  messagingSenderId: "1081440763513",
  appId: "1:1081440763513:web:677b6590de995876399ea8",
  measurementId: "G-ZKFDV6894T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
