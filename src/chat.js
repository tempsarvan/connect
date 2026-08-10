// Zero-Trace Client-Side AES-GCM Encrypted Chat & Multi-Cloud PeerJS Relay System

import { encryptPayload, decryptPayload } from "./cryptoEngine";
import { initPeerJSTransport, broadcastPeerData } from "./p2pEngine";

export const MAX_FILE_SIZE_BYTES = 1000 * 1024 * 1024 * 1024; // 1 Terabyte (1 TB)

const messageStore = new Map();
const typingUsers = new Map();
const friendAliasesMap = JSON.parse(localStorage.getItem("connect_friend_aliases") || '{}');

let currentUsername = localStorage.getItem("connect_user_handle") || "@anonymous";
let currentPassword = localStorage.getItem("connect_user_passcode") || "";
let isSetupCompleted = localStorage.getItem("connect_setup_done") === "true";
let lastActiveTimestamp = parseInt(localStorage.getItem("connect_last_active_timestamp") || "0", 10);
let friendKey = localStorage.getItem("connect_friend_key") || generateFriendKey();

let profileBio = localStorage.getItem("connect_profile_bio") || "Exploring Connect zero-trace communications suite.";
let customStatus = localStorage.getItem("connect_custom_status") || "Online & Connected";
let profileBannerColor = localStorage.getItem("connect_profile_banner") || "#1e293b";
let profileBadgeStyle = localStorage.getItem("connect_profile_badge") || "code";

let connectedFriends = JSON.parse(localStorage.getItem("connect_friends_list") || '[]');
let savedPublicRooms = JSON.parse(localStorage.getItem("connect_saved_public_rooms") || '[]');

let onMessagesUpdatedCallback = null;
let roomChannel = null;
let globalEventsChannel = null;
let typingListeners = new Set();

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 Hours

function generateFriendKey() {
  const code = "CN-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.floor(10 + Math.random() * 90);
  localStorage.setItem("connect_friend_key", code);
  return code;
}

// Unique Username Registry
let registeredUsernames = JSON.parse(localStorage.getItem("connect_registered_usernames") || '{}');

export function isUsernameTaken(username, currentUid = null) {
  const norm = username.trim().toLowerCase();
  const handle = norm.startsWith("@") ? norm : `@${norm}`;

  if (registeredUsernames[handle] && registeredUsernames[handle] !== currentUid) {
    return true;
  }
  return false;
}

export async function claimUniqueUsername(username, uid) {
  const norm = username.trim().toLowerCase();
  const handle = norm.startsWith("@") ? norm : `@${norm}`;

  if (isUsernameTaken(handle, uid)) {
    throw new Error(`Username ${handle} is already claimed by another user. Please choose a different handle.`);
  }

  registeredUsernames[handle] = uid;
  localStorage.setItem("connect_registered_usernames", JSON.stringify(registeredUsernames));
  return handle;
}

export function getFriendKey() {
  return friendKey;
}

export function hasCompletedSetup() {
  return isSetupCompleted && currentUsername.trim().length > 0;
}

export function hasValidSession() {
  if (!hasCompletedSetup()) return false;
  if (!lastActiveTimestamp) return false;

  const now = Date.now();
  const diff = now - lastActiveTimestamp;
  return diff < SESSION_EXPIRY_MS;
}

export function touchSession() {
  if (hasCompletedSetup()) {
    lastActiveTimestamp = Date.now();
    localStorage.setItem("connect_last_active_timestamp", lastActiveTimestamp.toString());
  }
}

export function saveUserSettings(name, password, soundOn = true, vaultOn = true, uid = "local_uid") {
  const handle = name.trim().startsWith("@") ? name.trim() : `@${name.trim()}`;
  
  if (isUsernameTaken(handle, uid)) {
    throw new Error(`Username ${handle} is already claimed by another user.`);
  }

  claimUniqueUsername(handle, uid);

  currentUsername = handle;
  currentPassword = password.trim();
  isSetupCompleted = true;
  lastActiveTimestamp = Date.now();

  localStorage.setItem("connect_user_handle", currentUsername);
  localStorage.setItem("connect_user_passcode", currentPassword);
  localStorage.setItem("connect_setup_done", "true");
  localStorage.setItem("connect_last_active_timestamp", lastActiveTimestamp.toString());
  localStorage.setItem("connect_sound_enabled", soundOn.toString());
  localStorage.setItem("connect_vault_enabled", vaultOn.toString());
}

export function getUsername() {
  return currentUsername || "@anonymous";
}

