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
let onMessagesUpdatedCallback = null;

// Persistent User Settings & System Memory (Username, Passcode PIN, Preferences)
let currentUsername = localStorage.getItem("connect_username") || "";
let currentPassword = localStorage.getItem("connect_password") || "";
let isSoundEnabled = localStorage.getItem("connect_sound_enabled") !== "false";
let isSetupCompleted = localStorage.getItem("connect_setup_completed") === "true";
let savedVaultMessages = JSON.parse(localStorage.getItem("connect_saved_vault") || "[]");

export function hasCompletedSetup() {
  return isSetupCompleted && currentUsername.trim().length > 0;
}

export function saveUserSettings(name, password, soundOn = true) {
  currentUsername = name.trim() || "Anonymous";
  currentPassword = password.trim();
  isSoundEnabled = soundOn;
  isSetupCompleted = true;

  localStorage.setItem("connect_username", currentUsername);
  localStorage.setItem("connect_password", currentPassword);
  localStorage.setItem("connect_sound_enabled", isSoundEnabled ? "true" : "false");
  localStorage.setItem("connect_setup_completed", "true");

  return { username: currentUsername, password: currentPassword, soundEnabled: isSoundEnabled };
}

export function getUsername() {
  return currentUsername || "Anonymous";
}

export function getPassword() {
  return currentPassword;
}

export function getSoundEnabled() {
  return isSoundEnabled;
}

export function getSavedVaultMessages() {
  return savedVaultMessages;
}

export function saveMessageToVault(msg) {
  if (!savedVaultMessages.some((m) => m.id === msg.id)) {
    savedVaultMessages.push(msg);
    localStorage.setItem("connect_saved_vault", JSON.stringify(savedVaultMessages));
  }
}

export function removeSavedMessageFromVault(msgId) {
  savedVaultMessages = savedVaultMessages.filter((m) => m.id !== msgId);
  localStorage.setItem("connect_saved_vault", JSON.stringify(savedVaultMessages));
  return savedVaultMessages;
}

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

function notifyMessages() {
  if (onMessagesUpdatedCallback) {
    const sorted = Array.from(messageStore.values()).sort((a, b) => a.timestamp - b.timestamp);
    onMessagesUpdatedCallback(sorted);
  }
}

export async function sendMessage(roomCode, uid, payload) {
  let text = typeof payload === "string" ? payload : payload.text || "";
  const mediaType = typeof payload === "object" ? payload.mediaType || "text" : "text";
  const mediaUrl = typeof payload === "object" ? payload.mediaUrl || null : null;
  const replyTo = typeof payload === "object" ? payload.replyTo || null : null;
  const effectMode = typeof payload === "object" ? payload.effectMode || "normal" : "normal";
  const fileName = typeof payload === "object" ? payload.fileName || null : null;
  const fileSize = typeof payload === "object" ? payload.fileSize || null : null;
  const soundFx = typeof payload === "object" ? payload.soundFx || null : null;
  const senderName = getUsername();

  if (!text.trim() && !mediaUrl && !soundFx) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgId = "msg_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  
  const msgObj = {
    id: msgId,
    sender: uid,
    senderName,
    text: text.trim(),
    mediaType,
    mediaUrl,
    replyTo,
    effectMode,
    fileName,
    fileSize,
    soundFx,
    reactions: {},
    localTime: timeStr,
    timestamp: Date.now(),
    isNew: true
  };

  // 1. Instantly store locally & trigger synchronous UI render for sender!
  messageStore.set(msgObj.id, msgObj);
  notifyMessages();

  // 2. Broadcast to other tabs instantly
  if (roomChannel) {
    roomChannel.postMessage({
      type: "CHAT_MESSAGE",
      roomCode,
      message: msgObj
    });
  }

  // 3. Try Firestore in background if configured
  if (isConfigured) {
    withTimeout(addDoc(collection(db, "rooms", roomCode, "messages"), {
      sender: uid,
      senderName,
      text: text.trim(),
      mediaType,
      mediaUrl,
      replyTo,
      effectMode,
      fileName,
      fileSize,
      soundFx,
      reactions: {},
      localTime: timeStr,
      timestamp: serverTimestamp()
    }), 1000).catch(() => {});
  }
}

export function deleteMessage(roomCode, messageId) {
  messageStore.delete(messageId);
  notifyMessages();

  if (roomChannel) {
    roomChannel.postMessage({
      type: "DELETE_MESSAGE",
      messageId
    });
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
  notifyMessages();

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
  onMessagesUpdatedCallback = onMessagesUpdated;

  if (roomChannel) {
    roomChannel.close();
  }
  roomChannel = new BroadcastChannel(`connect_chat_${roomCode}`);

  roomChannel.onmessage = (event) => {
    const { type, message, messageId, reactions, uid: typingUid, isTyping } = event.data || {};
    
    if (type === "CHAT_MESSAGE" && message) {
      if (!messageStore.has(message.id)) {
        messageStore.set(message.id, message);
        notifyMessages();
      }
    } else if (type === "DELETE_MESSAGE" && messageId) {
      messageStore.delete(messageId);
      notifyMessages();
    } else if (type === "MESSAGE_REACTION" && messageId) {
      const existing = messageStore.get(messageId);
      if (existing) {
        existing.reactions = reactions;
        messageStore.set(messageId, existing);
        notifyMessages();
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
      notifyMessages();
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

            if (!messageStore.has(id)) {
              messageStore.set(id, {
                id,
                sender: data.sender,
                senderName: data.senderName || "Anonymous",
                text: data.text || "",
                mediaType: data.mediaType || "text",
                mediaUrl: data.mediaUrl || null,
                replyTo: data.replyTo || null,
                effectMode: data.effectMode || "normal",
                fileName: data.fileName || null,
                fileSize: data.fileSize || null,
                soundFx: data.soundFx || null,
                reactions: data.reactions || {},
                localTime: timeStr,
                timestamp: data.timestamp ? data.timestamp.toMillis() : Date.now()
              });
            }
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
        notifyMessages();
      });
    } catch (err) {}
  }

  notifyMessages();

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (roomChannel) {
      roomChannel.close();
      roomChannel = null;
    }
    onMessagesUpdatedCallback = null;
  };
}

export function purgeLocalMessages(roomCode) {
  messageStore.clear();
  if (roomChannel) {
    roomChannel.postMessage({ type: "PURGE_CHAT" });
  }
  notifyMessages();
}
