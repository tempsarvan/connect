import { getProfileBio, getCustomStatus, getProfileBannerColor, getFriendKey } from "./chat";

export const views = {
  showcase: document.getElementById("view-showcase"),
  landing: document.getElementById("view-landing"),
  waiting: document.getElementById("view-waiting"),
  chat: document.getElementById("view-chat"),
  connectHub: document.getElementById("view-connect-hub")
};

export const buttons = {
  navTour: document.getElementById("btn-nav-tour"),
  navFeatures: document.getElementById("btn-nav-features"),
  navLogin: document.getElementById("btn-nav-login"),
  navSignup: document.getElementById("btn-nav-signup"),
  heroLogin: document.getElementById("btn-hero-login"),
  heroSignup: document.getElementById("btn-hero-signup"),
  startTourScroll: document.getElementById("btn-start-tour-scroll"),
  closeAuthModal: document.getElementById("btn-close-auth-modal"),
  authTabSignup: document.getElementById("btn-auth-tab-signup"),
  authTabLogin: document.getElementById("btn-auth-tab-login"),
  submitAuth: document.getElementById("btn-submit-auth"),
  friendsDrawer: document.getElementById("btn-friends-drawer"),
  closeFriendsSidebar: document.getElementById("btn-close-friends-sidebar"),
  addFriendSubmit: document.getElementById("btn-add-friend-submit"),
  closeProfileCard: document.getElementById("btn-close-profile-card"),
  editProfileFromCard: document.getElementById("btn-edit-profile-from-card"),
  closeEditProfile: document.getElementById("btn-close-edit-profile"),
  saveProfileCustomization: document.getElementById("btn-save-profile-customization"),
  inviteFriendsWaiting: document.getElementById("btn-invite-friends-waiting"),
  inviteFriendsChat: document.getElementById("btn-invite-friends-chat"),
  closeInviteFriends: document.getElementById("btn-close-invite-friends"),
  gearLanding: document.getElementById("btn-gear-landing"),
  gearChat: document.getElementById("btn-gear-chat"),
  closeFullscreenSettings: document.getElementById("btn-close-fullscreen-settings"),
  saveFullscreenSettings: document.getElementById("btn-save-fullscreen-settings"),
  openKeyModal: document.getElementById("btn-open-key-modal"),
  closeKeyModal: document.getElementById("btn-close-key-modal"),
  selectPrivateKey: document.getElementById("btn-select-private-key"),
  selectPublicKey: document.getElementById("btn-select-public-key"),
  confirmPublicKey: document.getElementById("btn-confirm-public-key"),
  join: document.getElementById("btn-join"),
  copyCode: document.getElementById("btn-copy-code"),
  copyCodeChat: document.getElementById("btn-copy-code-chat"),
  enterRoomDirect: document.getElementById("btn-enter-room-direct"),
  cancelRoom: document.getElementById("btn-cancel-room"),
  endSession: document.getElementById("btn-end-session"),
  send: document.getElementById("btn-send"),
  toolsMenuToggle: document.getElementById("btn-tools-menu-toggle"),
  recordVoiceNote: document.getElementById("btn-record-voice-note"),
  membersDrawer: document.getElementById("btn-members-drawer"),
  closeRoomMembers: document.getElementById("btn-close-room-members"),
  exportVault: document.getElementById("btn-export-vault"),
  panicWipe: document.getElementById("btn-panic-wipe"),
  returnHome: document.getElementById("btn-return-home"),
  profileLanding: document.getElementById("btn-profile-landing"),
  profileHeader: document.getElementById("btn-profile-header"),
  closeLightbox: document.getElementById("btn-close-lightbox"),
  launchConnectHub: document.getElementById("btn-launch-connect-hub"),
  moveToConnectHub: document.getElementById("btn-move-to-connect-hub"),
  exitConnectHub: document.getElementById("btn-exit-connect-hub"),
  openDevTools: document.getElementById("btn-open-dev-tools"),
  closeDevEditor: document.getElementById("btn-close-dev-editor"),
  runDevCode: document.getElementById("btn-run-dev-code"),
  shareDevCode: document.getElementById("btn-share-dev-code"),
  openDesignTools: document.getElementById("btn-open-design-tools"),
  closeDesignCanvas: document.getElementById("btn-close-design-canvas"),
  clearCanvas: document.getElementById("btn-clear-canvas"),
  shareCanvas: document.getElementById("btn-share-canvas"),
  openStickers: document.getElementById("btn-open-stickers"),
  closeStickers: document.getElementById("btn-close-stickers-modal"),
  openGifs: document.getElementById("btn-open-gifs"),
  closeGifs: document.getElementById("btn-close-gifs-modal"),
  openVaultModal: document.getElementById("btn-open-vault-modal"),
  closeVaultModal: document.getElementById("btn-close-vault-modal"),
  openSoundboard: document.getElementById("btn-open-soundboard"),
  closeSoundboardModal: document.getElementById("btn-close-soundboard-modal"),
  lockVaultAgain: document.getElementById("btn-lock-vault-again"),
  btnVaultBookmark: document.getElementById("btn-vault-bookmark"),
  btnCloseVaultSidebar: document.getElementById("btn-close-vault-sidebar"),
  ctxDelete: document.getElementById("btn-ctx-delete"),
  ctxShare: document.getElementById("btn-ctx-share"),
  ctxExportMsgJpg: document.getElementById("btn-ctx-export-msg-jpg"),
  ctxExportChatJpg: document.getElementById("btn-ctx-export-chat-jpg"),
  ctxSaveVault: document.getElementById("btn-ctx-save-vault")
};

