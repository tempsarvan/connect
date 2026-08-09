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
  hasValidSession,
  touchSession,
  saveUserSettings,
  saveProfileCustomization,
  getProfileBio,
  getCustomStatus,
  getProfileBannerColor,
  getUsername,
  getPassword,
  getFriends,
  addFriend,
  removeFriend,
  getSavedPublicRooms,
  savePublicRoomToHub,
  initGlobalEvents,
  sendRoomInvitation,
  MAX_FILE_SIZE_BYTES,
  formatFileSize
} from "./chat";
import { 
  destroyRoomSession, 
  registerUnloadCleanup, 
  unregisterUnloadCleanup 
} from "./cleanup";
import { processImageFile } from "./media";
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
  renderFriendsList,
  renderInviteFriendsList,
  renderSavedPublicRooms,
  openProfileCardModal,
  closeLightbox
} from "./ui";
import { initThreeShowcase } from "./showcase3d";

let currentRoomCode = null;
let isCurrentRoomPublic = false;
let currentPublicRoomInfo = null;

let currentUid = null;
let roomUnsubscribe = null;
let chatUnsubscribe = null;
let currentAuthMode = "signup";
let selectedBannerColor = getProfileBannerColor();

async function init() {
  setupEventListeners();

  try {
    currentUid = await initAuth();
  } catch (err) {
    currentUid = getUserUid();
  }

  if (displays.threeBgCanvas) {
    initThreeShowcase(displays.threeBgCanvas);
  }

  showView("showcase");

  if (hasValidSession()) {
    touchSession();
  }

  // Initialize Global Room Invitation Listener
  initGlobalEvents(({ sender, roomCode, roomName, isPublic }) => {
    showToast(`🔔 ${sender} invited you to ${isPublic ? 'Public' : 'Private'} Room [${roomCode}]!`, 6000);
    inputs.code.value = roomCode;
  });

  updateFriendsUI();
  updateSavedRoomsUI();
}

function enterConnectApp() {
  if (hasValidSession()) {
    touchSession();
    updateProfileUI();
    updateSavedRoomsUI();
    showView("landing");
  } else {
    openAuthModal("signup");
  }
}

function openAuthModal(mode = "signup") {
  currentAuthMode = mode;
  updateAuthModalUI();
  displays.modalAuthLanding.classList.remove("hidden");
  setTimeout(() => inputs.authUsername?.focus(), 100);
}

function closeAuthModal() {
  displays.modalAuthLanding.classList.add("hidden");
}

function updateAuthModalUI() {
  if (currentAuthMode === "signup") {
    buttons.authTabSignup.classList.add("active");
    buttons.authTabLogin.classList.remove("active");
    displays.authModalTitle.textContent = "Sign Up & Claim Unique Handle";
    displays.authModalDesc.textContent = "Your handle is globally locked to your account and cannot be stolen.";
    displays.authSignupOptions.style.display = "block";
    displays.authSubmitText.textContent = "Claim Handle & Enter App";

    inputs.authUsername.value = getUsername() !== "@anonymous" ? getUsername() : "";
    inputs.authPassword.value = getPassword() || "";
  } else {
    buttons.authTabLogin.classList.add("active");
    buttons.authTabSignup.classList.remove("active");
    displays.authModalTitle.textContent = "Log In to Connect";
    displays.authModalDesc.textContent = "Enter your unique handle & PIN passcode to resume session.";
    displays.authSignupOptions.style.display = "none";
    displays.authSubmitText.textContent = "Log In & Enter App";

    inputs.authUsername.value = getUsername() !== "@anonymous" ? getUsername() : "";
    inputs.authPassword.value = getPassword() || "";
  }
}

function handleAuthSubmit() {
  const uname = inputs.authUsername.value.trim();
  const pwd = inputs.authPassword.value.trim();
  const soundOn = inputs.authSoundToggle.checked;
  const vaultOn = inputs.authVaultToggle.checked;

  if (!uname) {
    showToast("Please enter a username or handle");
    return;
  }
  if (!pwd) {
    showToast("Please enter your PIN passcode");
    return;
  }

  try {
    saveUserSettings(uname, pwd, soundOn, vaultOn, currentUid);
    updateProfileUI();
    closeAuthModal();

    showToast(`Authenticated as ${getUsername()}. Welcome!`);
    updateSavedRoomsUI();
    showView("landing");
  } catch (err) {
    showToast(err.message);
  }
}

