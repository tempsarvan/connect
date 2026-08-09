import { STICKERS, TRENDING_GIFS, EMOJI_CATEGORIES } from "./media";

export const views = {
  showcase: document.getElementById("view-showcase"),
  landing: document.getElementById("view-landing"),
  waiting: document.getElementById("view-waiting"),
  chat: document.getElementById("view-chat")
};

export const buttons = {
  navTour: document.getElementById("btn-nav-tour"),
  navFeatures: document.getElementById("btn-nav-features"),
  navLogin: document.getElementById("btn-nav-login"),
  navSignup: document.getElementById("btn-nav-signup"),
  heroLogin: document.getElementById("btn-hero-login"),
  heroSignup: document.getElementById("btn-hero-signup"),
  startTourScroll: document.getElementById("btn-start-tour-scroll"),
  sandboxSound: document.getElementById("btn-sandbox-sound"),
  sandboxVault: document.getElementById("btn-sandbox-vault"),
  sandboxConfetti: document.getElementById("btn-sandbox-confetti"),
  enterConnectFinal: document.getElementById("btn-enter-connect-final"),
  finalLogin: document.getElementById("btn-final-login"),
  closeAuthModal: document.getElementById("btn-close-auth-modal"),
  authTabSignup: document.getElementById("btn-auth-tab-signup"),
  authTabLogin: document.getElementById("btn-auth-tab-login"),
  submitAuth: document.getElementById("btn-submit-auth"),
  gearLanding: document.getElementById("btn-gear-landing"),
  gearChat: document.getElementById("btn-gear-chat"),
  closeFullscreenSettings: document.getElementById("btn-close-fullscreen-settings"),
  saveFullscreenSettings: document.getElementById("btn-save-fullscreen-settings"),
  create: document.getElementById("btn-create"),
  join: document.getElementById("btn-join"),
  copyCode: document.getElementById("btn-copy-code"),
  cancelRoom: document.getElementById("btn-cancel-room"),
  endSession: document.getElementById("btn-end-session"),
  send: document.getElementById("btn-send"),
  returnHome: document.getElementById("btn-return-home"),
  profileLanding: document.getElementById("btn-profile-landing"),
  profileHeader: document.getElementById("btn-profile-header"),
  toggleSaved: document.getElementById("btn-toggle-saved"),
  closeSaved: document.getElementById("btn-close-saved"),
  closeContext: document.getElementById("btn-close-context"),
  contextReply: document.getElementById("btn-context-reply"),
  contextSave: document.getElementById("btn-context-save"),
  contextCopy: document.getElementById("btn-context-copy"),
  contextDelete: document.getElementById("btn-context-delete"),
  toggleEmojis: document.getElementById("btn-toggle-emojis"),
  closeEmojis: document.getElementById("btn-close-emojis"),
  toggleGifs: document.getElementById("btn-toggle-gifs"),
  closeGifs: document.getElementById("btn-close-gifs"),
  toggleStickers: document.getElementById("btn-toggle-stickers"),
  closeStickers: document.getElementById("btn-close-stickers"),
  toggleDraw: document.getElementById("btn-toggle-draw"),
  closeDraw: document.getElementById("btn-close-draw"),
  clearDraw: document.getElementById("btn-clear-draw"),
  sendDraw: document.getElementById("btn-send-draw"),
  toggleSoundboard: document.getElementById("btn-toggle-soundboard"),
  closeSoundboard: document.getElementById("btn-close-soundboard"),
  recordVoice: document.getElementById("btn-record-voice"),
  cancelVoice: document.getElementById("btn-cancel-voice"),
  cancelReply: document.getElementById("btn-cancel-reply"),
  closeLightbox: document.getElementById("btn-close-lightbox"),
  notifications: document.getElementById("btn-notifications"),
  clearNotifications: document.getElementById("btn-clear-notifications"),
  audioCall: document.getElementById("btn-audio-call"),
  videoCall: document.getElementById("btn-video-call"),
  closeWip: document.getElementById("btn-close-wip"),
  dismissWip: document.getElementById("btn-dismiss-wip")
};

