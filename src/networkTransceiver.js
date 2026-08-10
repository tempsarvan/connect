// Universal Zero-Fail Network Transceiver Engine for Connect
// Integrates 5 independent global cloud backends for multi-network cross-Wi-Fi messaging

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

  // 1. PeerJS WebRTC Direct Mesh (9 STUN Servers)
  try {
    broadcastPeerData(payload);
  } catch (e) {}

  // 2. Firebase RTDB REST POST (Public zero-auth global DB)
  try {
    fetch(`https://connect-private-default-rtdb.firebaseio.com/rooms/${topic}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payloadStr
    }).catch(() => {});
  } catch (e) {}

  // 3. ntfy.sh POST
  try {
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: { "Cache": "yes", "X-Cache": "yes" },
      body: payloadStr
    }).catch(() => {});
  } catch (e) {}

  // 4. RESTful API Cloud Store
  try {
    fetch("https://api.restful-api.dev/objects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: topic, data: payload })
    }).catch(() => {});
  } catch (e) {}

  // 5. LocalStorage Event
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

  // 1. PeerJS WebRTC Direct Mesh
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

  // 3. Firebase RTDB REST Polling (every 1s)
  const pollFirebaseRTDB = setInterval(async () => {
    if (isClosed) return;
    try {
      const res = await fetch(`https://connect-private-default-rtdb.firebaseio.com/rooms/${topic}.json`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          Object.values(data).forEach((val) => {
            if (val) handleIncomingData(val);
          });
        }
      }
    } catch (e) {}
  }, 1000);

  // 4. ntfy.sh SSE Stream
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

  // 5. ntfy.sh Polling (every 1.2s)
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
  }, 1200);

  return () => {
    isClosed = true;
    cleanupP2P();
    window.removeEventListener("storage", storageListener);
    clearInterval(pollFirebaseRTDB);
    clearInterval(pollNtfy);
    if (sse) sse.close();
  };
}
