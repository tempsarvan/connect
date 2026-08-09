import { PUBLIC_ROOMS } from "./chat";

export const views = {
  showcase: document.getElementById("view-showcase"),
  landing: document.getElementById("view-landing"),
  waiting: document.getElementById("view-waiting"),
  chat: document.getElementById("view-chat"),
  publicWorkspace: document.getElementById("view-public-workspace")
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
  friendsDrawer: document.getElementById("btn-friends-drawer"),
  closeFriendsModal: document.getElementById("btn-close-friends-modal"),
  addFriendSubmit: document.getElementById("btn-add-friend-submit"),
  publicExplorer: document.getElementById("btn-public-explorer"),
  closePublicModal: document.getElementById("btn-close-public-modal"),
  browsePublicChannels: document.getElementById("btn-browse-public-channels"),
  leavePublicWorkspace: document.getElementById("btn-leave-public-workspace"),
  toggleMembersSidebar: document.getElementById("btn-toggle-members-sidebar"),
  discordSend: document.getElementById("btn-discord-send"),
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
  closeLightbox: document.getElementById("btn-close-lightbox")
};

export const inputs = {
  authUsername: document.getElementById("auth-username"),
  authPassword: document.getElementById("auth-password"),
  authVaultToggle: document.getElementById("auth-vault-toggle"),
  authSoundToggle: document.getElementById("auth-sound-toggle"),
  addFriendHandle: document.getElementById("input-add-friend-handle"),
  settingUsername: document.getElementById("setting-input-username"),
  settingPassword: document.getElementById("setting-input-password"),
  code: document.getElementById("input-code"),
  message: document.getElementById("input-message"),
  discordMessage: document.getElementById("input-discord-message"),
  photoUpload: document.getElementById("input-photo-upload"),
  fileUpload: document.getElementById("input-file-upload"),
  pubPhotoUpload: document.getElementById("input-pub-photo-upload"),
  pubFileUpload: document.getElementById("input-pub-file-upload")
};

export const displays = {
  threeBgCanvas: document.getElementById("three-bg-canvas"),
  sandboxPreviewOutput: document.getElementById("sandbox-preview-output"),
  modalAuthLanding: document.getElementById("modal-auth-landing"),
  authModalTitle: document.getElementById("auth-modal-title"),
  authModalDesc: document.getElementById("auth-modal-desc"),
  authSignupOptions: document.getElementById("auth-signup-options"),
  authSubmitText: document.getElementById("auth-submit-text"),
  modalFriendsList: document.getElementById("modal-friends-list"),
  friendsListContainer: document.getElementById("friends-list-container"),
  modalPublicRooms: document.getElementById("modal-public-rooms"),
  publicRoomsExplorerList: document.getElementById("public-rooms-explorer-list"),
  publicChannelsListPreview: document.getElementById("public-channels-list-preview"),
  discordChannelsList: document.getElementById("discord-channels-list"),
  discordChannelName: document.getElementById("discord-channel-name"),
  discordChannelTopic: document.getElementById("discord-channel-topic"),
  discordMessagesList: document.getElementById("discord-messages-list"),
  discordMessagesContainer: document.getElementById("discord-messages-container"),
  discordMembersList: document.getElementById("discord-members-list"),
  discordMembersSidebar: document.getElementById("discord-members-sidebar"),
  discordMyUsername: document.getElementById("discord-my-username"),
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
  lightboxModal: document.getElementById("lightbox-modal"),
  lightboxImg: document.getElementById("lightbox-img")
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

export function renderFriendsList(friends, onRemove, onStartPrivateChat) {
  displays.friendsListContainer.innerHTML = "";
  if (friends.length === 0) {
    displays.friendsListContainer.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-dim); font-size:0.82rem;">No friends added yet. Type a username above to connect!</div>`;
    return;
  }

  friends.forEach((handle) => {
    const card = document.createElement("div");
    card.className = "friend-card";
    card.innerHTML = `
      <div class="friend-info">
        <span class="friend-name">${handle}</span>
        <span class="friend-status">Connected Friend</span>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-primary btn-chat-friend" style="height:30px; font-size:0.75rem; padding:0 8px;">Private Chat</button>
        <button class="btn btn-ghost btn-remove-friend" style="height:30px; font-size:0.75rem; padding:0 6px; color:var(--danger);">✕</button>
      </div>
    `;

    card.querySelector(".btn-chat-friend").onclick = () => onStartPrivateChat(handle);
    card.querySelector(".btn-remove-friend").onclick = () => onRemove(handle);
    displays.friendsListContainer.appendChild(card);
  });
}

