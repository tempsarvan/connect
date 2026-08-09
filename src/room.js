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
const pollingIntervals = new Map();

function notifyRoomListeners(roomCode, roomData) {
  const listeners = localRoomListeners.get(roomCode);
  if (listeners) {
    listeners.forEach((fn) => fn(roomData));
  }
}

// Window Storage Event & BroadcastChannel for cross-tab & cross-device local sync
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
  
  if (type === "QUERY_ROOM") {
    if (localRooms.has(roomCode)) {
      const room = localRooms.get(roomCode);
      globalChannel.postMessage({
        type: "ROOM_FOUND",
        roomCode,
        room
      });
    }
  } else if (type === "JOIN_REQUEST") {
    if (localRooms.has(roomCode)) {
      const room = localRooms.get(roomCode);
      if (!room.members.includes(joinerUid)) {
        room.members.push(joinerUid);
        room.status = "active";
        localRooms.set(roomCode, room);

        localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(room));
        notifyRoomListeners(roomCode, room);

        globalChannel.postMessage({
          type: "ROOM_UPDATED",
          roomCode,
          room
        });
      }
    }
  } else if (type === "ROOM_UPDATED" || type === "ROOM_CREATED") {
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
  // 1. Try Firestore if configured
  if (isConfigured) {
    try {
      const roomRef = doc(db, "rooms", roomCode);
      const snap = await withTimeout(getDoc(roomRef), 1200);
      if (snap.exists()) {
        const data = snap.data();
        if (data.status === "ended") {
          throw new Error("This room session has ended.");
        }
        
        const updatedMembers = Array.from(new Set([...(data.members || []), uid]));
        const updatedRoom = { ...data, status: "active", members: updatedMembers };

        await withTimeout(updateDoc(roomRef, {
          members: arrayUnion(uid),
          status: "active"
        }), 1200);

        localRooms.set(roomCode, updatedRoom);
        localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(updatedRoom));
        notifyRoomListeners(roomCode, updatedRoom);

        return updatedRoom;
      }
    } catch (err) {
      if (err.message.includes("ended") || err.message.includes("full")) {
        throw err;
      }
    }
  }

  // 2. Local & Storage fallback
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

  globalChannel.postMessage({ type: "ROOM_UPDATED", roomCode, room });

  return room;
}

function stopPolling(roomCode) {
  const id = pollingIntervals.get(roomCode);
  if (id) {
    clearInterval(id);
    pollingIntervals.delete(roomCode);
  }
}

// Cross-device Firestore polling fallback:
// When Firebase IS configured but onSnapshot fails (network/cold-start),
// or as an extra safety net, poll Firestore every 2s to detect joins.
function startFirestorePolling(roomCode, onUpdate) {
  if (!isConfigured) return;
  stopPolling(roomCode);

  const intervalId = setInterval(async () => {
    try {
      const roomRef = doc(db, "rooms", roomCode);
      const snap = await withTimeout(getDoc(roomRef), 2000);
      if (snap.exists()) {
        const data = snap.data();
        const current = localRooms.get(roomCode);

        // Detect if members changed or status changed
        const currentMemberCount = current?.members?.length || 0;
        const remoteMemberCount = data.members?.length || 0;
        const statusChanged = current?.status !== data.status;

        if (remoteMemberCount > currentMemberCount || statusChanged) {
          localRooms.set(roomCode, data);
          localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(data));
          onUpdate(data);

          // If room became active (someone joined), stop polling
          if (data.status === "active" && remoteMemberCount >= 2) {
            stopPolling(roomCode);
          }
        }
      }
    } catch (err) {
      // Silently continue polling
    }
  }, 2000);

  pollingIntervals.set(roomCode, intervalId);
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

          // Stop polling once onSnapshot is delivering updates
          if (data.status === "active" && data.members?.length >= 2) {
            stopPolling(roomCode);
          }
        }
      });
    } catch (err) {}

    // Start polling as a safety net alongside onSnapshot
    startFirestorePolling(roomCode, onUpdate);
  }

  return () => {
    stopPolling(roomCode);
    if (unsubFirestore) unsubFirestore();
    const listeners = localRoomListeners.get(roomCode);
    if (listeners) {
      listeners.delete(onUpdate);
      if (listeners.size === 0) localRoomListeners.delete(roomCode);
    }
  };
}