export const inputs = {
  authUsername: document.getElementById("auth-username"),
  authPassword: document.getElementById("auth-password"),
  authVaultToggle: document.getElementById("auth-vault-toggle"),
  authSoundToggle: document.getElementById("auth-sound-toggle"),
  settingUsername: document.getElementById("setting-input-username"),
  settingPassword: document.getElementById("setting-input-password"),
  settingToggleVault: document.getElementById("setting-toggle-vault"),
  settingToggleSound: document.getElementById("setting-toggle-sound"),
  code: document.getElementById("input-code"),
  message: document.getElementById("input-message"),
  photoUpload: document.getElementById("input-photo-upload"),
  fileUpload: document.getElementById("input-file-upload"),
  selectEffectMode: document.getElementById("select-effect-mode")
};

export const displays = {
  threeBgCanvas: document.getElementById("three-bg-canvas"),
  sandboxPreviewOutput: document.getElementById("sandbox-preview-output"),
  modalAuthLanding: document.getElementById("modal-auth-landing"),
  authModalTitle: document.getElementById("auth-modal-title"),
  authModalDesc: document.getElementById("auth-modal-desc"),
  authSignupOptions: document.getElementById("auth-signup-options"),
  authSubmitText: document.getElementById("auth-submit-text"),
  modalSettingsFullscreen: document.getElementById("modal-settings-fullscreen"),
  roomCode: document.getElementById("room-code-display"),
  chatRoomCode: document.getElementById("chat-room-code"),
  messagesList: document.getElementById("messages-list"),
  messagesContainer: document.getElementById("messages-container"),
  overlayDisconnected: document.getElementById("overlay-disconnected"),
  toast: document.getElementById("toast"),
  typingIndicator: document.getElementById("typing-indicator"),
  landingUsernameLabel: document.getElementById("landing-username-label"),
  chatHeaderUsername: document.getElementById("chat-header-username"),
  popoverSaved: document.getElementById("popover-saved"),
  savedVaultList: document.getElementById("saved-vault-list"),
  contextMenuModal: document.getElementById("context-menu-modal"),
  contextMenuPreview: document.getElementById("context-menu-preview"),
  popoverEmojis: document.getElementById("popover-emojis"),
  emojiCategories: document.getElementById("emoji-categories"),
  emojisGrid: document.getElementById("emojis-grid"),
  popoverGifs: document.getElementById("popover-gifs"),
  gifsGrid: document.getElementById("gifs-grid"),
  popoverStickers: document.getElementById("popover-stickers"),
  stickersGrid: document.getElementById("stickers-grid"),
  popoverDraw: document.getElementById("popover-draw"),
  drawCanvas: document.getElementById("draw-canvas"),
  popoverSoundboard: document.getElementById("popover-soundboard"),
  replyPreviewBar: document.getElementById("reply-preview-bar"),
  replyPreviewText: document.getElementById("reply-preview-text"),
  voiceRecordingBar: document.getElementById("voice-recording-bar"),
  voiceRecTimer: document.getElementById("voice-rec-timer"),
  lightboxModal: document.getElementById("lightbox-modal"),
  lightboxImg: document.getElementById("lightbox-img"),
  popoverNotifications: document.getElementById("popover-notifications"),
  notificationsList: document.getElementById("notifications-list"),
  notifBadge: document.getElementById("notif-badge"),
  wipModal: document.getElementById("wip-modal")
};

let toastTimeout = null;

export function showView(viewName) {
  Object.keys(views).forEach((name) => {
    if (views[name]) {
      if (name === viewName) {
        views[name].classList.add("active");
      } else {
        views[name].classList.remove("active");
      }
    }
  });
}

export function showToast(message, duration = 3000) {
  if (toastTimeout) clearTimeout(toastTimeout);
  
  displays.toast.textContent = message;
  displays.toast.classList.remove("hidden");
  
  toastTimeout = setTimeout(() => {
    displays.toast.classList.add("hidden");
  }, duration);
}