function updateProfileUI() {
  const uname = getUsername();
  const pwd = getPassword();

  inputs.settingUsername.value = uname;
  inputs.settingPassword.value = pwd;

  displays.landingUsernameLabel.textContent = uname;
  displays.chatHeaderUsername.textContent = uname;
}

function updateSavedRoomsUI() {
  const rooms = getSavedPublicRooms();
  renderSavedPublicRooms(rooms, (code) => {
    inputs.code.value = code;
    handleJoinRoom();
  });
}

function openEditProfileStudio() {
  inputs.profileBioInput.value = getProfileBio();
  inputs.profileStatusInput.value = getCustomStatus();
  selectedBannerColor = getProfileBannerColor();

  document.querySelectorAll(".banner-swatch").forEach((swatch) => {
    if (swatch.dataset.color === selectedBannerColor) swatch.classList.add("active");
    else swatch.classList.remove("active");
  });

  displays.modalEditProfile.classList.remove("hidden");
}

function closeEditProfileStudio() {
  displays.modalEditProfile.classList.add("hidden");
}

function handleSaveProfileCustomization() {
  const bio = inputs.profileBioInput.value;
  const status = inputs.profileStatusInput.value;

  saveProfileCustomization(bio, status, selectedBannerColor, "code");
  updateProfileUI();
  closeEditProfileStudio();
  showToast("Profile customization saved!");
}

function openCreatePublicModal() {
  inputs.publicRoomName.value = "";
  inputs.publicRoomTopic.value = "";
  displays.modalCreatePublicRoom.classList.remove("hidden");
  setTimeout(() => inputs.publicRoomName.focus(), 100);
}

function handleCreatePublicCodeSubmit() {
  const name = inputs.publicRoomName.value.trim();
  const topic = inputs.publicRoomTopic.value.trim();

  if (!name) {
    showToast("Please enter a room name e.g. Lounge, Beats, Dev Squad");
    return;
  }

  displays.modalCreatePublicRoom.classList.add("hidden");
  handleCreateRoom(true, name, topic);
}

function openInviteFriendsModal() {
  const friends = getFriends();

  renderInviteFriendsList(friends, (friendHandle) => {
    if (!currentRoomCode) {
      showToast("No active room code to share.");
      return;
    }
    sendRoomInvitation(friendHandle, currentRoomCode, currentPublicRoomInfo?.name || null, isCurrentRoomPublic);
    showToast(`Sent ${isCurrentRoomPublic ? 'Public' : 'Private'} Room code [${currentRoomCode}] to ${friendHandle}!`);
  });

  displays.modalInviteFriends.classList.remove("hidden");
}

function updateFriendsUI() {
  const friends = getFriends();
  renderFriendsList(
    friends,
    (friendHandle) => {
      removeFriend(friendHandle);
      updateFriendsUI();
      showToast(`Removed ${friendHandle} from friends.`);
    },
    (friendHandle) => {
      displays.modalFriendsList.classList.add("hidden");
      handleCreateRoom(false);
      showToast(`Starting private room for ${friendHandle}...`);
    }
  );
}

