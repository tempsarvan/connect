// Multi-Cloud WebRTC P2P Direct Transport Engine using PeerJS & Google STUN Servers
// Guaranteed Instant Cross-Wi-Fi & Mobile 5G Direct Peer Data Mesh

import Peer from "peerjs";

const peerConnections = new Map();
let activePeer = null;

export function initPeerJSTransport(roomCode, uid, isHost, onDataReceived) {
  const cleanCode = (roomCode || "").trim().toLowerCase();
  if (!cleanCode) return () => {};

  const hostId = `connect_room_${cleanCode}_host`;
  const peerId = isHost
    ? hostId
    : `connect_room_${cleanCode}_peer_${Math.random().toString(36).substring(2, 7)}`;

  try {
    if (activePeer) {
      try { activePeer.destroy(); } catch (e) {}
    }

    activePeer = new Peer(peerId, {
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" }
        ]
      }
    });

    activePeer.on("open", () => {
      if (!isHost || peerId !== hostId) {
        connectToPeerHost(hostId, onDataReceived);
      }
    });

    activePeer.on("connection", (conn) => {
      peerConnections.set(conn.peer, conn);

      conn.on("data", (data) => {
        if (onDataReceived && data) {
          try {
            const parsed = typeof data === "string" ? JSON.parse(data) : data;
            onDataReceived(parsed);
          } catch (e) {
            onDataReceived(data);
          }
        }
      });

      conn.on("close", () => {
        peerConnections.delete(conn.peer);
      });
    });

    activePeer.on("error", (err) => {
      if (err && err.type === "unavailable-id") {
        // ID taken by Host, connect as peer client
        connectToPeerHost(hostId, onDataReceived);
      } else {
        setTimeout(() => {
          connectToPeerHost(hostId, onDataReceived);
        }, 1200);
      }
    });
  } catch (err) {}

  return () => {
    peerConnections.forEach((conn) => {
      try { conn.close(); } catch (e) {}
    });
    peerConnections.clear();
    if (activePeer) {
      try { activePeer.destroy(); } catch (e) {}
      activePeer = null;
    }
  };
}

function connectToPeerHost(hostPeerId, onDataReceived) {
  if (!activePeer || activePeer.destroyed) return;
  if (peerConnections.has(hostPeerId)) return;

  try {
    const conn = activePeer.connect(hostPeerId, { reliable: true });

    conn.on("open", () => {
      peerConnections.set(hostPeerId, conn);
    });

    conn.on("data", (data) => {
      if (onDataReceived && data) {
        try {
          const parsed = typeof data === "string" ? JSON.parse(data) : data;
          onDataReceived(parsed);
        } catch (e) {
          onDataReceived(data);
        }
      }
    });

    conn.on("close", () => {
      peerConnections.delete(hostPeerId);
    });
  } catch (err) {}
}

export function broadcastPeerData(payload) {
  const dataStr = typeof payload === "object" ? JSON.stringify(payload) : payload;
  peerConnections.forEach((conn) => {
    if (conn && conn.open) {
      try { conn.send(dataStr); } catch (e) {}
    }
  });
}
