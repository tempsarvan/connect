import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
export const isConfigured = Boolean(apiKey && apiKey !== "AIzaSyDemoKeyForConnectApp1234567");

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyDemoKeyForConnectApp1234567",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "connect-private.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "connect-private",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "connect-private.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:connectappdemo"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Promise with timeout helper to prevent hanging on Firestore network retries
export function withTimeout(promise, ms = 1200) {
  if (!isConfigured) {
    return Promise.reject(new Error("Firebase not configured with active key"));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Firestore operation timed out"));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export { app, db, auth };
