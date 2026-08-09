import { auth } from "./firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

let currentUser = null;

export async function initAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        resolve(user);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          currentUser = userCredential.user;
          resolve(currentUser);
        } catch (error) {
          console.error("Anonymous authentication failed:", error);
          reject(error);
        }
      }
      unsubscribe();
    });
  });
}

export function getCurrentUser() {
  return currentUser || auth.currentUser;
}

export function getUserUid() {
  const user = getCurrentUser();
  return user ? user.uid : null;
}
