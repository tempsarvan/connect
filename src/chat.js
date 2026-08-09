import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";

let roomChannel = null;
const messageStore = new Map();

export async function sendMessage(roomCode, uid, text) {
  if (!text || !text.trim()) return;

  const cleanText = text.trim();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const msgObj = {
    id: "msg_" + Math.random().toString(36).substring(2, 11),
    sender: uid,
    text: cleanText,
    localTime: timeStr,
    timestamp: Date.now()
  };

  // Broadcast to other tabs instantly
  if (roomChannel) {
    roomChannel.postMessage({
      type: "CHAT_MESSAGE",
      roomCode,
      message: msgObj
    });
  }

  // Also add to local store
  messageStore.set(msgObj.id, msgObj);

  // Try Firestore in background
  try {
    const messagesRef = collection(db, "rooms", roomCode, "messages");
    await addDoc(messagesRef, {
      sender: uid,
      text: cleanText,
      localTime: timeStr,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    // Firestore write bypassed
  }
}

export function listenToMessages(roomCode, uid, onMessagesUpdated) {
  // Clear local message store for new room
  messageStore.clear();

  if (roomChannel) {
    roomChannel.close();
  }
  roomChannel = new BroadcastChannel(`connect_chat_${roomCode}`);

  const notify = () => {
    const sorted = Array.from(messageStore.values()).sort((a, b) => a.timestamp - b.timestamp);
    onMessagesUpdated(sorted);
  };

  // BroadcastChannel listener for multi-tab chat
  roomChannel.onmessage = (event) => {
    const { type, message } = event.data || {};
    if (type === "CHAT_MESSAGE" && message) {
      messageStore.set(message.id, message);
      notify();
    } else if (type === "PURGE_CHAT") {
      messageStore.clear();
      notify();
    }
  };

  // Firestore listener
  let unsubFirestore = null;
  try {
    const messagesRef = collection(db, "rooms", roomCode, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    
    unsubFirestore = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const data = change.doc.data();

        if (change.type === "added") {
          let timeStr = data.localTime;
          if (data.timestamp && data.timestamp.toDate) {
            timeStr = data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (!timeStr) {
            timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }

          messageStore.set(id, {
            id,
            sender: data.sender,
            text: data.text,
            localTime: timeStr,
            timestamp: data.timestamp ? data.timestamp.toMillis() : Date.now()
          });
        } else if (change.type === "removed") {
          messageStore.delete(id);
        }
      });
      notify();
    });
  } catch (err) {
    // Firestore listener bypassed
  }

  // Initial notification
  notify();

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (roomChannel) {
      roomChannel.close();
      roomChannel = null;
    }
  };
}

export function purgeLocalMessages(roomCode) {
  messageStore.clear();
  if (roomChannel) {
    roomChannel.postMessage({ type: "PURGE_CHAT" });
  }
}
