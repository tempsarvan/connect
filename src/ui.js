import { publicRooms, getProfileBio, getCustomStatus, getProfileBannerColor } from "./chat";

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
  customizeProfileQuick: document.getElementById("btn-customize-profile-quick"),
  closeProfileCard: document.getElementById("btn-close-profile-card"),
  editProfileFromCard: document.getElementById("btn-edit-profile-from-card"),
  closeEditProfile: document.getElementById("btn-close-edit-profile"),
  saveProfileCustomization: document.getElementById("btn-save-profile-customization"),
  createPublicSidebar: document.getElementById("btn-create-public-channel-sidebar"),
  openCreatePublicModal: document.getElementById("btn-open-create-public-modal"),
  closeCreatePublic: document.getElementById("btn-close-create-public"),
  submitCreatePublic: document.getElementById("btn-submit-create-public"),
  invitePublicChannel: document.getElementById("btn-invite-public-channel"),
  inviteFriendsWaiting: document.getElementById("btn-invite-friends-waiting"),
  inviteFriendsChat: document.getElementById("btn-invite-friends-chat"),
  closeInviteFriends: document.getElementById("btn-close-invite-friends"),
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
  publicRoomName: document.getElementById("input-public-room-name"),
  publicRoomTopic: document.getElementById("input-public-room-topic"),
  profileBioInput: document.getElementById("profile-bio-input"),
  profileStatusInput: document.getElementById("profile-status-input"),
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
  modalCreatePublicRoom: document.getElementById("modal-create-public-room"),
  modalInviteFriends: document.getElementById("modal-invite-friends"),
  inviteFriendsListContainer: document.getElementById("invite-friends-list-container"),
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
  discordMyStatus: document.getElementById("discord-my-status"),
  modalProfileCard: document.getElementById("modal-profile-card"),
  profileCardBanner: document.getElementById("profile-card-banner"),
  profileCardHandle: document.getElementById("profile-card-handle"),
  profileCardStatus: document.getElementById("profile-card-status"),
  profileCardBio: document.getElementById("profile-card-bio"),
  modalEditProfile: document.getElementById("modal-edit-profile"),
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

export function openProfileCardModal(username, isMe = true, onEditClick = null) {
  displays.profileCardHandle.textContent = username;
  displays.profileCardStatus.textContent = getCustomStatus();
  displays.profileCardBio.textContent = getProfileBio();
  displays.profileCardBanner.style.background = getProfileBannerColor();

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

export function renderPublicRoomsExplorer(onJoinChannel) {
  displays.publicRoomsExplorerList.innerHTML = "";
  displays.publicChannelsListPreview.innerHTML = "";

  publicRooms.forEach((room) => {
    const card = document.createElement("div");
    card.className = "explorer-room-card";
    card.innerHTML = `
      <div class="explorer-info">
        <span class="explorer-title">${room.name}</span>
        <span class="explorer-sub">${room.topic}</span>
      </div>
      <button class="btn btn-primary btn-join-pub" style="height:34px; font-size:0.8rem; padding:0 12px;">Join Channel</button>
    `;
    card.querySelector(".btn-join-pub").onclick = () => onJoinChannel(room);
    displays.publicRoomsExplorerList.appendChild(card);

    const prevBtn = document.createElement("div");
    prevBtn.className = "channel-preview-btn";
    prevBtn.innerHTML = `
      <span>${room.name}</span>
      <span style="font-size:0.72rem; color:var(--text-dim);">Public</span>
    `;
    prevBtn.onclick = () => onJoinChannel(room);
    displays.publicChannelsListPreview.appendChild(prevBtn);
  });
}

export function renderDiscordChannelsList(activeChannelId, onSelectChannel) {
  displays.discordChannelsList.innerHTML = "";

  publicRooms.forEach((room) => {
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

export function renderDiscordMembers(myUsername, friends, onMemberClick = null) {
  displays.discordMembersList.innerHTML = "";
  
  // Render ONLY actual users (myUsername + actual added friends in network)
  const actualUsers = Array.from(new Set([myUsername, ...(friends || [])])).filter(Boolean);

  if (actualUsers.length === 0) {
    displays.discordMembersList.innerHTML = `<div style="padding:12px; font-size:0.75rem; color:var(--text-dim); text-align:center;">No active members online</div>`;
    return;
  }

  actualUsers.forEach((name) => {
    const item = document.createElement("div");
    item.className = "member-item";
    item.innerHTML = `
      <div class="user-status-avatar" style="width:24px; height:24px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <span style="font-size:0.82rem; color:${name === myUsername ? '#60a5fa' : 'var(--text)'}">${name} ${name === myUsername ? '(You)' : ''}</span>
    `;
    if (onMemberClick) item.onclick = () => onMemberClick(name);
    displays.discordMembersList.appendChild(item);
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
