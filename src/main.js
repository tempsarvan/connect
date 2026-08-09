import { initAuth, getUserUid } from "./auth";
import { 
  generateRoomCode, 
  createRoom, 
  joinRoom, 
  listenToRoom 
} from "./room";
import { 
  sendMessage, 
  listenToMessages, 
  toggleReaction, 
  sendTypingIndicator, 
  listenToTyping 
} from "./chat";
import { 
  destroyRoomSession, 
  registerUnloadCleanup, 
  unregisterUnloadCleanup 
} from "./cleanup";
import { 
  processImageFile, 
  VoiceRecorder 
} from "./media";
import { soundEngine } from "./sound";
import { 
  addNotification, 
  markAllAsRead, 
  clearNotifications, 
  listenToNotifications 
} from "./notifications";
import { 
  views, 
  buttons, 
  inputs, 
  displays, 
  showView, 
  showToast, 
  showOverlayDisconnected, 
  hideOverlayDisconnected, 
  renderMessages,
  renderNotifications,
  initMediaPopovers,
  initEmojiPanel,
  initDoodleStudio,
  triggerConfettiEffect,
  showReplyPreview,
  hideReplyPreview,
  closeLightbox,
  showWipModal,
  hideWipModal
} from "./ui";

let currentRoomCode = null;
let currentUid = null;
let roomUnsubscribe = null;
let chatUnsubscribe = null;
let typingUnsubscribe = null;

let currentReplyMessage = null;
let voiceRecorder = null;
let voiceTimerInterval = null;
let voiceStartTime = 0;
let typingTimeout = null;

async function init() {
  setupEventListeners();

  try {
    currentUid = await initAuth();
  } catch (err) {
    currentUid = getUserUid();
  }

  initMediaPopovers(handleSendGif, handleSendSticker);
  initEmojiPanel(handleSelectEmoji);
  initDoodleStudio(handleSendDoodle);
  
  listenToNotifications((notifs, unread) => {
    renderNotifications(notifs, unread);
  });
}

function setupEventListeners() {
  // Navigation & Rooms
  buttons.create.addEventListener("click", handleCreateRoom);
  buttons.join.addEventListener("click", handleJoinRoom);

  inputs.code.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleJoinRoom();
  });

  inputs.code.addEventListener("input", () => {
    inputs.code.value = inputs.code.value.toUpperCase().trim();
  });

  buttons.copyCode.addEventListener("click", () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
      showToast("Code copied to clipboard");
    }
  });

  buttons.cancelRoom.addEventListener("click", handleCancelRoom);
  buttons.endSession.addEventListener("click", handleEndSession);
  buttons.returnHome.addEventListener("click", handleReturnHome);

  // Chat Input & Typing
  buttons.send.addEventListener("click", handleSendMessage);
  inputs.message.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  inputs.message.addEventListener("input", handleTypingEvent);

  // Media Attachments
  inputs.photoUpload.addEventListener("change", handlePhotoUpload);
  inputs.fileUpload.addEventListener("change", handleFileUpload);

  // Emojis Popover Toggle
  buttons.toggleEmojis.addEventListener("click", () => {
    closeAllPopovers();
    displays.popoverEmojis.classList.toggle("hidden");
  });

  buttons.closeEmojis.addEventListener("click", () => {
    displays.popoverEmojis.classList.add("hidden");
  });

  // GIFs Popover Toggle
  buttons.toggleGifs.addEventListener("click", () => {
    closeAllPopovers();
    displays.popoverGifs.classList.toggle("hidden");
  });

  buttons.closeGifs.addEventListener("click", () => {
    displays.popoverGifs.classList.add("hidden");
  });

  // Stickers Popover Toggle
  buttons.toggleStickers.addEventListener("click", () => {
    closeAllPopovers();
    displays.popoverStickers.classList.toggle("hidden");
  });

  buttons.closeStickers.addEventListener("click", () => {
    displays.popoverStickers.classList.add("hidden");
  });

  // Doodle Canvas Studio Toggle
  buttons.toggleDraw.addEventListener("click", () => {
    closeAllPopovers();
    displays.popoverDraw.classList.toggle("hidden");
  });

  buttons.closeDraw.addEventListener("click", () => {
    displays.popoverDraw.classList.add("hidden");
  });

  // Live Soundboard FX Toggle
  buttons.toggleSoundboard.addEventListener("click", () => {
    closeAllPopovers();
    displays.popoverSoundboard.classList.toggle("hidden");
  });

  buttons.closeSoundboard.addEventListener("click", () => {
    displays.popoverSoundboard.classList.add("hidden");
  });

  document.querySelectorAll(".sound-fx-btn").forEach((btn) => {
    btn.onclick = async () => {
      const fx = btn.getAttribute("data-fx");
      displays.popoverSoundboard.classList.add("hidden");
      
      if (currentRoomCode) {
        await sendMessage(currentRoomCode, currentUid, {
          text: `🔊 Sound FX: ${btn.textContent}`,
          mediaType: "sound_fx",
          soundFx: fx
        });
      }
    };
  });

  // Notifications Drawer
  buttons.notifications.addEventListener("click", () => {
    closeAllPopovers();
    displays.popoverNotifications.classList.toggle("hidden");
    markAllAsRead();
  });

  buttons.clearNotifications.addEventListener("click", () => {
    clearNotifications();
  });

  // Calling WIP Modal Handlers
  buttons.audioCall.addEventListener("click", () => {
    addNotification("Voice Call", "Feature under construction", "📞");
    showWipModal();
  });

  buttons.videoCall.addEventListener("click", () => {
    addNotification("Video Call", "Feature under construction", "📹");
    showWipModal();
  });

  buttons.closeWip.addEventListener("click", hideWipModal);
  buttons.dismissWip.addEventListener("click", hideWipModal);

  // Voice Recorder
  buttons.recordVoice.addEventListener("click", handleToggleVoiceRecord);
  buttons.cancelVoice.addEventListener("click", handleCancelVoiceRecord);

  // Reply Cancel & Lightbox Close
  buttons.cancelReply.addEventListener("click", () => {
    currentReplyMessage = null;
    hideReplyPreview();
  });

  buttons.closeLightbox.addEventListener("click", closeLightbox);
}

