<div align="center">
  <img src="public/logo.svg" width="100" height="100" alt="Connect Official Logo" />
  <h1>Connect</h1>
  <p><strong>Zero-Trace Ephemeral Private Messaging & Persistent Public Rooms Suite</strong></p>

  <p>
    <a href="https://github.com/tempsarvan/connect"><img src="https://img.shields.io/badge/version-v2.5.0-blue.svg?style=flat-square" alt="Version"></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"></a>
    <a href="#"><img src="https://img.shields.io/badge/status-active--live-brightgreen.svg?style=flat-square" alt="Status"></a>
    <a href="#"><img src="https://img.shields.io/badge/privacy-100%25%20zero--trace-purple.svg?style=flat-square" alt="Privacy"></a>
    <a href="#"><img src="https://img.shields.io/badge/attachments-1%20TB%20max-orange.svg?style=flat-square" alt="Max Attachments"></a>
  </p>

  <br />
</div>

---

## 📖 Overview

**Connect** is a state-of-the-art hybrid communications suite engineered for phone, tablet, and desktop viewports. It provides **zero-trace single-use ephemeral private rooms**, **persistent public room hubs**, **instant device QR pairing**, **Voice Notes Studio with real-time audio waveforms**, and **1 Terabyte file support**.

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| **🌐 Zero-Permission Real-Time Bus** | Universal HTTP Polling & SSE pub/sub relay (`ntfy.sh`). Zero login or backend setup required. |
| **📱 Device QR Code Instant Pairing** | Scan dynamic QR codes from phone or tablet to pair instantly with desktop/laptop chat sessions. |
| **🎙️ Audio & Voice Notes Studio** | Microphone voice recorder with real-time HTML5 AudioContext waveform visualization. |
| **📁 1 Terabyte (1 TB) Uploads** | Attach high-definition media, code archives, or massive documents up to 1 TB. |
| **🔑 Unique Friend Keys & Handles** | Permanent 8-character Friend Keys (e.g. `CN-9X4A-82`) and globally unique locked handles. |
| **🔒 Panic Wipe & Security Vault** | 1-click **Panic Wipe** button to instantly zero out local storage, cookies, and session memory. |
| **🎨 3D Interactive Visual Aesthetics** | Three.js particle canvas, glassmorphism, dynamic dark modes, and micro-interactions. |

---

## 🏗️ Architecture & Project Structure

```text
connect/
├── public/
│   └── logo.svg            # Official vector SVG brand mark & favicon
├── src/
│   ├── main.js             # Main view initialization & event listeners
│   ├── room.js             # Universal zero-permission room signaling (SSE + Polling)
│   ├── chat.js             # Real-time chat bus & WhatsApp-grade quick reactions
│   ├── audio.js            # Voice Notes Studio & AudioContext waveform recorder
│   ├── vault.js            # Zero-trace encrypted memory & 1-click Panic Wipe
│   ├── peerRelay.js        # WebRTC PeerJS P2P data channels
│   ├── cleanup.js          # Ephemeral room session destruction & unload hooks
│   ├── media.js            # High-definition image processing & canvas compression
│   ├── qrcode.js           # Vector QR code generator
│   ├── showcase3d.js       # Three.js 3D particle background engine
│   └── ui.js               # UI view management, DOM bindings & notifications
├── styles/
│   ├── main.css            # Responsive layout, glassmorphic themes & mobile safe-areas
│   ├── reset.css           # Modern CSS reset
│   └── tokens.css          # Design system CSS variables & tokens
├── index.html              # Single-page shell with showcase landing page & app hub
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

## 🌐 Deployment (Vercel)

Connect is optimized for instant single-click deployment on **Vercel**:

1. Push your repository to GitHub (`main` branch).
2. Connect your repo in the [Vercel Dashboard](https://vercel.com).
3. Set the Framework Preset to **Vite**.
4. Deploy! Zero environment configuration required.

---

## 🛡️ Privacy & Zero-Trace Guarantee

- **No Server Storage**: Ephemeral private rooms destroy all messages upon session termination.
- **Client-Side Encryption**: Vault data remains isolated to local device storage.
- **1-Click Panic Wipe**: Instantly purge all local data, cookies, and tokens with a single click.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