function setupEventListeners() {
  // Navigation & Landing Page Auth
  buttons.navLogin.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("login");
  });

  buttons.navSignup.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("signup");
  });

  buttons.heroLogin.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("login");
  });

  buttons.heroSignup.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("signup");
  });

  buttons.finalLogin.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("login");
  });

  buttons.enterConnectFinal.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("signup");
  });

  buttons.navTour.addEventListener("click", () => {
    document.getElementById("section-tour-details")?.scrollIntoView({ behavior: "smooth" });
  });

  buttons.startTourScroll.addEventListener("click", () => {
    document.getElementById("section-tour-details")?.scrollIntoView({ behavior: "smooth" });
  });

  buttons.navFeatures.addEventListener("click", () => {
    document.getElementById("section-tour-details")?.scrollIntoView({ behavior: "smooth" });
  });

  // Auth Modal Handlers
  buttons.closeAuthModal.addEventListener("click", closeAuthModal);
  buttons.authTabSignup.addEventListener("click", () => {
    currentAuthMode = "signup";
    updateAuthModalUI();
  });
  buttons.authTabLogin.addEventListener("click", () => {
    currentAuthMode = "login";
    updateAuthModalUI();
  });
  buttons.submitAuth.addEventListener("click", handleAuthSubmit);

  // Profile Customization Studio Handlers
  buttons.closeProfileCard.addEventListener("click", () => displays.modalProfileCard.classList.add("hidden"));
  buttons.closeEditProfile.addEventListener("click", closeEditProfileStudio);
  buttons.saveProfileCustomization.addEventListener("click", handleSaveProfileCustomization);

  document.querySelectorAll(".banner-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".banner-swatch").forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      selectedBannerColor = swatch.dataset.color;
    });
  });

  // Create Public Code Handlers
  buttons.createPublicCode.addEventListener("click", openCreatePublicModal);
  buttons.closeCreatePublic.addEventListener("click", () => displays.modalCreatePublicRoom.classList.add("hidden"));
  buttons.submitCreatePublic.addEventListener("click", handleCreatePublicCodeSubmit);

  // Room Invitations Handlers
  buttons.inviteFriendsWaiting.addEventListener("click", openInviteFriendsModal);
  buttons.inviteFriendsChat.addEventListener("click", openInviteFriendsModal);
  buttons.closeInviteFriends.addEventListener("click", () => displays.modalInviteFriends.classList.add("hidden"));

  // Friends List Drawer Handlers
  buttons.friendsDrawer.addEventListener("click", () => {
    updateFriendsUI();
    displays.modalFriendsList.classList.remove("hidden");
  });

  buttons.closeFriendsModal.addEventListener("click", () => {
    displays.modalFriendsList.classList.add("hidden");
  });

  buttons.addFriendSubmit.addEventListener("click", () => {
    const handle = inputs.addFriendHandle.value.trim();
    if (!handle) {
      showToast("Please enter a username or handle");
      return;
    }
    try {
      addFriend(handle);
      inputs.addFriendHandle.value = "";
      updateFriendsUI();
      showToast(`Added ${handle} to your friends list!`);
    } catch (err) {
      showToast(err.message);
    }
  });

  // Private & Public Room Creation & Joining
  buttons.createPrivateCode.addEventListener("click", () => handleCreateRoom(false));
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

  // Profile Cards on Header Pills
  buttons.profileLanding.addEventListener("click", () => openProfileCardModal(getUsername(), true, openEditProfileStudio));
  buttons.profileHeader.addEventListener("click", () => openProfileCardModal(getUsername(), true, openEditProfileStudio));

  // Settings Gear
  buttons.gearLanding.addEventListener("click", openFullscreenSettings);
  buttons.gearChat.addEventListener("click", openFullscreenSettings);
  buttons.closeFullscreenSettings.addEventListener("click", closeFullscreenSettings);
  buttons.saveFullscreenSettings.addEventListener("click", handleSaveSettings);

  // Chat Send
  buttons.send.addEventListener("click", handleSendMessage);
  inputs.message.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // File Upload Handlers
  inputs.fileUpload.addEventListener("change", (e) => handleFileUpload(e, currentRoomCode));
  inputs.photoUpload.addEventListener("change", (e) => handlePhotoUpload(e, currentRoomCode));

  buttons.closeLightbox.addEventListener("click", closeLightbox);
}

function openFullscreenSettings() {
  updateProfileUI();
  displays.modalSettingsFullscreen.classList.remove("hidden");
}

function closeFullscreenSettings() {
  displays.modalSettingsFullscreen.classList.add("hidden");
}

function handleSaveSettings() {
  const uname = inputs.settingUsername.value.trim();
  const pwd = inputs.settingPassword.value.trim();

  if (!uname) {
    showToast("Please enter a valid username");
    return;
  }

  try {
    saveUserSettings(uname, pwd, true, true, currentUid);
    updateProfileUI();
    closeFullscreenSettings();
    showToast("Settings applied & saved");
  } catch (err) {
    showToast(err.message);
  }
}

async function handleSendMessage() {
  const text = inputs.message.value.trim();
  if (!text || !currentRoomCode) return;

  inputs.message.value = "";
  
  await sendMessage(currentRoomCode, currentUid, {
    text,
    mediaType: "text"
  });

  inputs.message.focus();
}

async function handlePhotoUpload(e, targetRoomId) {
  const file = e.target.files[0];
  if (!file || !targetRoomId) return;

  try {
    showToast("Processing photo...");
    const dataUrl = await processImageFile(file);
    
    await sendMessage(targetRoomId, currentUid, {
      text: "",
      mediaType: "image",
      mediaUrl: dataUrl
    });

    e.target.value = "";
  } catch (err) {
    showToast("Could not send image: " + err.message);
  }
}

