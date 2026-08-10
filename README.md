<div align="center">
  <img src="public/logo.svg" width="100" height="100" alt="Connect Official Logo" />
  <h1>Connect & Connect Hub</h1>
  <p><strong>Zero-Trace Ephemeral Private Messaging, Cold Obsidian Grayscale Noise & Web Desktop OS Platform</strong></p>

  <p>
    <a href="https://github.com/tempsarvan/connect"><img src="https://img.shields.io/badge/version-v3.1.0-blue.svg?style=flat-square" alt="Version"></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"></a>
    <a href="#"><img src="https://img.shields.io/badge/status-active--live-brightgreen.svg?style=flat-square" alt="Status"></a>
    <a href="#"><img src="https://img.shields.io/badge/encryption-AES--GCM--256--bit-purple.svg?style=flat-square" alt="Encryption"></a>
    <a href="#"><img src="https://img.shields.io/badge/theme-obsidian%20grayscale-black.svg?style=flat-square" alt="Theme"></a>
  </p>

  <br />
</div>

---

## 📖 Overview

**Connect** is an ultra-premium, privacy-first real-time messaging suite and Web Desktop OS platform. Engineered with **Cold Obsidian Grayscale Noise aesthetics**, **Showcase Landing Page initial entrance**, **button-triggered Key Selection Modal**, **AES-GCM 256-bit client-side cryptography**, **2-way room key registration handshakes**, **Connect Hub Web Desktop platform** with floating app windows, **smooth sliding Right Friends Sidebar Drawer**, **Voice Notes Studio**, **Collaborative Whiteboard Canvas**, **IDE Code Evaluator Console**, and **1 Terabyte file support**.

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| 🖤 **Cold Obsidian Grayscale Aesthetics** | Pure monochrome grays, silvers, and dark cold obsidian noise gradients with subtle CSS texture overlay. |
| 🚀 **Showcase Landing Page Entrance** | Initial boot view (`view-showcase`) featuring Three.js 3D background, hero section, metrics bar, guided tour grid, and live change log. |
| 🔑 **Button-Triggered Key Selection Modal** | Click Create Key button to select **[ 🔒 Ephemeral Private Key ]** vs **[ 🌐 Persistent Public Key ]** in a clean modal. |
| 📱 **Smooth Sliding Right Friends Sidebar** | Right sliding glass drawer (`#sidebar-friends-drawer`) listing real connected users, Friend Keys, and display name aliases. |
| 💻 **Connect Hub Web Desktop OS** | Interactive Web Desktop OS environment (`view-connect-hub`) featuring floating native app windows (Connect Messages open on boot; Instagram, Discord, YouTube, X, GitHub, Spotify, Whiteboard Canvas, IDE Console open on demand). |
| ⚙️ **Customize Connect Settings Section** | Customize UI typography fonts (`Inter`, `JetBrains Mono`, `System Sans`), grayscale palettes, credentials, and friend display name aliases. |
| 🔐 **AES-GCM 256-Bit Encryption** | Web Crypto API client-side payload encryption for messages, voice notes, and media uploads. |
| 🎨 **Collaborative Whiteboard Canvas** | Built-in interactive drawing canvas tool with color palette swatches, stroke controls, and 1-click share to room stream. |
| 💻 **IDE Code Evaluator Console** | Real-time JavaScript code evaluator with console logging and snippet sharing. |
| 📁 **1 Terabyte (1 TB) Uploads** | Attach high-definition media, code archives, or massive documents up to 1 TB. |

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
