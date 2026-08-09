import { initAuth, getUserUid } from "./auth";
import { 
  generateRoomCode, 
  createRoom, 
  joinRoom, 
  listenToRoom 
} from "./room";
import { sendMessage, listenToMessages } from "./chat";
import { 
  destroyRoomSession, 
  registerUnloadCleanup, 
  unregisterUnloadCleanup 
} from "./cleanup";
import { 
  views, 
  buttons, 
  inputs, 
  displays, 
  showView, 
  showToast, 
  showOverlayDisconnected, 
  hideOverlayDisconnected, 
  renderMessages 
} from "./ui";

let currentRoomCode = null;
let currentUid = null;
let roomUnsubscribe = null;
let chatUnsubscribe = null;

async function init() {
  // Always attach event listeners first
  setupEventListeners();

  try {
    currentUid = await initAuth();
  } catch (err) {
    currentUid = getUserUid();
  }
}

function setupEventListeners() {
  // 1. Create Room
  buttons.create.addEventListener("click", handleCreateRoom);

  // 2. Join Room
  buttons.join.addEventListener("click", handleJoinRoom);
  inputs.code.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleJoinRoom();
  });

  // Code input formatting
  inputs.code.addEventListener("input", () => {
    inputs.code.value = inputs.code.value.toUpperCase().trim();
  });

  // 3. Copy Code
  buttons.copyCode.addEventListener("click", () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
      showToast("Code copied to clipboard");
    }
  });

  // 4. Cancel Room (from waiting view)
  buttons.cancelRoom.addEventListener("click", handleCancelRoom);

  // 5. Send Message
  buttons.send.addEventListener("click", handleSendMessage);
  inputs.message.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // 6. End Session
  buttons.endSession.addEventListener("click", handleEndSession);

  // 7. Return Home (from overlay)
  buttons.returnHome.addEventListener("click", handleReturnHome);
}

async function handleCreateRoom() {
  buttons.create.disabled = true;
  if (!currentUid) currentUid = getUserUid();

  const roomCode = generateRoomCode();
  
  try {
    await createRoom(roomCode, currentUid);
    currentRoomCode = roomCode;
    registerUnloadCleanup(currentRoomCode);

    displays.roomCode.textContent = roomCode;
    showView("waiting");

    // Listen for room updates (e.g. peer joining or session end)
    if (roomUnsubscribe) roomUnsubscribe();
    roomUnsubscribe = listenToRoom(roomCode, (roomData) => {
      if (!roomData || roomData.status === "ended") {
        if (views.chat.classList.contains("active") || views.waiting.classList.contains("active")) {
          onSessionEnded();
        }
      } else if (roomData.status === "active" && roomData.members.length >= 2) {
        if (!views.chat.classList.contains("active")) {
          startChatSession();
        }
      }
    });
  } catch (err) {
    showToast(err.message || "Failed to create room.");
  } finally {
    buttons.create.disabled = false;
  }
}

async function handleJoinRoom() {
  const code = inputs.code.value.trim();
  if (!code || code.length !== 6) {
    showToast("Please enter a valid 6-character code");
    return;
  }

  buttons.join.disabled = true;
  if (!currentUid) currentUid = getUserUid();

  try {
    const roomData = await joinRoom(code, currentUid);
    currentRoomCode = code;
    registerUnloadCleanup(currentRoomCode);
    startChatSession();
  } catch (err) {
    showToast(err.message || "Could not join room.");
  } finally {
    buttons.join.disabled = false;
  }
}

function startChatSession() {
  displays.chatRoomCode.textContent = currentRoomCode;
  showView("chat");
  setTimeout(() => inputs.message.focus(), 100);

  // Listen to chat messages
  if (chatUnsubscribe) chatUnsubscribe();
  chatUnsubscribe = listenToMessages(currentRoomCode, currentUid, (messages) => {
    renderMessages(messages, currentUid);
  });

  // Listen to room status changes (to detect if peer ends session)
  if (roomUnsubscribe) roomUnsubscribe();
  roomUnsubscribe = listenToRoom(currentRoomCode, (roomData) => {
    if (!roomData || roomData.status === "ended") {
      onSessionEnded();
    }
  });
}

async function handleSendMessage() {
  const text = inputs.message.value;
  if (!text.trim() || !currentRoomCode) return;

  inputs.message.value = "";
  await sendMessage(currentRoomCode, currentUid, text);
  inputs.message.focus();
}

async function handleCancelRoom() {
  if (currentRoomCode) {
    await destroyRoomSession(currentRoomCode);
  }
  resetAppState();
}

async function handleEndSession() {
  if (currentRoomCode) {
    await destroyRoomSession(currentRoomCode);
  }
  onSessionEnded();
}

function onSessionEnded() {
  unregisterUnloadCleanup();
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }
  if (roomUnsubscribe) {
    roomUnsubscribe();
    roomUnsubscribe = null;
  }
  showOverlayDisconnected();
}

function handleReturnHome() {
  hideOverlayDisconnected();
  resetAppState();
}

function resetAppState() {
  unregisterUnloadCleanup();
  currentRoomCode = null;
  
  if (roomUnsubscribe) {
    roomUnsubscribe();
    roomUnsubscribe = null;
  }
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }

  inputs.code.value = "";
  inputs.message.value = "";
  buttons.create.disabled = false;
  buttons.join.disabled = false;
  displays.messagesList.innerHTML = "";

  showView("landing");
}

// Start application
init();
