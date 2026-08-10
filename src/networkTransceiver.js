// Universal Zero-Fail Network Transceiver Engine for Connect
// PeerJS WebRTC P2P (9 STUN Servers) + ntfy.sh SSE Push Stream + LocalStorage & BroadcastChannel

import { initPeerJSTransport, broadcastPeerData } from "./p2pEngine";

const processedPayloadHashes = new Set();

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export function broadcastUniversalPayload(roomCode, payload) {
  const cleanCode = (roomCode || "").trim().toLowerCase();
  if (!cleanCode) return;

  const topic = `connect_msg_${cleanCode}`;
  const payloadStr = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
  const payloadHash = hashString(payloadStr);

  processedPayloadHashes.add(payloadHash);

  // 1. PeerJS WebRTC Direct Data Channel Mesh (Google & Mozilla STUN)
  try {
    broadcastPeerData(payload);
  } catch (e) {}

  // 2. ntfy.sh Global Stream POST
  try {
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: { "Cache": "yes", "X-Cache": "yes" },
      body: payloadStr
    }).catch(() => {});
  } catch (e) {}

  // 3. LocalStorage & BroadcastChannel Sync
  try {
    localStorage.setItem(`connect_network_signal_${topic}`, JSON.stringify({ payload: payloadStr, time: Date.now() }));
  } catch (e) {}
}

export function listenUniversalPayload(roomCode, uid, isHost, onPayloadReceived) {
  const cleanCode = (roomCode || "").trim().toLowerCase();
  if (!cleanCode) return () => {};

  const topic = `connect_msg_${cleanCode}`;
  let isClosed = false;

  const handleIncomingData = (raw) => {
    if (isClosed || !raw) return;

    let payloadObj = null;
    let payloadStr = "";

    if (typeof raw === "object") {
      payloadObj = raw;
      payloadStr = JSON.stringify(raw);
    } else {
      payloadStr = String(raw);
      try { payloadObj = JSON.parse(raw); } catch (e) { payloadObj = raw; }
    }

    const payloadHash = hashString(payloadStr);
    if (processedPayloadHashes.has(payloadHash)) return;
    processedPayloadHashes.add(payloadHash);

    if (onPayloadReceived) {
      onPayloadReceived(payloadObj);
    }
  };

  // 1. PeerJS WebRTC Direct Data Channel Mesh
  const cleanupP2P = initPeerJSTransport(cleanCode, uid, isHost, handleIncomingData);

  // 2. Storage Event Listener
  const storageListener = (e) => {
    if (e.key === `connect_network_signal_${topic}` && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && parsed.payload) handleIncomingData(parsed.payload);
      } catch (err) {}
    }
  };
  window.addEventListener("storage", storageListener);

  // 3. ntfy.sh SSE Push Stream
  let sse = null;
  try {
    sse = new EventSource(`https://ntfy.sh/${topic}/sse?since=all`);
    sse.onmessage = (event) => {
      if (isClosed) return;
      try {
        const parsed = JSON.parse(event.data);
        if (parsed && parsed.message) {
          handleIncomingData(parsed.message);
        }
      } catch (e) {}
    };
  } catch (e) {}

  // 4. ntfy.sh Polling Backup (every 1s)
  const pollNtfy = setInterval(async () => {
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
            if (parsed && parsed.message) handleIncomingData(parsed.message);
          } catch (e) {}
        });
      }
    } catch (e) {}
  }, 1000);

  return () => {
    isClosed = true;
    cleanupP2P();
    window.removeEventListener("storage", storageListener);
    clearInterval(pollNtfy);
    if (sse) sse.close();
  };
}
