// Connect Primary Firebase Module
import { 
  initFirebase, 
  getFirestoreDB, 
  getFirebaseAuth, 
  getActiveFirebaseConfig, 
  saveFirebaseConfig 
} from "./firebaseEngine";

const { app, db, auth } = initFirebase();

export const isConfigured = Boolean(
  getActiveFirebaseConfig().apiKey && 
  getActiveFirebaseConfig().apiKey !== "AIzaSyDemoKeyForConnectApp1234567"
);

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

export { app, db, auth, getActiveFirebaseConfig, saveFirebaseConfig };
