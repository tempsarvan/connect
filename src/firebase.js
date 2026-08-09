import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase Configuration
// If environment variables or custom config exist, use them.
// Default fallback provides standard initialization structure.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForConnectApp1234567",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "connect-private.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "connect-private",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "connect-private.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:connectappdemo"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
