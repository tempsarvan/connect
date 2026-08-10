# Connect & Connect Hub — Detailed Feature & Security Usage Guide

This guide covers advanced usage, cryptographic details, friend connections, device pairing, and platform settings.

---

## 🛡️ 1. Cryptographic Architecture (AES-GCM 256-Bit)

Connect implements zero-trust, client-side encryption using the **Web Crypto API** (`crypto.subtle`):

1. **PBKDF2 Key Derivation**:
   - Room keys generate a 256-bit symmetric key derived via 10,000 iterations of SHA-256 PBKDF2 hashing.
2. **AES-GCM 256-Bit Authenticated Encryption**:
   - Every outgoing message payload receives a unique 96-bit random Initialization Vector (IV).
   - Payloads are encrypted client-side (`encryptPayload`) before being broadcast over WebSockets, SSE, or local channels.
3. **Decryption**:
   - Receiving clients derive the matching key and decrypt payloads in memory (`decryptPayload`). No plain text is written to persistent remote servers.

---

## 📱 2. Friend Keys & Handles

- **Unique Handle**: When signing up, claim your locked handle (e.g. `@sarvan`). Handles are globally unique.
- **Unique Friend Key**: Your account receives an 8-character permanent Friend Key (e.g. `CN-9X4A-82`).
- **Adding Friends**:
  - Open the **Friends** drawer.
  - Enter your friend's Handle or Friend Key.
  - Click **Add Friend** to save them to your connections list.
  - Tap **Invite** in any room to send instant 6-digit room keys to your friends.

---

## 📱 3. Device QR Code Pairing

To pair your mobile device or tablet with a desktop chat session:
1. Open Connect on your desktop.
2. Scan the dynamic QR code using your phone or tablet camera.
3. The query parameter auto-populates the 6-digit room key and registers your device in real-time.

---

## ⚙️ 4. Profile & Vault Settings

- **Customize Profile**: Update your bio, status message, banner color accent, and avatar icon.
- **Export Vault Backup**: Download an encrypted local backup of your profile credentials and saved rooms.
- **1-Click Panic Wipe**: Instantly purges all browser memory, local storage keys, session tokens, and cached messages.