export const inputs = {
  authUsername: document.getElementById("auth-username"),
  authPassword: document.getElementById("auth-password"),
  authVaultToggle: document.getElementById("auth-vault-toggle"),
  authSoundToggle: document.getElementById("auth-sound-toggle"),
  addFriendHandle: document.getElementById("input-add-friend-handle"),
  modalPublicName: document.getElementById("input-modal-public-name"),
  modalPublicTopic: document.getElementById("input-modal-public-topic"),
  code: document.getElementById("input-code"),
  message: document.getElementById("input-message"),
  fileUpload: document.getElementById("input-file-upload"),
  photoUpload: document.getElementById("input-photo-upload"),
  settingUsername: document.getElementById("setting-input-username"),
  settingPassword: document.getElementById("setting-input-password"),
  settingFriendKey: document.getElementById("setting-input-friend-key"),
  settingSelectFont: document.getElementById("setting-select-font"),
  settingSelectGrayscale: document.getElementById("setting-select-grayscale"),
  profileBioInput: document.getElementById("profile-bio-input"),
  profileStatusInput: document.getElementById("profile-status-input"),
  inputVaultPin: document.getElementById("input-vault-pin")
};

export const displays = {
  threeBgCanvas: document.getElementById("three-bg-canvas"),
  toast: document.getElementById("toast"),
  overlayDisconnected: document.getElementById("overlay-disconnected"),
  overlaySubtitleDesc: document.getElementById("overlay-subtitle-desc"),
  roomCodeDisplay: document.getElementById("room-code-display"),
  roomTypeBadgeWaiting: document.getElementById("room-type-badge-waiting"),
  roomCode: document.getElementById("room-code-display"),
  chatRoomCode: document.getElementById("chat-room-code"),
  chatHeaderRoomType: document.getElementById("chat-header-room-type"),
  messagesList: document.getElementById("messages-list"),
  authModalTitle: document.getElementById("auth-modal-title"),
  authModalDesc: document.getElementById("auth-modal-desc"),
  authSignupOptions: document.getElementById("auth-signup-options"),
  authSubmitText: document.getElementById("auth-submit-text"),
  landingUsernameLabel: document.getElementById("landing-username-label"),
  chatHeaderUsername: document.getElementById("chat-header-username"),
  friendsListContainer: document.getElementById("friends-list-container"),
  sidebarFriendsDrawer: document.getElementById("sidebar-friends-drawer"),
  sidebarVaultDrawer: document.getElementById("sidebar-vault-drawer"),
  vaultDropzone: document.getElementById("vault-dropzone"),
  vaultDrawerRecordsList: document.getElementById("vault-drawer-records-list"),
  inviteFriendsListContainer: document.getElementById("invite-friends-list-container"),
  roomMembersListContainer: document.getElementById("room-members-list-container"),
  savedPublicRoomsContainer: document.getElementById("saved-public-rooms-container"),
  savedRoomsCountBadge: document.getElementById("saved-rooms-count-badge"),
  modalAuthLanding: document.getElementById("modal-auth-landing"),
  modalSelectKeyType: document.getElementById("modal-select-key-type"),
  modalFriendsList: document.getElementById("modal-friends-list"),
  modalInviteFriends: document.getElementById("modal-invite-friends"),
  modalProfileCard: document.getElementById("modal-profile-card"),
  modalSettingsFullscreen: document.getElementById("modal-settings-fullscreen"),
  modalEditProfile: document.getElementById("modal-edit-profile"),
  modalRoomMembers: document.getElementById("modal-room-members"),
  modalStickersPicker: document.getElementById("modal-stickers-picker"),
  modalGifsPicker: document.getElementById("modal-gifs-picker"),
  modalVaultLock: document.getElementById("modal-vault-lock"),
  modalSoundboardFx: document.getElementById("modal-soundboard-fx"),
  messageContextMenu: document.getElementById("message-context-menu"),
  vaultLockedScreen: document.getElementById("vault-locked-screen"),
  vaultUnlockedScreen: document.getElementById("vault-unlocked-screen"),
  vaultRecordsList: document.getElementById("vault-records-list"),
  profileCardHandle: document.getElementById("profile-card-handle"),
  profileCardStatus: document.getElementById("profile-card-status"),
  profileCardBio: document.getElementById("profile-card-bio"),
  profileCardBanner: document.getElementById("profile-card-banner"),
  profileCardFriendKey: document.getElementById("profile-card-friend-key"),
  messagesContainer: document.getElementById("messages-container"),
  typingIndicator: document.getElementById("typing-indicator"),
  dropdownToolsMenu: document.getElementById("dropdown-tools-menu"),
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

export function openProfileCardModal(username, isMe = true, onEditClick = null) {
  displays.profileCardHandle.textContent = username;
  displays.profileCardStatus.textContent = getCustomStatus();
  displays.profileCardBio.textContent = getProfileBio();
  displays.profileCardBanner.style.background = getProfileBannerColor();
  displays.profileCardFriendKey.textContent = getFriendKey();

  if (isMe) {
    buttons.editProfileFromCard.style.display = "block";
    buttons.editProfileFromCard.onclick = () => {
      displays.modalProfileCard.classList.add("hidden");
      if (onEditClick) onEditClick();
    };
  } else {
    buttons.editProfileFromCard.style.display = "none";
  }

  displays.modalProfileCard.classList.remove("hidden");
}

export function renderRoomMembers(members) {
  displays.roomMembersListContainer.innerHTML = "";
  if (!members || members.length === 0) {
    displays.roomMembersListContainer.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-dim); font-size:0.82rem;">No active participants in room.</div>`;
    return;
  }

  members.forEach((uid) => {
    const card = document.createElement("div");
    card.className = "friend-card";
    card.innerHTML = `
      <div class="friend-info">
        <span class="friend-name">User ${uid.substring(0, 10)}</span>
        <span class="friend-status" style="color:#10b981;">🟢 Connected Member</span>
      </div>
    `;
    displays.roomMembersListContainer.appendChild(card);
  });
}

