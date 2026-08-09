import { STICKERS, TRENDING_GIFS } from "./media";

export const views = {
  landing: document.getElementById("view-landing"),
  waiting: document.getElementById("view-waiting"),
  chat: document.getElementById("view-chat")
};

export const buttons = {
  create: document.getElementById("btn-create"),
  join: document.getElementById("btn-join"),
  copyCode: document.getElementById("btn-copy-code"),
  cancelRoom: document.getElementById("btn-cancel-room"),
  endSession: document.getElementById("btn-end-session"),
  send: document.getElementById("btn-send"),
  returnHome: document.getElementById("btn-return-home"),
  toggleGifs: document.getElementById("btn-toggle-gifs"),
  closeGifs: document.getElementById("btn-close-gifs"),
  toggleStickers: document.getElementById("btn-toggle-stickers"),
  closeStickers: document.getElementById("btn-close-stickers"),
  recordVoice: document.getElementById("btn-record-voice"),
  cancelVoice: document.getElementById("btn-cancel-voice"),
  cancelReply: document.getElementById("btn-cancel-reply"),
  closeLightbox: document.getElementById("btn-close-lightbox")
};

export const inputs = {
  code: document.getElementById("input-code"),
  message: document.getElementById("input-message"),
  photoUpload: document.getElementById("input-photo-upload")
};

export const displays = {
  roomCode: document.getElementById("room-code-display"),
  chatRoomCode: document.getElementById("chat-room-code"),
  messagesList: document.getElementById("messages-list"),
  messagesContainer: document.getElementById("messages-container"),
  overlayDisconnected: document.getElementById("overlay-disconnected"),
  toast: document.getElementById("toast"),
  typingIndicator: document.getElementById("typing-indicator"),
  popoverGifs: document.getElementById("popover-gifs"),
  gifsGrid: document.getElementById("gifs-grid"),
  popoverStickers: document.getElementById("popover-stickers"),
  stickersGrid: document.getElementById("stickers-grid"),
  replyPreviewBar: document.getElementById("reply-preview-bar"),
  replyPreviewText: document.getElementById("reply-preview-text"),
  voiceRecordingBar: document.getElementById("voice-recording-bar"),
  voiceRecTimer: document.getElementById("voice-rec-timer"),
  lightboxModal: document.getElementById("lightbox-modal"),
  lightboxImg: document.getElementById("lightbox-img")
};

let toastTimeout = null;

export function showView(viewName) {
  Object.keys(views).forEach((name) => {
    if (name === viewName) {
      views[name].classList.add("active");
    } else {
      views[name].classList.remove("active");
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

export function showReplyPreview(msgText) {
  displays.replyPreviewText.textContent = msgText.length > 50 ? msgText.substring(0, 50) + "..." : msgText;
  displays.replyPreviewBar.classList.remove("hidden");
}

export function hideReplyPreview() {
  displays.replyPreviewBar.classList.add("hidden");
  displays.replyPreviewText.textContent = "";
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

// Custom Premium Voice Note Player Component
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

  playBtn.onclick = () => {
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

// Render Messages Engine
export function renderMessages(messages, currentUid, onReactionClick, onReplyClick) {
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
    
    row.className = `msg-row ${isMe ? "me" : "peer"}`;

    // Quoted reply
    if (msg.replyTo) {
      const quote = document.createElement("div");
      quote.className = "msg-reply-quote";
      quote.textContent = `Replying to: ${msg.replyTo.text || "media"}`;
      row.appendChild(quote);
    }

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";

    // Media Types
    if (msg.mediaType === "image" && msg.mediaUrl) {
      const img = document.createElement("img");
      img.src = msg.mediaUrl;
      img.className = "msg-media-img";
      img.alt = "Shared photo";
      img.onclick = () => openLightbox(msg.mediaUrl);
      bubble.appendChild(img);
      if (msg.text) {
        const textNode = document.createElement("div");
        textNode.style.marginTop = "6px";
        textNode.textContent = msg.text;
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
      bubble.textContent = msg.text;
    }

    row.appendChild(bubble);

    // Reactions bar
    if (msg.reactions && Object.keys(msg.reactions).length > 0) {
      const rxBar = document.createElement("div");
      rxBar.className = "reactions-bar";
      Object.entries(msg.reactions).forEach(([emoji, uids]) => {
        if (uids.length > 0) {
          const chip = document.createElement("span");
          chip.className = `reaction-chip ${uids.includes(currentUid) ? "active" : ""}`;
          chip.textContent = `${emoji} ${uids.length}`;
          chip.onclick = () => onReactionClick(msg.id, emoji);
          rxBar.appendChild(chip);
        }
      });
      row.appendChild(rxBar);
    }

    // Hover Actions Bar
    const actions = document.createElement("div");
    actions.className = "msg-actions";
    
    ["❤️", "😂", "👍", "🔥"].forEach((emoji) => {
      const btn = document.createElement("button");
      btn.className = "msg-action-btn";
      btn.textContent = emoji;
      btn.onclick = () => onReactionClick(msg.id, emoji);
      actions.appendChild(btn);
    });

    const replyBtn = document.createElement("button");
    replyBtn.className = "msg-action-btn";
    replyBtn.textContent = "↩️ reply";
    replyBtn.onclick = () => onReplyClick(msg);
    actions.appendChild(replyBtn);

    row.appendChild(actions);

    // Timestamp
    const time = document.createElement("div");
    time.className = "msg-time";
    time.textContent = msg.localTime || "";
    row.appendChild(time);

    displays.messagesList.appendChild(row);
  });

  // Smooth scroll to bottom
  displays.messagesContainer.scrollTop = displays.messagesContainer.scrollHeight;
}
