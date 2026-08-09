import { db, isConfigured, withTimeout } from "./firebase";
import { 
  collection, 
  addDoc, 
  doc,
  setDoc,
  getDoc,
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";

let roomChannel = null;
let globalEventsChannel = null;
let ntfyChatEventSource = null;
const messageStore = new Map();
const typingUsers = new Map();
let typingListeners = new Set();
let onMessagesUpdatedCallback = null;

// Persistent Device Session (3 Days Inactivity Expiry Threshold)
const SESSION_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000;

// Maximum File Size Limit: 1 Terabyte (1 TB / 1,000 GB)
export const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024 * 1024; // 1 TB

let currentUsername = localStorage.getItem("connect_username") || "";
let currentPassword = localStorage.getItem("connect_password") || "";
let profileBio = localStorage.getItem("connect_profile_bio") || "Exploring Connect zero-trace communications suite.";
let customStatus = localStorage.getItem("connect_custom_status") || "Online & Connected";
let profileBannerColor = localStorage.getItem("connect_profile_banner") || "#3b82f6";
let profileAvatarIcon = localStorage.getItem("connect_avatar_icon") || "code";

// Generate or load permanent 8-character Unique Friend Key (e.g. CN-9X4A-82)
let friendKey = localStorage.getItem("connect_friend_key") || "";
if (!friendKey) {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let r1 = "", r2 = "";
  for (let i = 0; i < 4; i++) r1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 2; i++) r2 += Math.floor(Math.random() * 10);
  friendKey = `CN-${r1}-${r2}`;
  localStorage.setItem("connect_friend_key", friendKey);
}

let isSoundEnabled = localStorage.getItem("connect_sound_enabled") !== "false";
let isVaultEnabled = localStorage.getItem("connect_vault_enabled") !== "false";
let isSetupCompleted = localStorage.getItem("connect_setup_completed") === "true";
let lastActiveTimestamp = parseInt(localStorage.getItem("connect_last_active_timestamp") || "0", 10);

// Real User Friends List
let friendsList = JSON.parse(localStorage.getItem("connect_friends_list") || '[]');

let peerVaultDisabled = false;

// Persistent Saved Public Rooms Section (Dynamic Expanding Array)
let savedPublicRooms = JSON.parse(localStorage.getItem("connect_saved_public_rooms") || '[]');

export function getSavedPublicRooms() {
  return savedPublicRooms;
}

