import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, collection, query, orderBy } from "firebase/firestore"; // Añadir query y orderBy

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
const db = getFirestore(app); // Inicializar Firestore

// Exportar funcionalidades de Firebase, incluyendo query y orderBy
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, sendPasswordResetEmail, setDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, collection, query, orderBy };