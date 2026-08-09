import { auth } from "./firebase";
import { signInAnonymously } from "firebase/auth";

let currentUserUid = null;

export async function initAuth() {
  if (currentUserUid) return currentUserUid;

  try {
    const userCredential = await signInAnonymously(auth);
    currentUserUid = userCredential.user.uid;
    console.log("Firebase Anonymous Auth active:", currentUserUid);
    return currentUserUid;
  } catch (err) {
    console.warn("Firebase Auth unavailable/fallback mode:", err.message);
    // Generate a reliable local anonymous UID for session
    currentUserUid = "anon_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    return currentUserUid;
  }
}

export function getUserUid() {
  if (!currentUserUid) {
    currentUserUid = "anon_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }
  return currentUserUid;
}