export function showOverlayDisconnected() {
  displays.overlayDisconnected.classList.remove("hidden");
}

export function hideOverlayDisconnected() {
  displays.overlayDisconnected.classList.add("hidden");
}

export function openLightbox(src) {
  displays.lightboxImg.src = src;
  displays.lightboxModal.classList.remove("hidden");
}

export function closeLightbox() {
  displays.lightboxModal.classList.add("hidden");
  displays.lightboxImg.src = "";
}

export function showWipModal() {
  displays.wipModal.classList.remove("hidden");
}

export function hideWipModal() {
  displays.wipModal.classList.add("hidden");
}

export function showReplyPreview(msgText) {
  displays.replyPreviewText.textContent = msgText.length > 50 ? msgText.substring(0, 50) + "..." : msgText;
  displays.replyPreviewBar.classList.remove("hidden");
}

export function hideReplyPreview() {
  displays.replyPreviewBar.classList.add("hidden");
  displays.replyPreviewText.textContent = "";
}

export function renderSavedVault(savedMessages, onRemoveSaved, onSendFromVault, isVaultDisabled = false) {
  displays.savedVaultList.innerHTML = "";
  if (isVaultDisabled) {
    displays.savedVaultList.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--danger); font-size: 0.8rem;">⚠️ Vault Memory is turned off by room session settings</div>`;
    return;
  }
  if (savedMessages.length === 0) {
    displays.savedVaultList.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 0.8rem;">No saved vault messages yet</div>`;
    return;
  }

  savedMessages.forEach((msg) => {
    const item = document.createElement("div");
    item.className = "saved-vault-item";
    
    let contentPreview = msg.text;
    if (msg.mediaType === 'image') contentPreview = '[Photo Attachment]';
    else if (msg.mediaType === 'audio') contentPreview = '[Voice Note]';
    else if (msg.mediaType === 'gif') contentPreview = '[Animated GIF]';
    else if (msg.mediaType === 'sticker') contentPreview = '[Sticker]';
    else if (msg.mediaType === 'file') contentPreview = `[Document: ${msg.fileName || ''}]`;

    item.innerHTML = `
      <div class="saved-vault-header">
        <span>By ${msg.senderName || 'Peer'} • ${msg.vaultSavedAt || msg.localTime || ''}</span>
      </div>
      <div class="saved-vault-text">${contentPreview}</div>
      <div class="saved-vault-actions">
        <button class="btn-send-vault">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span>Send into Chat</span>
        </button>
        <button class="btn-remove-saved">Remove ✕</button>
      </div>
    `;

    item.querySelector(".btn-send-vault").onclick = () => onSendFromVault(msg);
    item.querySelector(".btn-remove-saved").onclick = () => onRemoveSaved(msg.id);
    displays.savedVaultList.appendChild(item);
  });
}

export function renderNotifications(notificationsList, unreadCount) {
  if (unreadCount > 0) {
    displays.notifBadge.textContent = unreadCount;
    displays.notifBadge.classList.remove("hidden");
  } else {
    displays.notifBadge.classList.add("hidden");
  }

  displays.notificationsList.innerHTML = "";
  if (notificationsList.length === 0) {
    displays.notificationsList.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 0.8rem;">No recent notifications</div>`;
    return;
  }

  notificationsList.forEach((n) => {
    const item = document.createElement("div");
    item.className = `notif-item ${!n.read ? "unread" : ""}`;
    item.innerHTML = `
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        <div class="notif-body">${n.body}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    `;
    displays.notificationsList.appendChild(item);
  });
}

// Doodle Studio Canvas Logic
let drawCtx = null;
let isDrawing = false;
let currentDrawColor = "#ffffff";