async function handleFileUpload(e, targetRoomId) {
  const file = e.target.files[0];
  if (!file || !targetRoomId) return;

  if (file.size > MAX_FILE_SIZE_BYTES) {
    showToast("File exceeds maximum 1 Terabyte (1 TB) size limit.");
    e.target.value = "";
    return;
  }

  try {
    const formattedSize = formatFileSize(file.size);
    showToast(`Attaching ${file.name} (${formattedSize})...`);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      
      await sendMessage(targetRoomId, currentUid, {
        text: file.name,
        mediaType: "file",
        mediaUrl: dataUrl,
        fileName: file.name,
        fileSize: formattedSize,
        fileSizeBytes: file.size
      });

      e.target.value = "";
      showToast(`Attachment sent (${formattedSize})`);
    };
    reader.readAsDataURL(file);
  } catch (err) {
    showToast("Could not send file: " + err.message);
  }
}

async function handleCreateRoom(isPublic = false, roomName = null, roomTopic = null) {
  if (!currentUid) currentUid = getUserUid();

  const roomCode = generateRoomCode();
  isCurrentRoomPublic = isPublic;
  
  if (isPublic) {
    currentPublicRoomInfo = {
      name: roomName || `Public Room ${roomCode}`,
      topic: roomTopic || "Persistent community space"
    };
  } else {
    currentPublicRoomInfo = null;
  }

  try {
    await createRoom(roomCode, currentUid);
    currentRoomCode = roomCode;
    
    if (!isCurrentRoomPublic) {
      registerUnloadCleanup(currentRoomCode);
    }

    displays.roomCode.textContent = roomCode;
    displays.roomTypeBadgeWaiting.textContent = isPublic ? "🌐 Persistent Public Room Code" : "🔒 Ephemeral Private Room Code";
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
  }
}

async function handleJoinRoom() {
  const code = inputs.code.value.trim().toUpperCase();
  if (!code || code.length !== 6) {
    showToast("Please enter a valid 6-character code");
    return;
  }

  buttons.join.disabled = true;
  if (!currentUid) currentUid = getUserUid();

  try {
    await joinRoom(code, currentUid);
    currentRoomCode = code;

    // Check if room code exists in saved public rooms
    const savedRooms = getSavedPublicRooms();
    const match = savedRooms.find((r) => r.code === code);
    if (match) {
      isCurrentRoomPublic = true;
      currentPublicRoomInfo = match;
    } else {
      isCurrentRoomPublic = false;
      registerUnloadCleanup(currentRoomCode);
    }

    startChatSession();
  } catch (err) {
    showToast(err.message || "Could not join room.");
  } finally {
    buttons.join.disabled = false;
  }
}

function startChatSession() {
  displays.chatRoomCode.textContent = currentRoomCode;
  displays.chatHeaderRoomType.textContent = isCurrentRoomPublic ? "🌐 public room" : "🔒 private room";
  showView("chat");
  setTimeout(() => inputs.message.focus(), 100);

  if (chatUnsubscribe) chatUnsubscribe();
  chatUnsubscribe = listenToMessages(currentRoomCode, currentUid, (messages) => {
    renderMessages(messages, currentUid, displays.messagesList);
  });

  if (roomUnsubscribe) roomUnsubscribe();
  roomUnsubscribe = listenToRoom(currentRoomCode, (roomData) => {
    if (!roomData || roomData.status === "ended") {
      onSessionEnded();
    }
  });
}

async function handleCancelRoom() {
  if (currentRoomCode && !isCurrentRoomPublic) {
    await destroyRoomSession(currentRoomCode);
  }
  resetAppState();
}

async function handleEndSession() {
  if (isCurrentRoomPublic && currentRoomCode) {
    savePublicRoomToHub(currentRoomCode, currentPublicRoomInfo?.name, currentPublicRoomInfo?.topic);
    showToast(`Saved ${currentRoomCode} to your Rooms hub.`);
  } else if (currentRoomCode) {
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

  if (isCurrentRoomPublic) {
    displays.overlaySubtitleDesc.textContent = "public room saved to your Rooms section";
  } else {
    displays.overlaySubtitleDesc.textContent = "all private room messages destroyed";
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
  isCurrentRoomPublic = false;
  currentPublicRoomInfo = null;
  
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
  buttons.join.disabled = false;
  displays.messagesList.innerHTML = "";

  updateProfileUI();
  updateSavedRoomsUI();
  showView("landing");
}

init();
