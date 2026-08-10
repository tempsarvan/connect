// Universal Real-Time Room Signaling Engine for Connect using networkTransceiver

import { broadcastUniversalPayload, listenUniversalPayload } from "./networkTransceiver";

export function generateRoomCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const localRooms = new Map();
const localRoomListeners = new Map();

function notifyRoomListeners(roomCode, roomData) {
  const listeners = localRoomListeners.get(roomCode);
  if (listeners) {
    listeners.forEach((fn) => fn(roomData));
  }
}

// Window Storage Event for same-device cross-tab sync
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

export async function sendUniversalSignal(roomCode, payload) {
  const current = localRooms.get(roomCode) || {};
  const updated = { ...current, ...(payload.room || {}), status: payload.status || current.status };
  localRooms.set(roomCode, updated);
  try {
    localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(updated));
    notifyRoomListeners(roomCode, updated);
  } catch (e) {}

  broadcastUniversalPayload(roomCode, payload);
}

export function listenUniversalSignal(roomCode, onUpdate) {
  const handleSignalPayload = (data) => {
    if (!data) return;
    const current = localRooms.get(roomCode) || { members: [], status: "waiting" };

    if (data.type === "JOIN_REQUEST" || data.type === "ROOM_ACTIVE" || data.type === "ROOM_UPDATED") {
      const joinerUid = data.joinerUid || data.uid;
      const newMembers = Array.from(new Set([...(current.members || []), ...(data.members || []), joinerUid].filter(Boolean)));
      
      const updatedRoom = {
        code: roomCode,
        creator: current.creator || data.creator || joinerUid,
        members: newMembers,
        status: "active",
        createdAt: current.createdAt || Date.now()
      };

      localRooms.set(roomCode, updatedRoom);
      localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(updatedRoom));
      notifyRoomListeners(roomCode, updatedRoom);
      onUpdate(updatedRoom);
    } else if (data.type === "DESTROY_ROOM" || data.type === "SESSION_ENDED") {
      localRooms.delete(roomCode);
      localStorage.removeItem(`connect_room_state_${roomCode}`);
      onUpdate({ status: "ended" });
    }
  };

  const cleanupTransceiver = listenUniversalPayload(roomCode, "local_uid", false, handleSignalPayload);

  return () => {
    cleanupTransceiver();
  };
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

  sendUniversalSignal(roomCode, {
    type: "ROOM_CREATED",
    roomCode,
    creator: uid,
    status: "waiting",
    room: roomData
  });

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

  sendUniversalSignal(roomCode, {
    type: "JOIN_REQUEST",
    roomCode,
    joinerUid: uid,
    status: "active",
    room
  });

  let retransmits = 0;
  const timer = setInterval(() => {
    retransmits++;
    if (retransmits > 6) {
      clearInterval(timer);
      return;
    }
    sendUniversalSignal(roomCode, {
      type: "JOIN_REQUEST",
      roomCode,
      joinerUid: uid,
      status: "active",
      room
    });
  }, 1500);

  return room;
}

export function listenToRoom(roomCode, onUpdate) {
  if (!localRoomListeners.has(roomCode)) {
    localRoomListeners.set(roomCode, new Set());
  }
  localRoomListeners.get(roomCode).add(onUpdate);

  if (localRooms.has(roomCode)) {
    onUpdate(localRooms.get(roomCode));
  }

  const cleanupUniversal = listenUniversalSignal(roomCode, (updatedRoom) => {
    onUpdate(updatedRoom);
  });

  return () => {
    cleanupUniversal();
    const listeners = localRoomListeners.get(roomCode);
    if (listeners) {
      listeners.delete(onUpdate);
      if (listeners.size === 0) localRoomListeners.delete(roomCode);
    }
  };
}
