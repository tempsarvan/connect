// Zero-Permission Universal Real-Time Room Signaling Engine for Connect
// Triple-Redundant Transport: ntfy.sh + RESTful API KV Relay + Local Storage & BroadcastChannel

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
const activePollers = new Map();

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

// Universal Zero-Permission HTTP Post Signal with Quadruple Transport
export async function sendUniversalSignal(roomCode, payload) {
  const topic = `connect_sig_${roomCode.trim().toLowerCase()}`;
  const bodyText = JSON.stringify(payload);

  // Transport 1: ntfy.sh POST
  try {
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: { "Cache": "yes", "X-Cache": "yes" },
      body: bodyText
    }).catch(() => {});
  } catch (e) {}

  // Transport 2: RESTful API Public Object Relay
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

  // Transport 3: Local Storage & Memory Broadcast
  try {
    const current = localRooms.get(roomCode) || {};
    const updated = { ...current, ...(payload.room || {}), status: payload.status || current.status };
    localRooms.set(roomCode, updated);
    localStorage.setItem(`connect_room_state_${roomCode}`, JSON.stringify(updated));
    localStorage.setItem(`connect_room_signal_${topic}`, JSON.stringify({ payload, timestamp: Date.now() }));
    notifyRoomListeners(roomCode, updated);
  } catch (e) {}
}

// Universal Zero-Permission Listener
export function listenUniversalSignal(roomCode, onUpdate) {
  const topic = `connect_sig_${roomCode.trim().toLowerCase()}`;
  let isClosed = false;

  const processedMsgIds = new Set();

  const handleMessagePayload = (data) => {
    if (isClosed || !data) return;

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

  // Storage listener for instant local sync
  const storageListener = (e) => {
    if (e.key === `connect_room_signal_${topic}` && e.newValue) {
      try {
        const { payload } = JSON.parse(e.newValue);
        if (payload) handleMessagePayload(payload);
      } catch (err) {}
    }
  };
  window.addEventListener("storage", storageListener);

  // 1. ntfy.sh Polling every 1s
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
            if (parsed && parsed.id && !processedMsgIds.has(parsed.id) && parsed.message) {
              processedMsgIds.add(parsed.id);
              const payload = JSON.parse(parsed.message);
              handleMessagePayload(payload);
            }
          } catch (e) {}
        });
      }
    } catch (e) {}
  }, 1000);

  // 2. ntfy.sh SSE Stream
  let sse = null;
  try {
    sse = new EventSource(`https://ntfy.sh/${topic}/sse?since=all`);
    sse.onmessage = (event) => {
      if (isClosed) return;
      try {
        const parsed = JSON.parse(event.data);
        if (parsed && parsed.id && !processedMsgIds.has(parsed.id) && parsed.message) {
          processedMsgIds.add(parsed.id);
          const payload = JSON.parse(parsed.message);
          handleMessagePayload(payload);
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

  activePollers.set(roomCode, { pollIntervalNtfy, pollIntervalRest, sse });

  return () => {
    isClosed = true;
    window.removeEventListener("storage", storageListener);
    clearInterval(pollIntervalNtfy);
    clearInterval(pollIntervalRest);
    if (sse) sse.close();
    activePollers.delete(roomCode);
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

  // Publish room creation signal
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

  // Publish JOIN_REQUEST signal immediately
  sendUniversalSignal(roomCode, {
    type: "JOIN_REQUEST",
    roomCode,
    joinerUid: uid,
    status: "active",
    room
  });

  // Re-broadcast JOIN_REQUEST signal every 1.5 seconds to guarantee peer registration
  let retransmits = 0;
  const timer = setInterval(() => {
    retransmits++;
    if (retransmits > 5) {
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

  // Listen for universal signals
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
