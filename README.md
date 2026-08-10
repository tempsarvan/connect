<div align="center">
  <img src="public/logo.svg" width="100" height="100" alt="Connect Official Logo" />
  <h1>Connect & Connect Hub OS</h1>
  <p><strong>Zero-Trace Ephemeral Private Messaging, Multi-Cloud WebRTC P2P Cross-Wi-Fi Mesh & Full-Screen Web Desktop OS</strong></p>

  <p>
    <a href="https://github.com/tempsarvan/connect"><img src="https://img.shields.io/badge/version-v3.5.0-blue.svg?style=flat-square" alt="Version"></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"></a>
    <a href="#"><img src="https://img.shields.io/badge/status-active--live-brightgreen.svg?style=flat-square" alt="Status"></a>
    <a href="#"><img src="https://img.shields.io/badge/encryption-AES--GCM--256--bit-purple.svg?style=flat-square" alt="Encryption"></a>
    <a href="#"><img src="https://img.shields.io/badge/p2p-WebRTC%20Google%20STUN-orange.svg?style=flat-square" alt="WebRTC P2P"></a>
    <a href="#"><img src="https://img.shields.io/badge/theme-obsidian%20grayscale-black.svg?style=flat-square" alt="Theme"></a>
  </p>

  <br />
</div>

---

## 📖 Overview

**Connect** is a state-of-the-art hybrid communications suite and Web Desktop OS platform. Engineered with **Cold Obsidian Grayscale Noise aesthetics**, **Showcase Landing Page initial entrance**, **Key Type Selection Modal (Private Key vs Public Key)**, **Multi-Cloud PeerJS WebRTC P2P Cross-Wi-Fi Mesh with Google STUN servers**, **Full-Screen In-App Web Viewports for Instagram, Discord, YouTube, X, GitHub, Spotify, and Connect Messages**, **Full Expression Dropdown tools (Stickers, GIFs, Whiteboard Canvas, IDE Console, Voice Notes, Photos, 1 TB Files)**, **AES-GCM 256-bit encryption**, **Bookmark Vault Drawer with 2-Way Drag-and-Drop**, and **sliding Right Friends Sidebar Drawer**.

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| 🖤 **Cold Obsidian Grayscale Aesthetics** | Pure monochrome grays, silvers, and dark cold obsidian noise gradients with subtle CSS texture overlay. |
| 🌐 **Multi-Cloud WebRTC P2P Cross-Wi-Fi Mesh** | PeerJS WebRTC direct data channels with Google STUN servers (`stun:stun.l.google.com:19302`) enabling zero-latency communication across different Wi-Fi networks and mobile 5G/4G data. |
| 🚀 **Showcase Landing Page Entrance** | Initial boot view (`view-showcase`) featuring Three.js 3D background, hero section, metrics bar, guided tour grid, and live change log. |
| 🔑 **Clean Key Naming (Private Key / Public Key)** | Click Create Key button to select **Private Key** (ephemeral zero-trace) vs **Public Key** (persistent saved hub). |
| 🖥️ **Full-Screen In-App Web Viewports** | Interactive Web Desktop OS (`view-connect-hub`) with full-screen in-app web viewports for Instagram, Discord, YouTube, X, GitHub, Spotify, and Connect Messages with OAuth 2.0 PKCE & PAT support. |
| 🔖 **Bookmark Vault Drawer with 2-Way Drag & Drop** | Bookmark icon in active chat header (`#btn-vault-bookmark`) with a slide-out drawer (`#sidebar-vault-drawer`). 2-way drag-and-drop between chat bubbles and Vault. |
| 🎨 **Full Expression & Attachment Tools Menu** | Upward `+` dropdown menu containing Whiteboard Canvas, IDE Console, Voice Notes, Photo Attachments, 1 TB Files, Stickers Picker, and GIFs Picker. |
| 📱 **Smooth Sliding Right Friends Sidebar** | Right sliding glass drawer (`#sidebar-friends-drawer`) listing real connected users, Friend Keys, and display name aliases. |
| ⚙️ **Customize Connect Settings Section** | Customize UI typography fonts (`Inter`, `JetBrains Mono`, `System Sans`), grayscale palettes, credentials, and friend display name aliases. |
| 🔐 **AES-GCM 256-Bit Encryption** | Web Crypto API client-side payload encryption for messages, voice notes, and media uploads with pure JS XOR stream cipher HTTP IP fallback. |
| 📁 **1 Terabyte (1 TB) Uploads** | Attach high-definition media, code archives, or massive documents up to 1 TB. |

---

## 🏗️ Architecture & Project Structure

```text
connect/
├── docs/
│   ├── TUTORIAL.md         # Step-by-step user tutorial
│   └── HOW_TO_USE.md       # Feature & security usage guide
├── public/
│   └── logo.svg            # Official C-tick vector SVG logo & favicon
├── src/
│   ├── main.js             # Main view initialization & event handlers
│   ├── connectHub.js       # Connect Hub Web Desktop OS window manager & dock
│   ├── p2pEngine.js        # PeerJS WebRTC P2P direct transport with Google STUN
│   ├── cryptoEngine.js     # Web Crypto API AES-GCM 256-bit encryption engine
│   ├── room.js             # Universal zero-permission room signaling (SSE + Polling + P2P)
│   ├── chat.js             # Real-time encrypted chat bus & reactions
│   ├── devSuite.js         # JavaScript IDE code evaluator runner
│   ├── designSuite.js      # Collaborative drawing whiteboard canvas studio
│   ├── audio.js            # Voice Notes Studio recorder
│   ├── vault.js            # Zero-trace encrypted memory & 1-click Panic Wipe
│   ├── cleanup.js          # Ephemeral room session destruction & unload hooks
│   ├── media.js            # Image processing & canvas compression
│   ├── qrcode.js           # Vector QR code generator
│   ├── showcase3d.js       # Three.js 3D particle background engine
│   ├── sound.js            # High-fidelity Web Audio synth sound engine
│   └── ui.js               # UI view management, DOM bindings & notifications
├── styles/
│   ├── main.css            # Cold Obsidian Grayscale layout, noise texture & themes
│   ├── reset.css           # Modern CSS reset
│   └── tokens.css          # Design system CSS variables & tokens
├── index.html              # Single-page shell with Connect Messenger & Connect Hub Desktop
├── vite.config.js          # Vite bundler configuration
└── package.json            # Project dependencies & build scripts
```

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tempsarvan/connect.git
   cd connect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## 📚 Documentation & Guides

- 📘 [Step-by-Step User Tutorial](docs/TUTORIAL.md)
- 📙 [How-To-Use & Security Guide](docs/HOW_TO_USE.md)

---

## 📄 License

Distributed under the **MIT License**.