function closeAllPopovers() {
  displays.popoverEmojis.classList.add("hidden");
  displays.popoverGifs.classList.add("hidden");
  displays.popoverStickers.classList.add("hidden");
  displays.popoverDraw.classList.add("hidden");
  displays.popoverSoundboard.classList.add("hidden");
  displays.popoverNotifications.classList.add("hidden");
}

function handleSelectEmoji(char) {
  const input = inputs.message;
  const start = input.selectionStart || input.value.length;
  const end = input.selectionEnd || input.value.length;

  input.value = input.value.substring(0, start) + char + input.value.substring(end);
  input.selectionStart = input.selectionEnd = start + char.length;
  input.focus();
}

function handleTypingEvent() {
  if (!currentRoomCode || !currentUid) return;
  sendTypingIndicator(currentRoomCode, currentUid, true);
  
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendTypingIndicator(currentRoomCode, currentUid, false);
  }, 1500);
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
    await joinRoom(code, currentUid);
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

  addNotification("Room Active", `Connected to room ${currentRoomCode}`, "🔒");

  let previousMsgCount = 0;
  if (chatUnsubscribe) chatUnsubscribe();
  chatUnsubscribe = listenToMessages(currentRoomCode, currentUid, (messages) => {
    if (messages.length > previousMsgCount) {
      const lastMsg = messages[messages.length - 1];

      // Handle Soundboard FX playback for both sender and recipient
      if (lastMsg.mediaType === "sound_fx" && lastMsg.soundFx) {
        soundEngine.playSoundFX(lastMsg.soundFx);
      }

      // Handle Confetti effect for both sender and recipient
      if (lastMsg.effectMode === "confetti") {
        triggerConfettiEffect();
      }

      // Handle Notifications & Chimes
      if (previousMsgCount > 0 && lastMsg.sender !== currentUid) {
        if (lastMsg.mediaType !== "sound_fx") soundEngine.playMessageDing();
        
        let notifText = lastMsg.text;
        if (lastMsg.mediaType === "image") notifText = "Sent a photo";
        else if (lastMsg.mediaType === "gif") notifText = "Sent a GIF";
        else if (lastMsg.mediaType === "sticker") notifText = "Sent a sticker";
        else if (lastMsg.mediaType === "audio") notifText = "Sent a voice note";
        else if (lastMsg.mediaType === "file") notifText = `Shared file ${lastMsg.fileName || ''}`;

        addNotification("New Message", notifText, "💬");
      }
    }
    previousMsgCount = messages.length;
    renderMessages(messages, currentUid, handleReactionClick, handleReplyClick);
  });

  if (typingUnsubscribe) typingUnsubscribe();
  typingUnsubscribe = listenToTyping((users) => {
    if (users.length > 0) {
      displays.typingIndicator.classList.remove("hidden");
    } else {
      displays.typingIndicator.classList.add("hidden");
    }
  });

  if (roomUnsubscribe) roomUnsubscribe();
  roomUnsubscribe = listenToRoom(currentRoomCode, (roomData) => {
    if (!roomData || roomData.status === "ended") {
      onSessionEnded();
    }
  });
}