export function initDoodleStudio(onSendSketch) {
  const canvas = displays.drawCanvas;
  drawCtx = canvas.getContext("2d");
  
  drawCtx.fillStyle = "#000000";
  drawCtx.fillRect(0, 0, canvas.width, canvas.height);

  const swatches = document.querySelectorAll(".color-swatch");
  swatches.forEach((swatch) => {
    swatch.onclick = () => {
      swatches.forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      currentDrawColor = swatch.getAttribute("data-color");
    };
  });

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    isDrawing = true;
    const pos = getPos(e);
    drawCtx.beginPath();
    drawCtx.moveTo(pos.x, pos.y);
  };

  const drawMove = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    drawCtx.strokeStyle = currentDrawColor;
    drawCtx.lineWidth = 3;
    drawCtx.lineCap = "round";
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();
  };

  const stopDrawing = () => {
    isDrawing = false;
  };

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", drawMove);
  window.addEventListener("mouseup", stopDrawing);

  canvas.addEventListener("touchstart", startDrawing);
  canvas.addEventListener("touchmove", drawMove);
  window.addEventListener("touchend", stopDrawing);

  buttons.clearDraw.onclick = () => {
    drawCtx.fillStyle = "#000000";
    drawCtx.fillRect(0, 0, canvas.width, canvas.height);
  };

  buttons.sendDraw.onclick = () => {
    const dataUrl = canvas.toDataURL("image/png");
    onSendSketch(dataUrl);
    displays.popoverDraw.classList.add("hidden");
    drawCtx.fillStyle = "#000000";
    drawCtx.fillRect(0, 0, canvas.width, canvas.height);
  };
}

export function initEmojiPanel(onSelectEmoji) {
  displays.emojiCategories.innerHTML = "";
  displays.emojisGrid.innerHTML = "";

  const renderCategoryEmojis = (catIndex) => {
    displays.emojisGrid.innerHTML = "";
    const category = EMOJI_CATEGORIES[catIndex];
    category.emojis.forEach((char) => {
      const span = document.createElement("span");
      span.className = "emoji-item";
      span.textContent = char;
      span.onclick = () => onSelectEmoji(char);
      displays.emojisGrid.appendChild(span);
    });
  };

  EMOJI_CATEGORIES.forEach((cat, index) => {
    const btn = document.createElement("button");
    btn.className = `emoji-cat-btn ${index === 0 ? "active" : ""}`;
    btn.textContent = cat.icon;
    btn.title = cat.name;
    btn.onclick = () => {
      document.querySelectorAll(".emoji-cat-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCategoryEmojis(index);
    };
    displays.emojiCategories.appendChild(btn);
  });

  renderCategoryEmojis(0);
}

export function initMediaPopovers(onSelectGif, onSelectSticker) {
  displays.gifsGrid.innerHTML = "";
  TRENDING_GIFS.forEach((gif) => {
    const img = document.createElement("img");
    img.src = gif.url;
    img.alt = gif.title;
    img.className = "gif-item";
    img.onclick = () => {
      onSelectGif(gif.url);
      displays.popoverGifs.classList.add("hidden");
    };
    displays.gifsGrid.appendChild(img);
  });

  displays.stickersGrid.innerHTML = "";
  STICKERS.forEach((st) => {
    const img = document.createElement("img");
    img.src = st.url;
    img.alt = st.label;
    img.className = "sticker-item";
    img.onclick = () => {
      onSelectSticker(st.url);
      displays.popoverStickers.classList.add("hidden");
    };
    displays.stickersGrid.appendChild(img);
  });
}

function createCustomAudioPlayer(audioUrl) {
  const container = document.createElement("div");
  container.className = "custom-audio-player";

  const playBtn = document.createElement("div");
  playBtn.className = "audio-play-btn";
  playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

  const waveform = document.createElement("div");
  waveform.className = "audio-waveform-bars";
  for (let i = 0; i < 12; i++) {
    const bar = document.createElement("div");
    bar.className = "wave-bar";
    bar.style.height = `${Math.floor(Math.random() * 60) + 30}%`;
    waveform.appendChild(bar);
  }

  const durationLabel = document.createElement("span");
  durationLabel.className = "audio-dur";
  durationLabel.textContent = "0:00";

  const audio = new Audio(audioUrl);
  
  audio.onloadedmetadata = () => {
    const secs = Math.floor(audio.duration || 0);
    durationLabel.textContent = `0:${secs < 10 ? '0' : ''}${secs}`;
  };

  audio.ontimeupdate = () => {
    const curr = Math.floor(audio.currentTime);
    durationLabel.textContent = `0:${curr < 10 ? '0' : ''}${curr}`;
  };

  audio.onended = () => {
    container.classList.remove("playing");
    playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  };

  playBtn.onclick = (e) => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play();
      container.classList.add("playing");
      playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    } else {
      audio.pause();
      container.classList.remove("playing");
      playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    }
  };

  container.appendChild(playBtn);
  container.appendChild(waveform);
  container.appendChild(durationLabel);

  return container;
}