export function savePublicRoomToHub(roomCode, roomName = null, topic = null) {
  const code = roomCode.toUpperCase();
  const existingIdx = savedPublicRooms.findIndex((r) => r.code === code);
  
  const name = roomName || `Public Room ${code}`;
  const roomTopic = topic || "Persistent community space";

  const roomObj = {
    code,
    name,
    topic: roomTopic,
    lastVisitedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  if (existingIdx >= 0) {
    savedPublicRooms[existingIdx] = roomObj;
  } else {
    savedPublicRooms.unshift(roomObj);
  }

  localStorage.setItem("connect_saved_public_rooms", JSON.stringify(savedPublicRooms));
  return savedPublicRooms;
}

export function removeSavedPublicRoom(roomCode) {
  savedPublicRooms = savedPublicRooms.filter((r) => r.code !== roomCode.toUpperCase());
  localStorage.setItem("connect_saved_public_rooms", JSON.stringify(savedPublicRooms));
  return savedPublicRooms;
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

  if (isConfigured) {
    try {
      const userRef = doc(db, "usernames", handle);
      const snap = await withTimeout(getDoc(userRef), 1500);
      if (snap.exists() && snap.data().uid !== uid) {
        throw new Error(`Username ${handle} is already claimed in the global network.`);
      }
      await withTimeout(setDoc(userRef, { uid, friendKey, claimedAt: serverTimestamp() }), 1500);
    } catch (err) {
      if (err.message && err.message.includes("already claimed")) throw err;
    }
  }

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
  isSoundEnabled = soundOn;
  isVaultEnabled = vaultOn;
  isSetupCompleted = true;
  lastActiveTimestamp = Date.now();

  localStorage.setItem("connect_username", currentUsername);
  localStorage.setItem("connect_password", currentPassword);
  localStorage.setItem("connect_sound_enabled", isSoundEnabled ? "true" : "false");
  localStorage.setItem("connect_vault_enabled", isVaultEnabled ? "true" : "false");
  localStorage.setItem("connect_setup_completed", "true");
  localStorage.setItem("connect_last_active_timestamp", lastActiveTimestamp.toString());

  return { username: currentUsername, password: currentPassword, friendKey, soundEnabled: isSoundEnabled, vaultEnabled: isVaultEnabled };
}

export function saveProfileCustomization(bio, status, bannerColor, avatarIcon) {
  profileBio = bio.trim() || "Exploring Connect zero-trace communications suite.";
  customStatus = status.trim() || "Online & Connected";
  profileBannerColor = bannerColor || "#3b82f6";
  profileAvatarIcon = avatarIcon || "code";

  localStorage.setItem("connect_profile_bio", profileBio);
  localStorage.setItem("connect_custom_status", customStatus);
  localStorage.setItem("connect_profile_banner", profileBannerColor);
  localStorage.setItem("connect_avatar_icon", profileAvatarIcon);

  return { bio: profileBio, status: customStatus, bannerColor: profileBannerColor, avatarIcon: profileAvatarIcon };
}

export function getProfileBio() {
  return profileBio;
}

export function getCustomStatus() {
  return customStatus;
}

export function getProfileBannerColor() {
  return profileBannerColor;
}

export function getUsername() {
  return currentUsername || "@anonymous";
}

export function getPassword() {
  return currentPassword;
}

export function getFriends() {
  return friendsList;
}

export function addFriend(inputVal) {
  const raw = inputVal.trim();
  let handle = raw;

  if (!raw) {
    throw new Error("Please enter a username or Friend Key.");
  }

  if (raw.toUpperCase().startsWith("CN-")) {
    handle = `@user_${raw.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
  } else {
    const norm = raw.toLowerCase();
    handle = norm.startsWith("@") ? norm : `@${norm}`;
  }

  if (handle.toLowerCase() === getUsername().toLowerCase()) {
    throw new Error("You cannot add yourself as a friend.");
  }

  if (friendsList.some((f) => f.toLowerCase() === handle.toLowerCase())) {
    throw new Error(`${handle} is already in your friends list.`);
  }

  friendsList.push(handle);
  localStorage.setItem("connect_friends_list", JSON.stringify(friendsList));

  if (!registeredUsernames[handle]) {
    registeredUsernames[handle] = `uid_${handle.replace('@', '')}`;
    localStorage.setItem("connect_registered_usernames", JSON.stringify(registeredUsernames));
  }

  return friendsList;
}

export function removeFriend(friendHandle) {
  friendsList = friendsList.filter((f) => f.toLowerCase() !== friendHandle.toLowerCase());
  localStorage.setItem("connect_friends_list", JSON.stringify(friendsList));
  return friendsList;
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
      uid,
      isTyping,
      textLength
    });
  }
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

// Zero-Config Global Real-time Pub/Sub Chat Sync over ntfy.sh
function publishNtfyMessage(roomCode, payload) {
  try {
    fetch(`https://ntfy.sh/connect_chat_msg_${roomCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {}
}

export async function sendMessage(roomCode, uid, payload) {
  let text = typeof payload === "string" ? payload : payload.text || "";
  const mediaType = typeof payload === "object" ? payload.mediaType || "text" : "text";
  const mediaUrl = typeof payload === "object" ? payload.mediaUrl || null : null;
  const replyTo = typeof payload === "object" ? payload.replyTo || null : null;
  const effectMode = typeof payload === "object" ? payload.effectMode || "normal" : "normal";
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

  // Cross-device ntfy.sh message broadcast
  publishNtfyMessage(roomCode, {
    type: "CHAT_MESSAGE",
    roomCode,
    message: msgObj
  });

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
      fileSize: fileSize || (fileSizeBytes ? formatFileSize(fileSizeBytes) : null),
      fileSizeBytes,
      soundFx,
      vaultMemoryOrigin,
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

  publishNtfyMessage(roomCode, {
    type: "DELETE_MESSAGE",
    messageId
  });
}

export function listenToMessages(roomCode, uid, onMessagesUpdated) {
  messageStore.clear();
  typingUsers.clear();
  onMessagesUpdatedCallback = onMessagesUpdated;

  if (roomChannel) {
    roomChannel.close();
  }
  roomChannel = new BroadcastChannel(`connect_chat_${roomCode}`);

  const handleMessagePayload = (data) => {
    const { type, message, messageId, typingUid, isTyping, textLength } = data || {};
    
    if (type === "CHAT_MESSAGE" && message) {
      if (!messageStore.has(message.id)) {
        messageStore.set(message.id, message);
        notifyMessages();
      }
    } else if (type === "DELETE_MESSAGE" && messageId) {
      messageStore.delete(messageId);
      notifyMessages();
    } else if (type === "TYPING_STATUS" && typingUid !== uid) {
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

  // Cross-device SSE listener over ntfy.sh
  if (ntfyChatEventSource) ntfyChatEventSource.close();
  try {
    ntfyChatEventSource = new EventSource(`https://ntfy.sh/connect_chat_msg_${roomCode}/json`);
    ntfyChatEventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed && parsed.message) {
          const payload = JSON.parse(parsed.message);
          handleMessagePayload(payload);
        }
      } catch (e) {}
    };
  } catch (e) {}

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
                senderName: data.senderName || "@anonymous",
                text: data.text || "",
                mediaType: data.mediaType || "text",
                mediaUrl: data.mediaUrl || null,
                replyTo: data.replyTo || null,
                effectMode: data.effectMode || "normal",
                fileName: data.fileName || null,
                fileSize: data.fileSize || null,
                fileSizeBytes: data.fileSizeBytes || null,
                soundFx: data.soundFx || null,
                vaultMemoryOrigin: data.vaultMemoryOrigin || null,
                reactions: data.reactions || {},
                localTime: timeStr,
                timestamp: data.timestamp ? data.timestamp.toMillis() : Date.now()
              });
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
    if (ntfyChatEventSource) {
      ntfyChatEventSource.close();
      ntfyChatEventSource = null;
    }
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
  publishNtfyMessage(roomCode, { type: "PURGE_CHAT" });
  notifyMessages();
}
