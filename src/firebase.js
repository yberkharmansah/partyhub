// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGEXgqMKST4TguZSRz2Ts1AclGwEkoILs",
  authDomain: "partyhub-d1148.firebaseapp.com",
  projectId: "partyhub-d1148",
  storageBucket: "partyhub-d1148.firebasestorage.app",
  messagingSenderId: "952184980151",
  appId: "1:952184980151:web:31c5a2da05fcc8e2684332",
  measurementId: "G-2JEM7X6LFK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