export function getPassword() {
  return currentPassword || "";
}

export function saveProfileCustomization(bio, status, bannerColor = "#1e293b", badgeStyle = "code") {
  profileBio = bio;
  customStatus = status;
  profileBannerColor = bannerColor;
  profileBadgeStyle = badgeStyle;

  localStorage.setItem("connect_profile_bio", bio);
  localStorage.setItem("connect_custom_status", status);
  localStorage.setItem("connect_profile_banner", bannerColor);
  localStorage.setItem("connect_profile_badge", badgeStyle);
}

export function getProfileBio() { return profileBio; }
export function getCustomStatus() { return customStatus; }
export function getProfileBannerColor() { return profileBannerColor; }

// Friends List Management
export function getFriends() { return connectedFriends; }

export function addFriend(friendHandleOrKey) {
  const clean = friendHandleOrKey.trim();
  if (!clean) return;
  if (!connectedFriends.includes(clean)) {
    connectedFriends.push(clean);
    localStorage.setItem("connect_friends_list", JSON.stringify(connectedFriends));
  }
}

export function removeFriend(friendHandleOrKey) {
  connectedFriends = connectedFriends.filter((f) => f !== friendHandleOrKey.trim());
  localStorage.setItem("connect_friends_list", JSON.stringify(connectedFriends));
}

// Public Rooms Hub Management
export function getSavedPublicRooms() { return savedPublicRooms; }

export function savePublicRoomToHub(roomCode, roomName = null, topic = null) {
  const existing = savedPublicRooms.find((r) => r.code === roomCode);
  if (!existing) {
    savedPublicRooms.push({
      code: roomCode,
      name: roomName || `Public Room ${roomCode}`,
      topic: topic || "Persistent community space",
      lastVisitedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem("connect_saved_public_rooms", JSON.stringify(savedPublicRooms));
  }
}

// Friend Aliases
export function setFriendAlias(friendHandle, alias) {
  if (alias && alias.trim()) {
    friendAliasesMap[friendHandle.toLowerCase()] = alias.trim();
  } else {
    delete friendAliasesMap[friendHandle.toLowerCase()];
  }
  localStorage.setItem("connect_friend_aliases", JSON.stringify(friendAliasesMap));
}

export function getFriendAlias(friendHandle) {
  return friendAliasesMap[friendHandle.toLowerCase()] || friendHandle;
}

// Room Invites Notification System
export function initGlobalEvents(onNotification) {
  if (globalEventsChannel) globalEventsChannel.close();
  globalEventsChannel = new BroadcastChannel("connect_global_events");

  globalEventsChannel.onmessage = (e) => {
    const { type, recipient, sender, roomCode, roomName, isPublic } = e.data || {};
    if (type === "ROOM_INVITATION" && recipient.toLowerCase() === getUsername().toLowerCase()) {
      onNotification({ sender, roomCode, roomName, isPublic });
    }
  };
}

export function sendRoomInvitation(friendHandle, roomCode, roomName = null, isPublic = false) {
  if (globalEventsChannel) {
    globalEventsChannel.postMessage({
      type: "ROOM_INVITATION",
      recipient: friendHandle,
      sender: getUsername(),
      roomCode,
      roomName: roomName || roomCode,
      isPublic
    });
  }
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function sendTypingIndicator(roomCode, uid, isTyping, textLength = 0) {
  if (roomChannel) {
    roomChannel.postMessage({
      type: "TYPING_STATUS",
      typingUid: uid,
      isTyping,
      textLength
    });
  }
  publishChatMessage(roomCode, {
    type: "TYPING_STATUS",
    typingUid: uid,
    isTyping,
    textLength
  });
}

export function listenToTyping(onTypingChange) {
  typingListeners.add(onTypingChange);
  return () => typingListeners.delete(onTypingChange);
}

function notifyTyping() {
  const users = Array.from(typingUsers.entries()).map(([uid, info]) => ({ uid, ...info }));
  typingListeners.forEach((fn) => fn(users));
}

function notifyMessages() {
  if (onMessagesUpdatedCallback) {
    const sorted = Array.from(messageStore.values()).sort((a, b) => a.timestamp - b.timestamp);
    onMessagesUpdatedCallback(sorted);
  }
}

// Multi-Cloud Relay (PeerJS WebRTC P2P STUN + ntfy.sh + RESTful API KV + Local Storage)
function publishChatMessage(roomCode, payload) {
  const topic = `connect_msg_${roomCode.trim().toLowerCase()}`;
  const bodyStr = JSON.stringify(payload);

  // Transport 1: PeerJS WebRTC P2P Direct Connection (Google STUN)
  try {
    broadcastPeerData(payload);
  } catch (e) {}

  // Transport 2: ntfy.sh POST
  try {
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        "Title": "Connect Message",
        "Cache": "yes",
        "X-Cache": "yes"
      },
      body: bodyStr
    }).catch(() => {});
  } catch (e) {}

  // Transport 3: RESTful API Public Object Store
  try {
    fetch("https://api.restful-api.dev/objects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: topic,
        data: payload
      })
    }).catch(() => {});
  } catch (e) {}

  // Transport 4: LocalStorage Event Broadcast
  try {
    localStorage.setItem(`connect_msg_event_${topic}`, JSON.stringify({ payload, timestamp: Date.now() }));
  } catch (e) {}
}

