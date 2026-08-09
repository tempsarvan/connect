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
const localRoomListeners = new Map(); // roomCode -> Set of listener functions

function notifyRoomListeners(roomCode, roomData) {
  const listeners = localRoomListeners.get(roomCode);
  if (listeners) {
    listeners.forEach((fn) => fn(roomData));
  }
}

// Listen to room events across tabs on same origin & localStorage sync
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
      if (!room.members.includes(joinerUid) && room.members.length < 2) {
        room.members.push(joinerUid);
        room.status = "active";
        localRooms.set(roomCode, room);

        // Notify local listeners (Host tab!)
        notifyRoomListeners(roomCode, room);

        // Broadcast to joiner tab
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
      notifyRoomListeners(roomCode, room);
    }
  } else if (type === "DESTROY_ROOM" || type === "SESSION_ENDED") {
    localRooms.delete(roomCode);
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
  globalChannel.postMessage({ type: "ROOM_CREATED", roomCode, room: roomData });

  if (isConfigured) {
    withTimeout(setDoc(doc(db, "rooms", roomCode), {
      ...roomData,
      createdAt: serverTimestamp()
    })).catch(() => {});
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

  // 2. Local BroadcastChannel + LocalStorage multi-tab lookup
  return new Promise((resolve, reject) => {
    let resolved = false;

    // Check if room exists in localRooms map (Host is on same tab / instance)
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
      localRooms.set(roomCode, room);
      notifyRoomListeners(roomCode, room);
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

        const activeRoom = { ...room, status: "active", members: [...room.members, uid] };
        localRooms.set(roomCode, activeRoom);
        notifyRoomListeners(roomCode, activeRoom);
        resolve(activeRoom);
      }
    };

    globalChannel.addEventListener("message", handleResponse);
    globalChannel.postMessage({ type: "QUERY_ROOM", roomCode });

    // Fallback if host is on different origin/network or tab didn't answer in 300ms
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        globalChannel.removeEventListener("message", handleResponse);
        
        const activeRoom = {
          code: roomCode,
          creator: uid,
          members: [uid],
          status: "active",
          createdAt: Date.now()
        };
        localRooms.set(roomCode, activeRoom);
        notifyRoomListeners(roomCode, activeRoom);
        resolve(activeRoom);
      }
    }, 300);
  });
}

export function listenToRoom(roomCode, onUpdate) {
  if (!localRoomListeners.has(roomCode)) {
    localRoomListeners.set(roomCode, new Set());
  }
  localRoomListeners.get(roomCode).add(onUpdate);

  // Trigger immediate callback if room state is already known
  if (localRooms.has(roomCode)) {
    onUpdate(localRooms.get(roomCode));
  }

  let unsubFirestore = null;
  if (isConfigured) {
    try {
      const roomRef = doc(db, "rooms", roomCode);
      unsubFirestore = onSnapshot(roomRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          localRooms.set(roomCode, data);
          onUpdate(data);
        }
      });
    } catch (err) {}
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    const listeners = localRoomListeners.get(roomCode);
    if (listeners) {
      listeners.delete(onUpdate);
      if (listeners.size === 0) localRoomListeners.delete(roomCode);
    }
  };
}
