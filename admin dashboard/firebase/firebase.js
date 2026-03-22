// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCyJgkF6Zc3er5u6Iv25KiLXApY5_LHdlg",
  authDomain: "smart-restaurant-6a6dc.firebaseapp.com",
  projectId: "smart-restaurant-6a6dc",
  storageBucket: "smart-restaurant-6a6dc.firebasestorage.app",
  messagingSenderId: "639166420946",
  appId: "1:639166420946:web:37c451970ebb306fe85a0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);