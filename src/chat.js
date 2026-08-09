import { db, isConfigured, withTimeout } from "./firebase";
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
const typingUsers = new Set();
let typingListeners = new Set();

export function sendTypingIndicator(roomCode, uid, isTyping) {
  if (roomChannel) {
    roomChannel.postMessage({
      type: "TYPING_STATUS",
      uid,
      isTyping
    });
  }
}

export function listenToTyping(onTypingChange) {
  typingListeners.add(onTypingChange);
  return () => typingListeners.delete(onTypingChange);
}

function notifyTyping() {
  const users = Array.from(typingUsers);
  typingListeners.forEach((fn) => fn(users));
}

export async function sendMessage(roomCode, uid, payload) {
  // payload can be text or object: { text, mediaType: 'image'|'gif'|'sticker'|'audio', mediaUrl, replyTo }
  let text = typeof payload === "string" ? payload : payload.text || "";
  const mediaType = typeof payload === "object" ? payload.mediaType || "text" : "text";
  const mediaUrl = typeof payload === "object" ? payload.mediaUrl || null : null;
  const replyTo = typeof payload === "object" ? payload.replyTo || null : null;

  if (!text.trim() && !mediaUrl) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const msgObj = {
    id: "msg_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
    sender: uid,
    text: text.trim(),
    mediaType,
    mediaUrl,
    replyTo,
    reactions: {}, // { emoji: [uid1, uid2] }
    localTime: timeStr,
    timestamp: Date.now()
  };

  messageStore.set(msgObj.id, msgObj);

  if (roomChannel) {
    roomChannel.postMessage({
      type: "CHAT_MESSAGE",
      roomCode,
      message: msgObj
    });
  }

  if (isConfigured) {
    withTimeout(addDoc(collection(db, "rooms", roomCode, "messages"), {
      sender: uid,
      text: text.trim(),
      mediaType,
      mediaUrl,
      replyTo,
      reactions: {},
      localTime: timeStr,
      timestamp: serverTimestamp()
    }), 1000).catch(() => {});
  }
}

export function toggleReaction(roomCode, messageId, emoji, uid) {
  const msg = messageStore.get(messageId);
  if (!msg) return;

  if (!msg.reactions) msg.reactions = {};
  if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

  const userIdx = msg.reactions[emoji].indexOf(uid);
  if (userIdx >= 0) {
    msg.reactions[emoji].splice(userIdx, 1);
    if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
  } else {
    msg.reactions[emoji].push(uid);
  }

  messageStore.set(messageId, msg);

  if (roomChannel) {
    roomChannel.postMessage({
      type: "MESSAGE_REACTION",
      messageId,
      reactions: msg.reactions
    });
  }
}

export function listenToMessages(roomCode, uid, onMessagesUpdated) {
  messageStore.clear();
  typingUsers.clear();

  if (roomChannel) {
    roomChannel.close();
  }
  roomChannel = new BroadcastChannel(`connect_chat_${roomCode}`);

  const notify = () => {
    const sorted = Array.from(messageStore.values()).sort((a, b) => a.timestamp - b.timestamp);
    onMessagesUpdated(sorted);
  };

  roomChannel.onmessage = (event) => {
    const { type, message, messageId, reactions, uid: typingUid, isTyping } = event.data || {};
    
    if (type === "CHAT_MESSAGE" && message) {
      messageStore.set(message.id, message);
      notify();
    } else if (type === "MESSAGE_REACTION" && messageId) {
      const existing = messageStore.get(messageId);
      if (existing) {
        existing.reactions = reactions;
        messageStore.set(messageId, existing);
        notify();
      }
    } else if (type === "TYPING_STATUS" && typingUid !== uid) {
      if (isTyping) {
        typingUsers.add(typingUid);
      } else {
        typingUsers.delete(typingUid);
      }
      notifyTyping();
    } else if (type === "PURGE_CHAT") {
      messageStore.clear();
      notify();
    }
  };

  let unsubFirestore = null;
  if (isConfigured) {
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
              text: data.text || "",
              mediaType: data.mediaType || "text",
              mediaUrl: data.mediaUrl || null,
              replyTo: data.replyTo || null,
              reactions: data.reactions || {},
              localTime: timeStr,
              timestamp: data.timestamp ? data.timestamp.toMillis() : Date.now()
            });
          } else if (change.type === "modified") {
            const existing = messageStore.get(id);
            if (existing) {
              existing.reactions = data.reactions || {};
              messageStore.set(id, existing);
            }
          } else if (change.type === "removed") {
            messageStore.delete(id);
          }
        });
        notify();
      });
    } catch (err) {}
  }

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
