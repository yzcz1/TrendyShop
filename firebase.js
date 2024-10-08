 // firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";

// Firebase configuration (reemplaza con la tuya de Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyDC2mtLD2R3kqCoO6Z492bsMK174PiB1JE",
    authDomain: "trendyshop-26c9d.firebaseapp.com",
    projectId: "trendyshop-26c9d",
    storageBucket: "trendyshop-26c9d.appspot.com",
    messagingSenderId: "932892165727",
    appId: "1:932892165727:web:8a94e215e2b14885c03dea",
    measurementId: "G-KD85X1GM3V"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail };

