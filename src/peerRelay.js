import { Peer } from "peerjs";

let peer = null;
let activeConnections = new Map();
let currentRoomCode = null;
let currentUid = null;
let onRoomUpdateCallback = null;
let onChatMessageCallback = null;
let onTypingCallback = null;

export function initPeerRelay(roomCode, uid, isHost = false, callbacks = {}) {
  currentRoomCode = roomCode;
  currentUid = uid;
  onRoomUpdateCallback = callbacks.onRoomUpdate;
  onChatMessageCallback = callbacks.onChatMessage;
  onTypingCallback = callbacks.onTyping;

  // Clean up existing instance
  destroyPeerRelay();

  const peerId = isHost ? `cn-room-v1-${roomCode.toLowerCase()}` : `cn-peer-${uid}-${Math.random().toString(36).substring(2, 6)}`;

  try {
    peer = new Peer(peerId, {
      debug: 0
    });

    peer.on("open", (id) => {
      if (!isHost) {
        // Phone connects to Host (Laptop)
        connectToHost(roomCode, uid);
      }
    });

    // Handle incoming connections (Host receiving Phone connection)
    peer.on("connection", (conn) => {
      setupConnection(conn, isHost);
    });

    peer.on("error", (err) => {
      // If host ID is already taken, try connecting as participant
      if (err.type === "unavailable-id" && isHost) {
        connectToHost(roomCode, uid);
      }
    });
  } catch (e) {
    console.warn("PeerJS relay initialization skipped:", e);
  }
}

function connectToHost(roomCode, uid) {
  if (!peer) return;
  const hostPeerId = `cn-room-v1-${roomCode.toLowerCase()}`;
  try {
    const conn = peer.connect(hostPeerId, { reliable: true });
    setupConnection(conn, false);
  } catch (e) {}
}

function setupConnection(conn, isHost) {
  conn.on("open", () => {
    activeConnections.set(conn.peer, conn);

    if (!isHost) {
      // Notify host that we joined
      conn.send({
        type: "PEER_JOIN_REQUEST",
        uid: currentUid,
        roomCode: currentRoomCode
      });
    }
  });

  conn.on("data", (data) => {
    handlePeerData(data, conn, isHost);
  });

  conn.on("close", () => {
    activeConnections.delete(conn.peer);
  });

  conn.on("error", () => {
    activeConnections.delete(conn.peer);
  });
}

function handlePeerData(data, conn, isHost) {
  if (!data || !data.type) return;

  if (data.type === "PEER_JOIN_REQUEST") {
    if (onRoomUpdateCallback) {
      onRoomUpdateCallback({
        type: "PEER_JOIN",
        joinerUid: data.uid,
        roomCode: data.roomCode
      });
    }
    // Broadcast current room state back to joiner
    conn.send({
      type: "PEER_ROOM_SYNC",
      roomCode: data.roomCode,
      status: "active",
      members: [currentUid, data.uid]
    });
  } else if (data.type === "PEER_ROOM_SYNC") {
    if (onRoomUpdateCallback) {
      onRoomUpdateCallback({
        type: "ROOM_STATE",
        room: {
          code: data.roomCode,
          status: data.status,
          members: data.members || []
        }
      });
    }
  } else if (data.type === "CHAT_MESSAGE") {
    if (onChatMessageCallback) {
      onChatMessageCallback(data.message);
    }
  } else if (data.type === "TYPING_STATUS") {
    if (onTypingCallback) {
      onTypingCallback(data);
    }
  }
}

export function broadcastPeerData(payload) {
  activeConnections.forEach((conn) => {
    if (conn.open) {
      try {
        conn.send(payload);
      } catch (e) {}
    }
  });
}

export function destroyPeerRelay() {
  activeConnections.forEach((conn) => {
    try { conn.close(); } catch (e) {}
  });
  activeConnections.clear();

  if (peer) {
    try { peer.destroy(); } catch (e) {}
    peer = null;
  }
}
