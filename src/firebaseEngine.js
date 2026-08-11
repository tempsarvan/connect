// Full Firebase Cloud Firestore & Authentication Engine for Connect
// Realtime Document Snapshots (onSnapshot), Anonymous Auth (signInAnonymously), & Dynamic Cloud Config

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  deleteDoc, 
  getDocs,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

let firebaseApp = null;
let db = null;
let auth = null;
let currentAuthUser = null;

// Read credentials from localStorage override or import.meta.env
export function getActiveFirebaseConfig() {
  const customConfig = localStorage.getItem("connect_firebase_config");
  if (customConfig) {
    try {
      const parsed = JSON.parse(customConfig);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch (e) {}
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForConnectApp1234567",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "connect-private.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "connect-private",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "connect-private.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:connectappdemo"
  };
}

export function saveFirebaseConfig(configObj) {
  if (configObj && configObj.apiKey && configObj.projectId) {
    localStorage.setItem("connect_firebase_config", JSON.stringify(configObj));
    initFirebase();
  }
}

export function initFirebase() {
  const config = getActiveFirebaseConfig();

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);

    // Enable IndexedDB offline persistence if available
    try {
      enableIndexedDbPersistence(db).catch(() => {});
    } catch (e) {}

    // Sign in anonymously to authenticate Firebase session
    signInAnonymously(auth)
      .then((userCredential) => {
        currentAuthUser = userCredential.user;
        console.log("🔥 Firebase Anonymous Auth Active:", currentAuthUser.uid);
      })
      .catch((err) => {
        console.warn("🔥 Firebase Auth Warning:", err.message);
      });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentAuthUser = user;
      }
    });

  } catch (err) {
    console.warn("🔥 Firebase Initialization Notice:", err.message);
  }

  return { app: firebaseApp, db, auth };
}

// Ensure Firebase is initialized
initFirebase();

export function getFirestoreDB() {
  if (!db) initFirebase();
  return db;
}

export function getFirebaseAuth() {
  if (!auth) initFirebase();
  return auth;
}

// ----------------------------------------------------
// Realtime Cloud Firestore Room Handshake & Messaging
// ----------------------------------------------------

export async function publishFirebaseHandshake(roomCode, payload) {
  const firestoreDB = getFirestoreDB();
  if (!firestoreDB || !roomCode) return;

  const cleanCode = roomCode.trim().toLowerCase();
  const roomRef = doc(firestoreDB, "rooms", cleanCode);

  try {
    await setDoc(roomRef, {
      code: roomCode,
      status: payload.status || "active",
      lastSignal: payload.type || "HANDSHAKE",
      updatedAt: serverTimestamp(),
      payload: JSON.stringify(payload)
    }, { merge: true });
  } catch (e) {}
}

export function listenFirebaseHandshake(roomCode, onHandshakeReceived) {
  const firestoreDB = getFirestoreDB();
  if (!firestoreDB || !roomCode) return () => {};

  const cleanCode = roomCode.trim().toLowerCase();
  const roomRef = doc(firestoreDB, "rooms", cleanCode);

  let isClosed = false;

  const unsubscribe = onSnapshot(roomRef, (snapshot) => {
    if (isClosed || !snapshot.exists()) return;
    const data = snapshot.data();
    if (data && onHandshakeReceived) {
      let payload = data;
      if (data.payload) {
        try { payload = JSON.parse(data.payload); } catch (e) {}
      }
      onHandshakeReceived(payload);
    }
  }, (err) => {
    console.warn("🔥 Firestore Room Snapshot Error:", err.message);
  });

  return () => {
    isClosed = true;
    try { unsubscribe(); } catch (e) {}
  };
}

export async function publishFirebaseChatMessage(roomCode, payload) {
  const firestoreDB = getFirestoreDB();
  if (!firestoreDB || !roomCode) return;

  const cleanCode = roomCode.trim().toLowerCase();
  const msgId = payload.message?.id || "msg_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const msgRef = doc(firestoreDB, "rooms", cleanCode, "messages", msgId);

  try {
    await setDoc(msgRef, {
      id: msgId,
      payload: JSON.stringify(payload),
      timestamp: Date.now(),
      createdAt: serverTimestamp()
    });
  } catch (e) {}
}

export function listenFirebaseChatMessages(roomCode, onMessageReceived) {
  const firestoreDB = getFirestoreDB();
  if (!firestoreDB || !roomCode) return () => {};

  const cleanCode = roomCode.trim().toLowerCase();
  const messagesRef = collection(firestoreDB, "rooms", cleanCode, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  let isClosed = false;

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (isClosed) return;
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        if (data && data.payload) {
          try {
            const payload = typeof data.payload === "string" ? JSON.parse(data.payload) : data.payload;
            onMessageReceived(payload);
          } catch (e) {}
        }
      }
    });
  }, (err) => {
    console.warn("🔥 Firestore Messages Snapshot Error:", err.message);
  });

  return () => {
    isClosed = true;
    try { unsubscribe(); } catch (e) {}
  };
}

export async function purgeFirebaseRoomMessages(roomCode) {
  const firestoreDB = getFirestoreDB();
  if (!firestoreDB || !roomCode) return;

  const cleanCode = roomCode.trim().toLowerCase();
  try {
    const messagesRef = collection(firestoreDB, "rooms", cleanCode, "messages");
    const snapshot = await getDocs(messagesRef);
    snapshot.docs.forEach((docSnap) => {
      deleteDoc(docSnap.ref).catch(() => {});
    });
    deleteDoc(doc(firestoreDB, "rooms", cleanCode)).catch(() => {});
  } catch (e) {}
}
