import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// firebase project configuration - copy-pasted from Firebase console
// (Project Settings -> General -> Your apps -> SDK setup and configuration)
const firebaseConfig = {
  apiKey: process.env.MY_API_KEY,
  authDomain: "binbot-0.firebaseapp.com",
  projectId: "binbot-0",
  storageBucket: "binbot-0.firebasestorage.app",
  messagingSenderId: "483195794662",
  appId: "1:483195794662:web:4096ccb29fa1e800127727",
  measurementId: "G-P9KWE8HEFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { 
    auth, 
    googleProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    db,
    collection,
    addDoc,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
};
