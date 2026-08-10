<div align="center">
  <img src="public/logo.svg" width="100" height="100" alt="Connect Official Logo" />
  <h1>Connect & Connect Hub</h1>
  <p><strong>Zero-Trace Ephemeral Private Messaging, AES-GCM 256-Bit Cryptography & Web Desktop OS Platform</strong></p>

  <p>
    <a href="https://github.com/tempsarvan/connect"><img src="https://img.shields.io/badge/version-v3.0.0-blue.svg?style=flat-square" alt="Version"></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"></a>
    <a href="#"><img src="https://img.shields.io/badge/status-active--live-brightgreen.svg?style=flat-square" alt="Status"></a>
    <a href="#"><img src="https://img.shields.io/badge/encryption-AES--GCM--256--bit-purple.svg?style=flat-square" alt="Encryption"></a>
    <a href="#"><img src="https://img.shields.io/badge/attachments-1%20TB%20max-orange.svg?style=flat-square" alt="Max Attachments"></a>
  </p>

  <br />
</div>

---

## 📖 Overview

**Connect** is an ultra-premium, privacy-first real-time messaging suite and Web Desktop OS platform. It features **AES-GCM 256-bit client-side cryptography**, **2-way room key registration handshakes**, **Connect Hub Web Desktop platform** with draggable floating app windows, **zero-emoji vector iconography**, **Voice Notes Studio**, **Collaborative Whiteboard Canvas**, **IDE Code Evaluator Console**, and **1 Terabyte file support**.

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| 🔐 **AES-GCM 256-Bit Encryption** | Web Crypto API client-side payload encryption for messages, voice notes, and media uploads. |
| 💻 **Connect Hub Web Desktop OS** | Interactive Web Desktop OS environment (`view-connect-hub`) featuring floating native app windows (Connect Messages, Instagram, Discord, YouTube, X, GitHub, Spotify, Whiteboard Canvas, IDE Console). |
| 🔑 **2-Way Room Key Handshake** | Unified Private vs Public Room Key generator holding entrance in a 6-digit key waiting room until both peers register with the key. |
| 🎨 **Collaborative Whiteboard Canvas** | Built-in interactive drawing canvas tool with color palette swatches, stroke controls, and 1-click share to room stream. |
| 💻 **IDE Code Evaluator Console** | Real-time JavaScript code evaluator with console logging and snippet sharing. |
| 🎙️ **Audio & Voice Notes Studio** | Microphone voice recorder with high-fidelity Web Audio API encoding. |
| 📁 **1 Terabyte (1 TB) Uploads** | Attach high-definition media, code archives, or massive documents up to 1 TB. |
| 🔑 **Unique Friend Keys & Handles** | Permanent 8-character Friend Keys (e.g. `CN-9X4A-82`) and globally unique locked handles. |
| 🔒 **Panic Wipe & Security Vault** | 1-click **Panic Wipe** button to instantly zero out local storage, cookies, and session memory. |
| 🎯 **Zero Emoji Minimal Vector UI** | Complete vector SVG icon design system across all headers, drawers, buttons, and notifications. |

---

## 🏗️ Architecture & Project Structure

```text
connect/
├── docs/
│   ├── TUTORIAL.md         # Comprehensive step-by-step user tutorial
│   └── HOW_TO_USE.md       # Detailed feature & security usage guide
├── public/
│   └── logo.svg            # Official C-tick vector SVG logo & favicon
├── src/
│   ├── main.js             # Main view initialization & event handlers
│   ├── connectHub.js       # Connect Hub Web Desktop OS window manager & dock
│   ├── cryptoEngine.js     # Web Crypto API AES-GCM 256-bit encryption engine
│   ├── room.js             # Universal zero-permission room signaling (SSE + Polling)
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
│   ├── main.css            # Connect Hub OS layout, glassmorphism & themes
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
