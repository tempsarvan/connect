import { db, withTimeout, isConfigured } from "./firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion
} from "firebase/firestore";

export function generateRoomCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const globalChannel = new BroadcastChannel("connect_room_registry");
const localRooms = new Map();
const localRoomListeners = new Map();
const ntfyEventSources = new Map();

function notifyRoomListeners(roomCode, roomData) {
  const listeners = localRoomListeners.get(roomCode);
  if (listeners) {
    listeners.forEach((fn) => fn(roomData));
  }
}

// Window Storage Event & BroadcastChannel for same-device cross-tab sync
window.addEventListener("storage", (e) => {
  if (e.key && e.key.startsWith("connect_room_state_")) {
    const roomCode = e.key.replace("connect_room_state_", "");
    try {
      const roomData = JSON.parse(e.newValue);
      if (roomData) {
        localRooms.set(roomCode, roomData);
        notifyRoomListeners(roomCode, roomData);
      }
    } catch (err) {}
  }
});

globalChannel.onmessage = (event) => {
  const { type, roomCode, joinerUid, room } = event.data || {};
  
  if (type === "ROOM_UPDATED" || type === "ROOM_CREATED") {
    if (room) {
      localRooms.set(roomCode, room);
      localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(room));
      notifyRoomListeners(roomCode, room);
    }
  } else if (type === "DESTROY_ROOM" || type === "SESSION_ENDED") {
    localRooms.delete(roomCode);
    localStorage.removeItem(`connect_room_state_${roomCode}`);
    notifyRoomListeners(roomCode, { status: "ended" });
  }
};

// Zero-Config Global Real-time Pub/Sub Signaling over ntfy.sh
function publishNtfySignal(roomCode, payload) {
  try {
    fetch(`https://ntfy.sh/connect_room_sig_${roomCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {}
}

function listenNtfySignal(roomCode, onSignal) {
  if (ntfyEventSources.has(roomCode)) {
    ntfyEventSources.get(roomCode).close();
  }

  try {
    const sse = new EventSource(`https://ntfy.sh/connect_room_sig_${roomCode}/json`);
    ntfyEventSources.set(roomCode, sse);

    sse.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed && parsed.message) {
          const payload = JSON.parse(parsed.message);
          onSignal(payload);
        }
      } catch (e) {}
    };

    return () => {
      sse.close();
      ntfyEventSources.delete(roomCode);
    };
  } catch (e) {
    return () => {};
  }
}

export async function createRoom(roomCode, uid) {
  const roomData = {
    code: roomCode,
    creator: uid,
    members: [uid],
    status: "waiting",
    createdAt: Date.now()
  };

  localRooms.set(roomCode, roomData);
  localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(roomData));
  globalChannel.postMessage({ type: "ROOM_CREATED", roomCode, room: roomData });

  publishNtfySignal(roomCode, { type: "ROOM_CREATED", room: roomData });

  if (isConfigured) {
    try {
      await withTimeout(setDoc(doc(db, "rooms", roomCode), {
        ...roomData,
        createdAt: serverTimestamp()
      }), 1500);
    } catch (err) {}
  }

  return roomData;
}

export async function joinRoom(roomCode, uid) {
  let room = localRooms.get(roomCode);
  if (!room) {
    const stored = localStorage.getItem(`connect_room_state_${roomCode}`);
    if (stored) {
      try { room = JSON.parse(stored); } catch (e) {}
    }
  }

  if (!room) {
    room = {
      code: roomCode,
      creator: uid,
      members: [uid],
      status: "active",
      createdAt: Date.now()
    };
  } else {
    if (!room.members.includes(uid)) {
      room.members.push(uid);
    }
    room.status = "active";
  }

  localRooms.set(roomCode, room);
  localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(room));
  notifyRoomListeners(roomCode, room);

  // Broadcast join signal across tabs and internet
  globalChannel.postMessage({ type: "ROOM_UPDATED", roomCode, room });
  publishNtfySignal(roomCode, { type: "JOIN_REQUEST", joinerUid: uid, room });

  if (isConfigured) {
    try {
      const roomRef = doc(db, "rooms", roomCode);
      await withTimeout(updateDoc(roomRef, {
        members: arrayUnion(uid),
        status: "active"
      }), 1200);
    } catch (err) {}
  }

  return room;
}

export function listenToRoom(roomCode, onUpdate) {
  if (!localRoomListeners.has(roomCode)) {
    localRoomListeners.set(roomCode, new Set());
  }
  localRoomListeners.get(roomCode).add(onUpdate);

  if (localRooms.has(roomCode)) {
    onUpdate(localRooms.get(roomCode));
  } else {
    const stored = localStorage.getItem(`connect_room_state_${roomCode}`);
    if (stored) {
      try {
        const roomData = JSON.parse(stored);
        localRooms.set(roomCode, roomData);
        onUpdate(roomData);
      } catch (err) {}
    }
  }

  // Real-Time Cross-Device SSE Listener
  const cleanupNtfy = listenNtfySignal(roomCode, (signal) => {
    if (signal.type === "JOIN_REQUEST" || signal.type === "ROOM_UPDATED") {
      const current = localRooms.get(roomCode) || { members: [], status: "waiting" };
      const joinerUid = signal.joinerUid;

      const newMembers = Array.from(new Set([...current.members, ...(signal.room?.members || []), joinerUid].filter(Boolean)));
      const updatedRoom = {
        ...current,
        ...(signal.room || {}),
        members: newMembers,
        status: newMembers.length >= 2 ? "active" : (current.status || "waiting")
      };

      localRooms.set(roomCode, updatedRoom);
      localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(updatedRoom));
      onUpdate(updatedRoom);
    } else if (signal.type === "DESTROY_ROOM" || signal.type === "SESSION_ENDED") {
      localRooms.delete(roomCode);
      localStorage.removeItem(`connect_room_state_${roomCode}`);
      onUpdate({ status: "ended" });
    }
  });

  let unsubFirestore = null;
  if (isConfigured) {
    try {
      const roomRef = doc(db, "rooms", roomCode);
      unsubFirestore = onSnapshot(roomRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          localRooms.set(roomCode, data);
          localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(data));
          onUpdate(data);
        }
      });
    } catch (err) {}
  }

  return () => {
    cleanupNtfy();
    if (unsubFirestore) unsubFirestore();
    const listeners = localRoomListeners.get(roomCode);
    if (listeners) {
      listeners.delete(onUpdate);
      if (listeners.size === 0) localRoomListeners.delete(roomCode);
    }
  };
}
