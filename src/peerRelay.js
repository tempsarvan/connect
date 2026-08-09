import Peer from "peerjs";

let peer = null;
let activeConnection = null;
const peerConnections = new Set();
let onSignalCallback = null;
let currentPeerId = null;

export function initPeerHost(roomCode, onSignal) {
  closePeer();

  currentPeerId = `connect-host-${roomCode.toUpperCase()}`;
  onSignalCallback = onSignal;

  try {
    peer = new Peer(currentPeerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" }
        ]
      }
    });

    peer.on("open", (id) => {
      console.log("[PeerJS Host] Room host active with ID:", id);
    });

    peer.on("connection", (conn) => {
      console.log("[PeerJS Host] Incoming connection from peer:", conn.peer);
      peerConnections.add(conn);

      conn.on("data", (data) => {
        if (onSignalCallback) onSignalCallback(data, conn);
      });

      conn.on("close", () => {
        peerConnections.delete(conn);
      });
    });

    peer.on("error", (err) => {
      console.warn("[PeerJS Host Error]:", err.type || err);
    });
  } catch (err) {
    console.error("[PeerJS Init Failed]:", err);
  }
}

export function connectToHost(roomCode, uid, username, onSignal) {
  closePeer();

  onSignalCallback = onSignal;
  const hostPeerId = `connect-host-${roomCode.toUpperCase()}`;
  const clientPeerId = `connect-client-${uid.substring(0, 8)}-${Math.random().toString(36).substring(2, 6)}`;

  try {
    peer = new Peer(clientPeerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" }
        ]
      }
    });

    peer.on("open", () => {
      console.log("[PeerJS Client] Connecting to host:", hostPeerId);
      const conn = peer.connect(hostPeerId, { reliable: true });
      activeConnection = conn;

      conn.on("open", () => {
        console.log("[PeerJS Client] Data channel open to host!");
        conn.send({
          type: "JOIN_REQUEST",
          joinerUid: uid,
          username,
          roomCode
        });
      });

      conn.on("data", (data) => {
        if (onSignalCallback) onSignalCallback(data, conn);
      });

      conn.on("error", (err) => {
        console.warn("[PeerJS Conn Error]:", err);
      });
    });

    peer.on("error", (err) => {
      console.warn("[PeerJS Client Error]:", err.type || err);
    });
  } catch (err) {
    console.error("[PeerJS Connect Failed]:", err);
  }
}

export function broadcastPeerData(data) {
  if (activeConnection && activeConnection.open) {
    activeConnection.send(data);
  }
  peerConnections.forEach((conn) => {
    if (conn.open) {
      conn.send(data);
    }
  });
}

export function closePeer() {
  if (activeConnection) {
    activeConnection.close();
    activeConnection = null;
  }
  peerConnections.forEach((conn) => conn.close());
  peerConnections.clear();

  if (peer) {
    peer.destroy();
    peer = null;
  }
}