export function renderPublicRoomsExplorer(onJoinChannel) {
  displays.publicRoomsExplorerList.innerHTML = "";
  displays.publicChannelsListPreview.innerHTML = "";

  PUBLIC_ROOMS.forEach((room) => {
    // 1. Explorer Modal List Item
    const card = document.createElement("div");
    card.className = "explorer-room-card";
    card.innerHTML = `
      <div class="explorer-info">
        <span class="explorer-title">${room.name}</span>
        <span class="explorer-sub">${room.topic} • ${room.membersCount} members</span>
      </div>
      <button class="btn btn-primary btn-join-pub" style="height:34px; font-size:0.8rem; padding:0 12px;">Join Channel</button>
    `;
    card.querySelector(".btn-join-pub").onclick = () => onJoinChannel(room);
    displays.publicRoomsExplorerList.appendChild(card);

    // 2. Landing Main Hub Quick Preview Buttons
    const prevBtn = document.createElement("div");
    prevBtn.className = "channel-preview-btn";
    prevBtn.innerHTML = `
      <span>${room.name}</span>
      <span style="font-size:0.72rem; color:var(--text-dim);">${room.membersCount} members</span>
    `;
    prevBtn.onclick = () => onJoinChannel(room);
    displays.publicChannelsListPreview.appendChild(prevBtn);
  });
}

export function renderDiscordChannelsList(activeChannelId, onSelectChannel) {
  displays.discordChannelsList.innerHTML = "";

  PUBLIC_ROOMS.forEach((room) => {
    const item = document.createElement("div");
    item.className = `channel-item ${room.id === activeChannelId ? "active" : ""}`;
    item.innerHTML = `
      <span class="channel-item-hash">#</span>
      <span>${room.name.replace('#', '')}</span>
    `;
    item.onclick = () => onSelectChannel(room);
    displays.discordChannelsList.appendChild(item);
  });
}

export function renderDiscordMembers(myUsername, friends) {
  displays.discordMembersList.innerHTML = "";
  
  const allMembers = [myUsername, ...friends, "@alex", "@dev_master", "@cyber_pilot"];
  const unique = Array.from(new Set(allMembers));

  unique.forEach((name) => {
    const item = document.createElement("div");
    item.className = "member-item";
    item.innerHTML = `
      <div class="user-status-avatar" style="width:24px; height:24px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <span style="font-size:0.82rem; color:${name === myUsername ? '#60a5fa' : 'var(--text)'}">${name} ${name === myUsername ? '(You)' : ''}</span>
    `;
    displays.discordMembersList.appendChild(item);
  });
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

function parseFormattedText(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>");
}

export function renderMessages(messages, currentUid, targetContainer = displays.messagesList) {
  targetContainer.innerHTML = "";

  if (messages.length === 0) {
    const systemRow = document.createElement("div");
    systemRow.className = "msg-row system";
    systemRow.innerHTML = `<div class="msg-bubble">Active Room Channel. Express yourself freely.</div>`;
    targetContainer.appendChild(systemRow);
    return;
  }

  messages.forEach((msg) => {
    const row = document.createElement("div");
    const isMe = msg.sender === currentUid;
    
    row.className = `msg-row ${isMe ? "me" : "peer"}`;

    const nameBadge = document.createElement("div");
    nameBadge.className = "msg-sender-name";
    nameBadge.textContent = isMe ? "You" : (msg.senderName || "@anonymous");
    row.appendChild(nameBadge);

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";

    if (msg.mediaType === "file" && msg.mediaUrl) {
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
    } else {
      const textNode = document.createElement("div");
      textNode.innerHTML = parseFormattedText(msg.text);
      bubble.appendChild(textNode);
    }

    row.appendChild(bubble);

    const time = document.createElement("div");
    time.className = "msg-time";
    time.textContent = msg.localTime || "";
    row.appendChild(time);

    targetContainer.appendChild(row);
  });

  const parent = targetContainer.parentElement;
  if (parent) parent.scrollTop = parent.scrollHeight;
}
