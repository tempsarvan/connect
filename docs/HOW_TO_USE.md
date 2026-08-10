# Connect & Connect Hub — Detailed Feature & Security Usage Guide

This guide covers advanced usage, cryptographic details, friend connections, device pairing, and platform customization settings.

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

## 🖤 2. Cold Obsidian Grayscale Aesthetic Engine

- **Pure Monochrome Palette**: Clean whites (`#ffffff`), silvers (`#e2e8f0`), and slate grays (`#94a3b8`) on dark cold obsidian gradients (`#090a0f`, `#0d0f14`, `#050608`).
- **Subtle CSS Noise Texture**: Ambient radial noise overlay rendering subtle grain depth without clutter.
- **Glassmorphism**: Backdrop blur filters (`backdrop-filter: blur(32px)`) across all modals, drawers, and titlebars.

---

## 📱 3. Friend Keys, Display Name Aliases & Sidebar Drawer

- **Unique Handle**: When signing up, claim your locked handle (e.g. `@sarvan`).
- **Unique Friend Key**: Your account receives an 8-character permanent Friend Key (e.g. `CN-9X4A-82`).
- **Right Friends Sidebar Drawer**: Tap **Friends** to slide open the right sidebar drawer (`#sidebar-friends-drawer`).
- **Friend Aliases**: Create custom display names for friends in your connection database via Customize Connect settings.

---

## 📱 4. Device QR Code Pairing

To pair your mobile device or tablet with a desktop chat session:
1. Open Connect on your desktop.
2. Scan the dynamic QR code using your phone or tablet camera.
3. The query parameter auto-populates the 6-digit room key and registers your device in real-time.

---

## ⚙️ 5. Customize Connect & Security Vault

- **Customize Connect**: Configure UI font typography (`Inter`, `JetBrains Mono`, `System Sans`), grayscale themes, credentials, and friend display names.
- **Export Vault Backup**: Download an encrypted local backup of your profile credentials and saved rooms.
- **1-Click Panic Wipe**: Instantly purges all browser memory, local storage keys, session tokens, and cached messages.