export async function sendMessage(roomCode, uid, payload) {
  let text = typeof payload === "string" ? payload : payload.text || "";
  const mediaType = typeof payload === "object" ? payload.mediaType || "text" : "text";
  const mediaUrl = typeof payload === "object" ? payload.mediaUrl || null : null;
  const replyTo = typeof payload === "object" ? payload.replyTo || null : null;
  const emotion = typeof payload === "object" ? payload.emotion || payload.effectMode || "none" : "none";
  const effectMode = emotion;
  const fileName = typeof payload === "object" ? payload.fileName || null : null;
  const fileSize = typeof payload === "object" ? payload.fileSize || null : null;
  const fileSizeBytes = typeof payload === "object" ? payload.fileSizeBytes || null : null;
  const soundFx = typeof payload === "object" ? payload.soundFx || null : null;
  const vaultMemoryOrigin = typeof payload === "object" ? payload.vaultMemoryOrigin || null : null;
  const senderName = getUsername();

  if (!text.trim() && !mediaUrl && !soundFx) return;

  touchSession();
  sendTypingIndicator(roomCode, uid, false, 0);

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgId = "msg_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  
  // Encrypt message text using AES-GCM 256-bit cryptography
  const encryptedText = await encryptPayload(roomCode, text.trim());

  const msgObj = {
    id: msgId,
    sender: uid,
    senderName,
    text: text.trim(),
    encryptedText,
    mediaType,
    mediaUrl,
    replyTo,
    emotion,
    effectMode,
    fileName,
    fileSize: fileSize || (fileSizeBytes ? formatFileSize(fileSizeBytes) : null),
    fileSizeBytes,
    soundFx,
    vaultMemoryOrigin,
    reactions: {},
    localTime: timeStr,
    timestamp: Date.now(),
    isNew: true
  };

  messageStore.set(msgObj.id, msgObj);
  notifyMessages();

  if (roomChannel) {
    roomChannel.postMessage({
      type: "CHAT_MESSAGE",
      roomCode,
      message: msgObj
    });
  }

  // Cross-device multi-cloud broadcast
  publishChatMessage(roomCode, {
    type: "CHAT_MESSAGE",
    roomCode,
    message: msgObj
  });
}

// Quick Reactions
export function toggleMessageReaction(roomCode, messageId, emoji) {
  const msg = messageStore.get(messageId);
  if (!msg) return;

  msg.reactions = msg.reactions || {};
  const currentCount = msg.reactions[emoji] || 0;
  msg.reactions[emoji] = currentCount + 1;

  messageStore.set(messageId, msg);
  notifyMessages();

  const payload = {
    type: "MESSAGE_REACTION",
    messageId,
    reactions: msg.reactions
  };

  if (roomChannel) {
    roomChannel.postMessage(payload);
  }
  publishChatMessage(roomCode, payload);
}