function parseFormattedText(text, isSpoiler = false) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~(.*?)~/g, '<span class="msg-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');

  if (isSpoiler) {
    html = `<span class="msg-spoiler" onclick="this.classList.toggle('revealed')">${html}</span>`;
  }
  return html;
}

export function triggerConfettiEffect() {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "350";
  document.body.appendChild(container);

  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("div");
    piece.style.position = "absolute";
    piece.style.width = `${Math.random() * 8 + 6}px`;
    piece.style.height = `${Math.random() * 8 + 6}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = `-20px`;
    piece.style.borderRadius = "2px";
    piece.style.opacity = Math.random() + 0.5;
    piece.style.transition = `all ${Math.random() * 1.5 + 1}s ease-out`;

    container.appendChild(piece);

    setTimeout(() => {
      piece.style.transform = `translate3d(${(Math.random() - 0.5) * 200}px, ${window.innerHeight + 50}px, 0) rotate(${Math.random() * 720}deg)`;
      piece.style.opacity = "0";
    }, 20);
  }

  setTimeout(() => container.remove(), 2500);
}

export function renderMessages(messages, currentUid, onReactionClick, onReplyClick, onMessageClick) {
  displays.messagesList.innerHTML = "";

  if (messages.length === 0) {
    const systemRow = document.createElement("div");
    systemRow.className = "msg-row system";
    systemRow.innerHTML = `<div class="msg-bubble">End-to-End Ephemeral Room Active. Everything is wiped clean when session ends.</div>`;
    displays.messagesList.appendChild(systemRow);
    return;
  }

  messages.forEach((msg) => {
    const row = document.createElement("div");
    const isMe = msg.sender === currentUid;
    
    let rowClasses = `msg-row ${isMe ? "me" : "peer"}`;
    if (msg.effectMode === "shake") rowClasses += " effect-shake";
    row.className = rowClasses;

    // Display Sender Name Badge
    const nameBadge = document.createElement("div");
    nameBadge.className = "msg-sender-name";
    nameBadge.textContent = isMe ? "You" : (msg.senderName || "Peer");
    row.appendChild(nameBadge);

    if (msg.replyTo) {
      const quote = document.createElement("div");
      quote.className = "msg-reply-quote";
      quote.textContent = `Replying to: ${msg.replyTo.text || "media"}`;
      row.appendChild(quote);
    }

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.onclick = () => onMessageClick(msg);

    // Display Vault Memory Archive Container if sent from Vault
    if (msg.vaultMemoryOrigin) {
      const vBox = document.createElement("div");
      vBox.className = "msg-vault-archive-box";
      vBox.innerHTML = `
        <div class="msg-vault-archive-header">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          <span>Vault Archive Memory</span>
        </div>
        <div class="msg-vault-archive-desc">Retrieved from Vault Memory saved on ${msg.vaultMemoryOrigin}</div>
      `;
      bubble.appendChild(vBox);
    }

    if (msg.mediaType === "sound_fx") {
      const card = document.createElement("div");
      card.className = "msg-file-card";
      card.innerHTML = `
        <div class="msg-file-icon">🔊</div>
        <div class="msg-file-info">
          <span class="msg-file-name">${msg.text || "Sound FX"}</span>
          <span class="msg-file-size">Live Soundboard Audio</span>
        </div>
      `;
      bubble.appendChild(card);
    } else if (msg.mediaType === "file" && msg.mediaUrl) {
      const card = document.createElement("div");
      card.className = "msg-file-card";
      card.innerHTML = `
        <div class="msg-file-icon">📄</div>
        <div class="msg-file-info">
          <span class="msg-file-name">${msg.fileName || "Document"}</span>
          <span class="msg-file-size">${msg.fileSize || "File"}</span>
          <a href="${msg.mediaUrl}" download="${msg.fileName || 'file'}" class="msg-file-download" onclick="event.stopPropagation()">⬇️ Download File</a>
        </div>
      `;
      bubble.appendChild(card);
    } else if (msg.mediaType === "image" && msg.mediaUrl) {
      const img = document.createElement("img");
      img.src = msg.mediaUrl;
      img.className = "msg-media-img";
      img.alt = "Shared photo";
      img.onclick = (e) => {
        e.stopPropagation();
        openLightbox(msg.mediaUrl);
      };
      bubble.appendChild(img);
      if (msg.text) {
        const textNode = document.createElement("div");
        textNode.style.marginTop = "6px";
        textNode.innerHTML = parseFormattedText(msg.text, msg.effectMode === "spoiler");
        bubble.appendChild(textNode);
      }
    } else if (msg.mediaType === "gif" && msg.mediaUrl) {
      const img = document.createElement("img");
      img.src = msg.mediaUrl;
      img.className = "msg-media-gif";
      img.alt = "Animated GIF";
      bubble.appendChild(img);
    } else if (msg.mediaType === "sticker" && msg.mediaUrl) {
      const img = document.createElement("img");
      img.src = msg.mediaUrl;
      img.className = "msg-media-sticker";
      img.alt = "Sticker";
      bubble.style.background = "transparent";
      bubble.style.border = "none";
      bubble.style.boxShadow = "none";
      bubble.appendChild(img);
    } else if (msg.mediaType === "audio" && msg.mediaUrl) {
      const player = createCustomAudioPlayer(msg.mediaUrl);
      bubble.appendChild(player);
    } else {
      const textNode = document.createElement("div");
      textNode.innerHTML = parseFormattedText(msg.text, msg.effectMode === "spoiler");
      bubble.appendChild(textNode);
    }

    row.appendChild(bubble);

    if (msg.reactions && Object.keys(msg.reactions).length > 0) {
      const rxBar = document.createElement("div");
      rxBar.className = "reactions-bar";
      Object.entries(msg.reactions).forEach(([emoji, uids]) => {
        if (uids.length > 0) {
          const chip = document.createElement("span");
          chip.className = `reaction-chip ${uids.includes(currentUid) ? "active" : ""}`;
          chip.textContent = `${emoji} ${uids.length}`;
          chip.onclick = (e) => {
            e.stopPropagation();
            onReactionClick(msg.id, emoji);
          };
          rxBar.appendChild(chip);
        }
      });
      row.appendChild(rxBar);
    }

    const actions = document.createElement("div");
    actions.className = "msg-actions";
    
    ["❤️", "😂", "👍", "🔥"].forEach((emoji) => {
      const btn = document.createElement("button");
      btn.className = "msg-action-btn";
      btn.textContent = emoji;
      btn.onclick = (e) => {
        e.stopPropagation();
        onReactionClick(msg.id, emoji);
      };
      actions.appendChild(btn);
    });

    const replyBtn = document.createElement("button");
    replyBtn.className = "msg-action-btn";
    replyBtn.textContent = "↩️ reply";
    replyBtn.onclick = (e) => {
      e.stopPropagation();
      onReplyClick(msg);
    };
    actions.appendChild(replyBtn);

    row.appendChild(actions);

    const time = document.createElement("div");
    time.className = "msg-time";
    time.textContent = msg.localTime || "";
    row.appendChild(time);

    displays.messagesList.appendChild(row);
  });

  displays.messagesContainer.scrollTop = displays.messagesContainer.scrollHeight;
}
