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
import { callManager } from "./call";
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
  showReplyPreview,
  hideReplyPreview,
  closeLightbox
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
let pendingIncomingOffer = null;
let pendingCallIsVideo = true;

async function init() {
  setupEventListeners();

  try {
    currentUid = await initAuth();
  } catch (err) {
    currentUid = getUserUid();
  }

  initMediaPopovers(handleSendGif, handleSendSticker);
  
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

  buttons.toggleGifs.addEventListener("click", () => {
    displays.popoverStickers.classList.add("hidden");
    displays.popoverNotifications.classList.add("hidden");
    displays.popoverGifs.classList.toggle("hidden");
  });

  buttons.closeGifs.addEventListener("click", () => {
    displays.popoverGifs.classList.add("hidden");
  });

  buttons.toggleStickers.addEventListener("click", () => {
    displays.popoverGifs.classList.add("hidden");
    displays.popoverNotifications.classList.add("hidden");
    displays.popoverStickers.classList.toggle("hidden");
  });

  buttons.closeStickers.addEventListener("click", () => {
    displays.popoverStickers.classList.add("hidden");
  });

  // Notifications Drawer
  buttons.notifications.addEventListener("click", () => {
    displays.popoverGifs.classList.add("hidden");
    displays.popoverStickers.classList.add("hidden");
    displays.popoverNotifications.classList.toggle("hidden");
    markAllAsRead();
  });

  buttons.clearNotifications.addEventListener("click", () => {
    clearNotifications();
  });

  // Calling Handlers
  buttons.audioCall.addEventListener("click", () => handleStartCall(false));
  buttons.videoCall.addEventListener("click", () => handleStartCall(true));
  buttons.acceptCall.addEventListener("click", handleAcceptCall);
  buttons.declineCall.addEventListener("click", handleDeclineCall);

  buttons.callToggleMic.addEventListener("click", () => {
    const isMuted = callManager.toggleMic();
    buttons.callToggleMic.style.background = isMuted ? "var(--danger)" : "var(--surface)";
    showToast(isMuted ? "Microphone Muted" : "Microphone Active");
  });

  buttons.callToggleCam.addEventListener("click", () => {
    const isOff = callManager.toggleCamera();
    buttons.callToggleCam.style.background = isOff ? "var(--danger)" : "var(--surface)";
    showToast(isOff ? "Camera Off" : "Camera On");
  });

  buttons.callFlipCam.addEventListener("click", () => {
    callManager.flipCamera();
    showToast("Flipping Camera...");
  });

  buttons.callEnd.addEventListener("click", () => {
    callManager.stopCall("Call ended");
  });

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

  callManager.init(currentRoomCode, currentUid);

  callManager.onIncomingCall = ({ senderUid, isVideo, offer }) => {
    pendingIncomingOffer = offer;
    pendingCallIsVideo = isVideo;

    soundEngine.playRingtone();
    addNotification("Incoming Call", `${isVideo ? "Video" : "Voice"} call request`, "📞");

    displays.incomingCallTitle.textContent = `Incoming ${isVideo ? "Video" : "Voice"} Call...`;
    displays.incomingCallModal.classList.remove("hidden");
  };

  callManager.onCallStateChange = ({ status, localStream, reason }) => {
    if (status === "requesting_permissions") {
      showToast("Requesting microphone/camera permissions...");
    } else if (status === "calling" || status === "connected") {
      displays.callOverlay.classList.remove("hidden");
      
      if (localStream) {
        displays.localVideo.srcObject = localStream;
        displays.localVideo.play().catch(() => {});
      }

      if (!callManager.isVideo) {
        displays.localVideo.classList.add("hidden");
        displays.audioCallAvatar.classList.remove("hidden");
        displays.remoteVideo.classList.add("hidden");
      } else {
        displays.localVideo.classList.remove("hidden");
        displays.audioCallAvatar.classList.add("hidden");
        displays.remoteVideo.classList.remove("hidden");
      }
    } else if (status === "ended") {
      displays.callOverlay.classList.add("hidden");
      displays.incomingCallModal.classList.add("hidden");
      displays.localVideo.srcObject = null;
      displays.remoteVideo.srcObject = null;
      displays.remoteAudio.srcObject = null;
      if (reason) showToast(reason);
    }
  };

  callManager.onRemoteStream = (remoteStream) => {
    if (callManager.isVideo) {
      displays.remoteVideo.srcObject = remoteStream;
      displays.remoteVideo.play().catch(() => {});
    } else {
      displays.remoteAudio.srcObject = remoteStream;
      displays.remoteAudio.play().catch(() => {});
    }
  };

  let previousMsgCount = 0;
  if (chatUnsubscribe) chatUnsubscribe();
  chatUnsubscribe = listenToMessages(currentRoomCode, currentUid, (messages) => {
    if (messages.length > previousMsgCount && previousMsgCount > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender !== currentUid) {
        soundEngine.playMessageDing();
        
        let notifText = lastMsg.text;
        if (lastMsg.mediaType === "image") notifText = "Sent a photo";
        else if (lastMsg.mediaType === "gif") notifText = "Sent a GIF";
        else if (lastMsg.mediaType === "sticker") notifText = "Sent a sticker";
        else if (lastMsg.mediaType === "audio") notifText = "Sent a voice note";

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

// Call Action Handlers
async function handleStartCall(isVideo) {
  if (!currentRoomCode || !currentUid) return;
  try {
    addNotification("Starting Call", `Calling peer...`, "📞");
    await callManager.startCall(currentRoomCode, currentUid, isVideo);
  } catch (err) {
    showToast(err.message || "Failed to start call.");
  }
}

async function handleAcceptCall() {
  displays.incomingCallModal.classList.add("hidden");
  if (!currentRoomCode || !currentUid || !pendingIncomingOffer) return;

  try {
    await callManager.acceptCall(currentRoomCode, currentUid, pendingCallIsVideo, pendingIncomingOffer);
  } catch (err) {
    showToast("Could not accept call: " + err.message);
  }
}

function handleDeclineCall() {
  displays.incomingCallModal.classList.add("hidden");
  if (currentRoomCode && currentUid) {
    callManager.declineCall(currentRoomCode, currentUid);
  }
}

// Chat Action Handlers
async function handleSendMessage() {
  const text = inputs.message.value.trim();
  if (!text || !currentRoomCode) return;

  inputs.message.value = "";
  
  const payload = {
    text,
    mediaType: "text",
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
    callManager.stopCall();
    await destroyRoomSession(currentRoomCode);
  }
  onSessionEnded();
}

function onSessionEnded() {
  unregisterUnloadCleanup();
  callManager.stopCall();

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
  callManager.stopCall();
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
  displays.popoverGifs.classList.add("hidden");
  displays.popoverStickers.classList.add("hidden");
  displays.popoverNotifications.classList.add("hidden");

  showView("landing");
}

init();