export function renderSavedPublicRooms(rooms, onJoinRoom) {
  displays.savedPublicRoomsContainer.innerHTML = "";
  displays.savedRoomsCountBadge.textContent = `${rooms.length} Room${rooms.length === 1 ? '' : 's'}`;

  if (!rooms || rooms.length === 0) {
    displays.savedPublicRoomsContainer.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-dim); font-size:0.8rem;">No saved public rooms yet. Create or join a public room code!</div>`;
    return;
  }

  rooms.forEach((room) => {
    const card = document.createElement("div");
    card.className = "saved-room-card";
    card.innerHTML = `
      <div class="saved-room-info">
        <span class="saved-room-code-tag">${room.code} — ${room.name}</span>
        <span class="saved-room-sub">${room.topic} • Last active ${room.lastVisitedAt}</span>
      </div>
      <button class="btn btn-primary btn-join-saved-room" style="height:32px; font-size:0.75rem; padding:0 10px;">Enter Room</button>
    `;

    card.querySelector(".btn-join-saved-room").onclick = () => onJoinRoom(room.code);
    displays.savedPublicRoomsContainer.appendChild(card);
  });
}

export function renderFriendsList(friends, onRemove, onStartPrivateChat) {
  displays.friendsListContainer.innerHTML = "";
  if (!friends || friends.length === 0) {
    displays.friendsListContainer.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-dim); font-size:0.82rem;">No connected friends yet. Add friends by handle above!</div>`;
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

export function renderInviteFriendsList(friends, onInvite) {
  displays.inviteFriendsListContainer.innerHTML = "";
  if (!friends || friends.length === 0) {
    displays.inviteFriendsListContainer.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-dim); font-size:0.82rem;">No connected friends to invite. Add friends from the main hub!</div>`;
    return;
  }

  friends.forEach((handle) => {
    const card = document.createElement("div");
    card.className = "friend-card";
    card.innerHTML = `
      <div class="friend-info">
        <span class="friend-name">${handle}</span>
        <span class="friend-status">Online Friend</span>
      </div>
      <button class="btn btn-primary btn-invite-user" style="height:30px; font-size:0.75rem; padding:0 12px;">Send Invite</button>
    `;

    card.querySelector(".btn-invite-user").onclick = () => onInvite(handle);
    displays.inviteFriendsListContainer.appendChild(card);
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

  if (!messages || messages.length === 0) {
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
    bubble.setAttribute("draggable", "true");
    bubble.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", msg.text || "[Media attachment]");
      e.dataTransfer.setData("application/json", JSON.stringify(msg));
    });

    if (msg.mediaType === "audio" && msg.mediaUrl) {
      const audioEl = document.createElement("audio");
      audioEl.controls = true;
      audioEl.src = msg.mediaUrl;
      audioEl.style.maxWidth = "240px";
      bubble.appendChild(audioEl);
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