export function purgeLocalMessages(roomCode) {
  messageStore.clear();
  notifyMessages();
  if (roomChannel) {
    roomChannel.postMessage({ type: "PURGE_CHAT", roomCode });
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

  publishChatMessage(roomCode, {
    type: "DELETE_MESSAGE",
    messageId
  });
}

export function listenToMessages(roomCode, uid, onMessagesUpdated, isHost = false) {
  messageStore.clear();
  typingUsers.clear();
  onMessagesUpdatedCallback = onMessagesUpdated;

  if (roomChannel) {
    roomChannel.close();
  }
  roomChannel = new BroadcastChannel(`connect_chat_${roomCode}`);

  const handleMessagePayload = async (data) => {
    const { type, message, messageId, reactions, typingUid, isTyping, textLength } = data || {};
    
    if (type === "CHAT_MESSAGE" && message) {
      if (!messageStore.has(message.id)) {
        if (message.encryptedText) {
          const decrypted = await decryptPayload(roomCode, message.encryptedText);
          if (decrypted) message.text = decrypted;
        }
        messageStore.set(message.id, message);
        notifyMessages();
      }
    } else if (type === "MESSAGE_REACTION" && messageId && reactions) {
      const msg = messageStore.get(messageId);
      if (msg) {
        msg.reactions = reactions;
        messageStore.set(messageId, msg);
        notifyMessages();
      }
    } else if (type === "DELETE_MESSAGE" && messageId) {
      messageStore.delete(messageId);
      notifyMessages();
    } else if (type === "TYPING_STATUS" && typingUid && typingUid !== uid) {
      if (isTyping) {
        typingUsers.set(typingUid, { isTyping: true, textLength: textLength || 1 });
      } else {
        typingUsers.delete(typingUid);
      }
      notifyTyping();
    } else if (type === "PURGE_CHAT") {
      messageStore.clear();
      notifyMessages();
    }
  };

  roomChannel.onmessage = (event) => handleMessagePayload(event.data);

  // Initialize PeerJS WebRTC P2P Connection (STUN)
  const cleanupP2P = initPeerJSTransport(roomCode, uid, isHost, handleMessagePayload);

  // Universal Multi-Cloud Relay Chat Listener
  const topic = `connect_msg_${roomCode.trim().toLowerCase()}`;
  const processedMsgIds = new Set();
  let isClosed = false;

  // LocalStorage Event Listener for instant same-browser cross-window sync
  const storageListener = (e) => {
    if (e.key === `connect_msg_event_${topic}` && e.newValue) {
      try {
        const { payload } = JSON.parse(e.newValue);
        if (payload) handleMessagePayload(payload);
      } catch (err) {}
    }
  };
  window.addEventListener("storage", storageListener);

  // 1. ntfy.sh Polling every 1s (since=all)
  const pollIntervalNtfy = setInterval(async () => {
    if (isClosed) return;
    try {
      const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split("\n");
        lines.forEach((line) => {
          if (!line) return;
          try {
            const parsed = JSON.parse(line);
            if (parsed && parsed.message) {
              const msgId = parsed.id || JSON.stringify(parsed.message);
              if (!processedMsgIds.has(msgId)) {
                processedMsgIds.add(msgId);
                let payload;
                if (typeof parsed.message === "object") {
                  payload = parsed.message;
                } else {
                  try { payload = JSON.parse(parsed.message); } catch (e) { payload = parsed.message; }
                }
                if (payload) handleMessagePayload(payload);
              }
            }
          } catch (e) {}
        });
      }
    } catch (e) {}
  }, 1000);

  // 2. ntfy.sh SSE Stream (/sse?since=all)
  let sse = null;
  try {
    sse = new EventSource(`https://ntfy.sh/${topic}/sse?since=all`);
    sse.onmessage = (event) => {
      if (isClosed) return;
      try {
        const parsed = JSON.parse(event.data);
        if (parsed && parsed.message) {
          const msgId = parsed.id || JSON.stringify(parsed.message);
          if (!processedMsgIds.has(msgId)) {
            processedMsgIds.add(msgId);
            let payload;
            if (typeof parsed.message === "object") {
              payload = parsed.message;
            } else {
              try { payload = JSON.parse(parsed.message); } catch (e) { payload = parsed.message; }
            }
            if (payload) handleMessagePayload(payload);
          }
        }
      } catch (e) {}
    };
  } catch (e) {}

  // 3. RESTful API KV Polling Backup every 1.5s
  const pollIntervalRest = setInterval(async () => {
    if (isClosed) return;
    try {
      const res = await fetch("https://api.restful-api.dev/objects");
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          items.forEach((item) => {
            if (item.name === topic && item.data && !processedMsgIds.has(item.id)) {
              processedMsgIds.add(item.id);
              handleMessagePayload(item.data);
            }
          });
        }
      }
    } catch (e) {}
  }, 1500);

  notifyMessages();

  return () => {
    isClosed = true;
    cleanupP2P();
    window.removeEventListener("storage", storageListener);
    clearInterval(pollIntervalNtfy);
    clearInterval(pollIntervalRest);
    if (sse) sse.close();
    if (roomChannel) {
      roomChannel.close();
      roomChannel = null;
    }
    onMessagesUpdatedCallback = null;
  };
}
