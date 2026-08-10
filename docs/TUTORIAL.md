# Connect & Connect Hub OS — Step-by-Step User Tutorial

Welcome to **Connect** and **Connect Hub Web Desktop OS**. This tutorial walks you through every feature of the platform.

---

## 🌐 1. Multi-Cloud Cross-Wi-Fi P2P Communication

Connect features a **Multi-Cloud WebRTC P2P Mesh** powered by PeerJS and Google STUN servers (`stun:stun.l.google.com:19302`):
- Connect between devices on **different Wi-Fi networks**, cellular data (5G/4G), or mobile hotspots with zero server latency.
- Quadruple-redundant signal fallback ensures 100% peer registration and instant message delivery.

---

## 🚀 2. Showcase Landing Page Entrance

When you first open Connect, you are welcomed by the **Showcase Landing Page** (`view-showcase`):
- **Three.js 3D Background Canvas**: Interactive particle backdrop.
- **Hero Section**: Key product metrics and *"Talk freely. Leave no trace."* introduction.
- **Guided Tour & Live Change Log**: Explore live platform releases and feature cards.
- **Navigation**: Click **Enter Connect Messenger** or **Launch Messenger** to move into the room dashboard.

---

## 🔑 3. Creating Room Keys (Private Key vs Public Key)

1. On the Connect Messenger Dashboard, click the **Create Room Key** button.
2. The **Key Type Selection Modal** (`#modal-select-key-type`) pops up:
   - **Private Key**: Generates a single-use 6-digit zero-trace room key. All messages and memory self-destruct upon session exit.
   - **Public Key**: Generates a 6-digit key with Room Name and Topic inputs. Saved to your **Public Rooms Hub** for future sessions.
3. Select your key type to enter the **2-Way Room Key Waiting View**.

---

## 🔖 4. Bookmark Vault Drawer & 2-Way Drag-and-Drop

1. Click the **Bookmark Vault** icon (`#btn-vault-bookmark`) in the chat header to open the slide-out Vault drawer (`#sidebar-vault-drawer`).
2. **Save to Vault**: Drag any chat bubble directly into the Vault dropzone.
3. **Insert from Vault**: Drag any saved Vault item directly into the active chat message input!

---

## 🎨 5. Using Full Expression & Attachment Tools Menu

Tap the `+` button in the chat input bar to open the upward **Expression Tools Menu**:
1. 🎨 **Drawing Whiteboard Canvas**: Sketch illustrations and click **Share in Chat**.
2. 💻 **IDE Code Evaluator Console**: Write, test, and execute JavaScript code snippets.
3. 🎙️ **Record Voice Note**: Tap to record high-fidelity voice notes.
4. 📷 **Send Image / Photo**: Upload and share images.
5. 📁 **Send Document (Up to 1 TB)**: Attach massive files up to 1 Terabyte.
6. 🖼️ **Send Vector Sticker**: Open the Stickers Picker modal and select vector stickers.
7. 🎬 **Send Animated GIF**: Open the GIFs Picker modal and select animated GIFs.

---

## 💻 6. Using Connect Hub Web Desktop Full-Screen Apps

**Connect Hub** is an interactive Web Desktop OS environment running natively inside your browser.

### Launching Connect Hub Desktop
- Click **Connect Hub** in the top bar, OR click **Move to Connect Hub** in an active chat header.

### Full-Screen In-App Web Viewports
- Click any dock app icon (Instagram, Discord, YouTube, X, GitHub, Spotify, Connect Messages) to open and expand that app to **100% full screen** inside Connect Hub.
- Connect your accounts (OAuth 2.0 PKCE / PAT) or interact with the service directly in-app without leaving the web app.

---

## 🚪 7. Exit Session & Session Destruction

- Tap the **Exit** button in the chat header at any time.
- Clicking **Exit** immediately unsubscribes from signaling channels, destroys ephemeral room session memory, and returns home cleanly.
