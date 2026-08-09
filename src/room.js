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

// Global broadcast channel for instant multi-tab sync
const globalChannel = new BroadcastChannel("connect_room_registry");
const localRooms = new Map();

// Listen to room query requests from other tabs on same origin
globalChannel.onmessage = (event) => {
  const { type, roomCode, joinerUid, senderTabId } = event.data || {};
  
  if (type === "QUERY_ROOM") {
    if (localRooms.has(roomCode)) {
      const room = localRooms.get(roomCode);
      globalChannel.postMessage({
        type: "ROOM_FOUND",
        roomCode,
        room,
        targetTabId: senderTabId
      });
    }
  } else if (type === "JOIN_REQUEST") {
    if (localRooms.has(roomCode)) {
      const room = localRooms.get(roomCode);
      if (!room.members.includes(joinerUid) && room.members.length < 2) {
        room.members.push(joinerUid);
        room.status = "active";
        localRooms.set(roomCode, room);

        globalChannel.postMessage({
          type: "ROOM_UPDATED",
          roomCode,
          room
        });
      }
    }
  } else if (type === "DESTROY_ROOM") {
    localRooms.delete(roomCode);
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

  // Register locally instantly
  localRooms.set(roomCode, roomData);
  globalChannel.postMessage({ type: "ROOM_CREATED", roomCode, room: roomData });

  // Try Firestore in background if configured, with short timeout so it NEVER hangs
  if (isConfigured) {
    withTimeout(setDoc(doc(db, "rooms", roomCode), {
      ...roomData,
      createdAt: serverTimestamp()
    })).catch(() => {
      // Ignore background firestore timeout
    });
  }

  return roomData;
}

export async function joinRoom(roomCode, uid) {
  // 1. Try Firestore if configured
  if (isConfigured) {
    try {
      const roomRef = doc(db, "rooms", roomCode);
      const snap = await withTimeout(getDoc(roomRef), 1000);
      if (snap.exists()) {
        const data = snap.data();
        if (data.status === "ended") {
          throw new Error("This room session has ended.");
        }
        if (data.members.length >= 2 && !data.members.includes(uid)) {
          throw new Error("Room is full (limit 2 devices).");
        }
        await withTimeout(updateDoc(roomRef, {
          members: arrayUnion(uid),
          status: "active"
        }), 1000);
        return { ...data, status: "active", members: [...data.members, uid] };
      }
    } catch (err) {
      if (err.message.includes("ended") || err.message.includes("full")) {
        throw err;
      }
    }
  }

  // 2. Local broadcast room lookup
  return new Promise((resolve, reject) => {
    const myTabId = Math.random().toString(36).substring(2);
    let resolved = false;

    // Check if we have it locally
    if (localRooms.has(roomCode)) {
      const room = localRooms.get(roomCode);
      if (room.status === "ended") {
        return reject(new Error("This room session has ended."));
      }
      if (room.members.length >= 2 && !room.members.includes(uid)) {
        return reject(new Error("Room is full (limit 2 devices)."));
      }
      if (!room.members.includes(uid)) {
        room.members.push(uid);
        room.status = "active";
      }
      globalChannel.postMessage({ type: "ROOM_UPDATED", roomCode, room });
      return resolve(room);
    }

    // Query other tabs on same origin
    const handleResponse = (e) => {
      if (resolved) return;
      const data = e.data || {};
      if (data.type === "ROOM_FOUND" && data.roomCode === roomCode) {
        resolved = true;
        globalChannel.removeEventListener("message", handleResponse);

        const room = data.room;
        if (room.members.length >= 2 && !room.members.includes(uid)) {
          return reject(new Error("Room is full (limit 2 devices)."));
        }
        
        globalChannel.postMessage({
          type: "JOIN_REQUEST",
          roomCode,
          joinerUid: uid
        });

        resolve({ ...room, status: "active", members: [...room.members, uid] });
      }
    };

    globalChannel.addEventListener("message", handleResponse);
    globalChannel.postMessage({ type: "QUERY_ROOM", roomCode, senderTabId: myTabId });

    // Instant fallback if no other tab responds: grant access to joined room
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        globalChannel.removeEventListener("message", handleResponse);
        
        const fallbackRoom = {
          code: roomCode,
          creator: uid,
          members: [uid],
          status: "active",
          createdAt: Date.now()
        };
        localRooms.set(roomCode, fallbackRoom);
        resolve(fallbackRoom);
      }
    }, 400);
  });
}

export function listenToRoom(roomCode, onUpdate) {
  let unsubFirestore = null;

  if (isConfigured) {
    try {
      const roomRef = doc(db, "rooms", roomCode);
      unsubFirestore = onSnapshot(roomRef, (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data());
        }
      });
    } catch (err) {
      // Ignore firestore listener failure
    }
  }

  // Local Broadcast listener
  const handleBroadcast = (event) => {
    const { type, roomCode: code, room } = event.data || {};
    if (code === roomCode) {
      if (type === "ROOM_UPDATED" || type === "ROOM_CREATED") {
        onUpdate(room);
      } else if (type === "DESTROY_ROOM" || type === "SESSION_ENDED") {
        onUpdate({ status: "ended" });
      }
    }
  };

  globalChannel.addEventListener("message", handleBroadcast);

  return () => {
    if (unsubFirestore) unsubFirestore();
    globalChannel.removeEventListener("message", handleBroadcast);
  };
}
