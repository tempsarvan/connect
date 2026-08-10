# Connect & Connect Hub OS — Detailed Feature & Security Usage Guide

This guide covers advanced usage, cryptographic details, WebRTC P2P multi-cloud mesh, friend connections, device pairing, and platform customization settings.

---

## 🛡️ 1. Cryptographic Architecture & Seamless Fallback (AES-GCM 256-Bit)

Connect implements zero-trust, client-side encryption using the **Web Crypto API** (`crypto.subtle`) with pure JS XOR stream cipher HTTP network IP fallback:

1. **PBKDF2 Key Derivation**:
   - Room keys generate a 256-bit symmetric key derived via 10,000 iterations of SHA-256 PBKDF2 hashing.
2. **AES-GCM 256-Bit Authenticated Encryption**:
   - Every outgoing message payload receives a unique 96-bit random Initialization Vector (IV).
   - Payloads are encrypted client-side (`encryptPayload`) before being broadcast over WebSockets, SSE, or P2P channels.
3. **Seamless HTTP Network IP Fallback**:
   - Non-secure HTTP IP contexts auto-switch to `ENC_FALLBACK:` pure JS XOR stream cipher ensuring 100% encryption compatibility without crash errors.

---

## 🌐 2. Multi-Cloud WebRTC P2P Mesh Engine (Google STUN)

- **PeerJS WebRTC Mesh**: Direct peer-to-peer data channels (`src/p2pEngine.js`) leveraging Google STUN servers (`stun:stun.l.google.com:19302`).
- **Cross-Wi-Fi & Cellular Data**: Connects devices across different Wi-Fi networks, mobile 5G/4G data, or ethernet connections bypassing NAT barriers with zero server latency.
- **Quadruple Transport**: WebRTC P2P + ntfy.sh SSE Stream + RESTful API KV Store + LocalStorage Broadcast.

---

## 🖤 3. Cold Obsidian Grayscale Aesthetic Engine

- **Pure Monochrome Palette**: Clean whites (`#ffffff`), silvers (`#e2e8f0`), and slate grays (`#94a3b8`) on dark cold obsidian gradients (`#090a0f`, `#0d0f14`, `#050608`).
- **Subtle CSS Noise Texture**: Ambient radial noise overlay rendering subtle grain depth without clutter.
- **Glassmorphism**: Backdrop blur filters (`backdrop-filter: blur(32px)`) across all modals, drawers, and titlebars.

---

## 🔖 4. Bookmark Vault Drawer with 2-Way Drag-and-Drop

- **Slide-Out Vault Drawer**: Tap the `#btn-vault-bookmark` icon in the active chat header to toggle `#sidebar-vault-drawer`.
- **2-Way Drag-and-Drop**: Drag any chat message bubble (`.msg-bubble`) directly into the Vault dropzone to bookmark. Drag any saved Vault item (`.vault-item-draggable`) directly into the chat input bar to insert.

---

## 📱 5. Friend Keys, Display Name Aliases & Sidebar Drawer

- **Unique Handle**: When signing up, claim your locked handle (e.g. `@sarvan`).
- **Unique Friend Key**: Your account receives an 8-character permanent Friend Key (e.g. `CN-9X4A-82`).
- **Right Friends Sidebar Drawer**: Tap **Friends** to slide open the right sidebar drawer (`#sidebar-friends-drawer`).
- **Friend Aliases**: Create custom display names for friends in your connection database via Customize Connect settings.

---

## ⚙️ 6. Customize Connect & Security Vault

- **Customize Connect**: Configure UI font typography (`Inter`, `JetBrains Mono`, `System Sans`), grayscale themes, credentials, and friend display names.
- **Export Vault Backup**: Download an encrypted local backup of your profile credentials and saved rooms.
- **1-Click Panic Wipe**: Instantly purges all browser memory, local storage keys, session tokens, and cached messages.
