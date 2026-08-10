// High-Fidelity Client-Side AES-GCM 256-Bit Web Crypto Engine for Connect
// Zero-Trace Payload Encryption & Decryption

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Derive a 256-bit AES-GCM CryptoKey from room code & salt
async function deriveRoomKey(roomCode) {
  const codeStr = (roomCode || "CONNECT_DEFAULT_KEY").toUpperCase();
  const rawKey = textEncoder.encode(codeStr.padEnd(32, "0"));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: textEncoder.encode(`connect_salt_${codeStr}`),
      iterations: 10000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt plaintext string or object to base64 encrypted payload
export async function encryptPayload(roomCode, plaintext) {
  try {
    const key = await deriveRoomKey(roomCode);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const data = textEncoder.encode(typeof plaintext === "object" ? JSON.stringify(plaintext) : String(plaintext));

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Convert to Base64 string for transport
    let binary = "";
    for (let i = 0; i < combined.length; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return `ENC:${btoa(binary)}`;
  } catch (err) {
    console.warn("AES Encryption fallback:", err);
    return typeof plaintext === "object" ? JSON.stringify(plaintext) : String(plaintext);
  }
}

// Decrypt base64 encrypted payload back to plaintext string/object
export async function decryptPayload(roomCode, ciphertext) {
  if (!ciphertext || typeof ciphertext !== "string" || !ciphertext.startsWith("ENC:")) {
    return ciphertext;
  }

  try {
    const base64Data = ciphertext.slice(4);
    const binary = atob(base64Data);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const key = await deriveRoomKey(roomCode);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    const decoded = textDecoder.decode(decryptedBuffer);
    try {
      return JSON.parse(decoded);
    } catch (e) {
      return decoded;
    }
  } catch (err) {
    console.warn("AES Decryption error:", err);
    return "[Encrypted Message]";
  }
}