// Chat Action Handlers
async function handleSendMessage() {
  const text = inputs.message.value.trim();
  if (!text || !currentRoomCode) return;

  const effectMode = inputs.selectEffectMode.value;
  inputs.message.value = "";
  
  const payload = {
    text,
    mediaType: "text",
    effectMode,
    replyTo: currentReplyMessage ? { id: currentReplyMessage.id, text: currentReplyMessage.text } : null
  };

  currentReplyMessage = null;
  hideReplyPreview();

  await sendMessage(currentRoomCode, currentUid, payload);
  inputs.message.focus();
}

async function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file || !currentRoomCode) return;

  try {
    showToast("Processing photo...");
    const dataUrl = await processImageFile(file);
    
    await sendMessage(currentRoomCode, currentUid, {
      text: "",
      mediaType: "image",
      mediaUrl: dataUrl
    });

    inputs.photoUpload.value = "";
  } catch (err) {
    showToast("Could not send image: " + err.message);
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file || !currentRoomCode) return;

  try {
    showToast("Attaching document...");
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      const sizeMb = (file.size / 1024 / 1024).toFixed(2);
      
      await sendMessage(currentRoomCode, currentUid, {
        text: file.name,
        mediaType: "file",
        mediaUrl: dataUrl,
        fileName: file.name,
        fileSize: `${sizeMb} MB`
      });

      inputs.fileUpload.value = "";
    };
    reader.readAsDataURL(file);
  } catch (err) {
    showToast("Could not send file: " + err.message);
  }
}

async function handleSendDoodle(sketchDataUrl) {
  if (!currentRoomCode) return;
  await sendMessage(currentRoomCode, currentUid, {
    text: "Hand-drawn Sketch",
    mediaType: "image",
    mediaUrl: sketchDataUrl
  });
}

async function handleSendGif(gifUrl) {
  if (!currentRoomCode) return;
  await sendMessage(currentRoomCode, currentUid, {
    text: "",
    mediaType: "gif",
    mediaUrl: gifUrl
  });
}

async function handleSendSticker(stickerUrl) {
  if (!currentRoomCode) return;
  await sendMessage(currentRoomCode, currentUid, {
    text: "",
    mediaType: "sticker",
    mediaUrl: stickerUrl
  });
}

async function handleToggleVoiceRecord() {
  if (voiceRecorder) {
    try {
      clearInterval(voiceTimerInterval);
      displays.voiceRecordingBar.classList.add("hidden");
      
      const audioDataUrl = await voiceRecorder.stop();
      voiceRecorder = null;

      await sendMessage(currentRoomCode, currentUid, {
        text: "Voice Note",
        mediaType: "audio",
        mediaUrl: audioDataUrl
      });
    } catch (err) {
      showToast("Voice recording failed: " + err.message);
    }
  } else {
    try {
      voiceRecorder = new VoiceRecorder();
      await voiceRecorder.start();

      voiceStartTime = Date.now();
      displays.voiceRecordingBar.classList.remove("hidden");
      
      voiceTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - voiceStartTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        displays.voiceRecTimer.textContent = `${mins}:${secs}`;
      }, 1000);

      showToast("Recording... Tap microphone button to send");
    } catch (err) {
      showToast(err.message || "Microphone permission required.");
      voiceRecorder = null;
    }
  }
}

function handleCancelVoiceRecord() {
  if (voiceRecorder) {
    clearInterval(voiceTimerInterval);
    voiceRecorder.cleanup();
    voiceRecorder = null;
    displays.voiceRecordingBar.classList.add("hidden");
    showToast("Voice note canceled.");
  }
}

function handleReactionClick(msgId, emoji) {
  if (!currentRoomCode) return;
  toggleReaction(currentRoomCode, msgId, emoji, currentUid);
}

function handleReplyClick(msg) {
  currentReplyMessage = msg;
  showReplyPreview(msg.text || msg.mediaType || "message");
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
  if (typingUnsubscribe) {
    typingUnsubscribe();
    typingUnsubscribe = null;
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
  currentReplyMessage = null;
  
  if (roomUnsubscribe) {
    roomUnsubscribe();
    roomUnsubscribe = null;
  }
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }
  if (typingUnsubscribe) {
    typingUnsubscribe();
    typingUnsubscribe = null;
  }

  inputs.code.value = "";
  inputs.message.value = "";
  buttons.create.disabled = false;
  buttons.join.disabled = false;
  displays.messagesList.innerHTML = "";
  hideReplyPreview();
  hideWipModal();
  closeAllPopovers();

  showView("landing");
}

init();
