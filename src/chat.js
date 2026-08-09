import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";

// Local BroadcastChannel for instant cross-tab sync in dev/offline testing
let activeChannel = null;

export async function sendMessage(roomCode, uid, text) {
  if (!text || !text.trim()) return;
  
  const cleanText = text.trim();
  const messagesRef = collection(db, "rooms", roomCode, "messages");
  
  const msgObj = {
    sender: uid,
    text: cleanText,
    timestamp: serverTimestamp(),
    localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  try {
    await addDoc(messagesRef, msgObj);
  } catch (err) {
    console.warn("Firestore send message failed, broadcasting locally:", err);
  }

  // Also post to BroadcastChannel so multi-tab works instantly even if Firebase rules/network block
  if (activeChannel) {
    activeChannel.postMessage({
      type: "NEW_MESSAGE",
      sender: uid,
      text: cleanText,
      localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
}

export function listenToMessages(roomCode, uid, onMessagesUpdated) {
  const messagesRef = collection(db, "rooms", roomCode, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  // Set up BroadcastChannel
  if (activeChannel) {
    activeChannel.close();
  }
  activeChannel = new BroadcastChannel(`connect_room_${roomCode}`);

  const messagesMap = new Map();

  const notify = () => {
    const sorted = Array.from(messagesMap.values());
    onMessagesUpdated(sorted);
  };

  activeChannel.onmessage = (event) => {
    if (event.data && event.data.type === "NEW_MESSAGE") {
      const id = "local_" + Math.random().toString(36).substring(2, 9);
      messagesMap.set(id, {
        id,
        sender: event.data.sender,
        text: event.data.text,
        localTime: event.data.localTime
      });
      notify();
    } else if (event.data && event.data.type === "SESSION_ENDED") {
      messagesMap.clear();
      notify();
    }
  };

  const unsubscribe = onSnapshot(q, (snapshot) => {
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

        messagesMap.set(id, {
          id,
          sender: data.sender,
          text: data.text,
          localTime: timeStr
        });
      } else if (change.type === "removed") {
        messagesMap.delete(id);
      }
    });

    notify();
  }, (error) => {
    console.error("Messages listener error:", error);
  });

  return () => {
    unsubscribe();
    if (activeChannel) {
      activeChannel.close();
      activeChannel = null;
    }
  };
}

export function notifySessionEndedLocal(roomCode) {
  if (activeChannel) {
    activeChannel.postMessage({ type: "SESSION_ENDED" });
  }
}
