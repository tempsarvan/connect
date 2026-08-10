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
  getFriendKey,
  MAX_FILE_SIZE_BYTES,
  formatFileSize
} from "./chat";
import { 
  destroyRoomSession, 
  registerUnloadCleanup, 
  unregisterUnloadCleanup 
} from "./cleanup";
import { processImageFile } from "./media";
import { startVoiceRecording, stopVoiceRecording } from "./audio";
import { exportVaultBackup, panicWipeAllData } from "./vault";
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
  renderRoomMembers,
  openProfileCardModal,
  closeLightbox
} from "./ui";
import { initThreeShowcase } from "./showcase3d";
import { soundEngine } from "./sound";

let currentRoomCode = null;
let isCurrentRoomPublic = false;
let currentPublicRoomInfo = null;
let currentRoomMembersList = [];

let currentUid = null;
let roomUnsubscribe = null;
let chatUnsubscribe = null;
let currentAuthMode = "signup";
let selectedBannerColor = getProfileBannerColor();
let isRecordingVoice = false;

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

  // Auto-join via QR Code Scan Query URL Parameter e.g. ?join=X7K9P2
  const urlParams = new URLSearchParams(window.location.search);
  const qrJoinCode = urlParams.get("join") || urlParams.get("code");

  if (qrJoinCode && qrJoinCode.length === 6) {
    inputs.code.value = qrJoinCode.toUpperCase();
    showView("landing");
    setTimeout(() => {
      handleJoinRoom();
      showToast(`Scanned QR Code! Auto-entering room [${qrJoinCode.toUpperCase()}]...`);
    }, 400);
  } else {
    // Default directly to Connect Messenger Dashboard (Landing)
    showView("landing");
  }

  if (hasValidSession()) {
    touchSession();
  }

  // Initialize Global Room Invitation Listener
  initGlobalEvents(({ sender, roomCode, roomName, isPublic }) => {
    soundEngine.playSoundFX("bell");
    showToast(`🔔 ${sender} invited you to ${isPublic ? 'Public' : 'Private'} Room [${roomCode}]!`, 6000);
    inputs.code.value = roomCode;
  });

  updateProfileUI();
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
  const soundOn = inputs.authSoundToggle ? inputs.authSoundToggle.checked : true;
  const vaultOn = inputs.authVaultToggle ? inputs.authVaultToggle.checked : true;

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

    soundEngine.playSoundFX("bell");
    showToast(`Authenticated as ${getUsername()}. Welcome to Connect!`);
    updateSavedRoomsUI();
    showView("landing");
  } catch (err) {
    showToast(err.message);
  }
}

function updateProfileUI() {
  const uname = getUsername();
  const pwd = getPassword();

  if (inputs.settingUsername) inputs.settingUsername.value = uname;
  if (inputs.settingPassword) inputs.settingPassword.value = pwd;
  if (inputs.settingFriendKey) inputs.settingFriendKey.value = getFriendKey();

  if (displays.landingUsernameLabel) displays.landingUsernameLabel.textContent = uname;
  if (displays.chatHeaderUsername) displays.chatHeaderUsername.textContent = uname;
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
  // Voice Recording Toggle
  buttons.recordVoiceNote?.addEventListener("click", async () => {
    displays.dropdownToolsMenu.classList.add("hidden");
    if (!isRecordingVoice) {
      isRecordingVoice = true;
      showToast("🎙️ Recording Voice Note... Tap again to send!");
      await startVoiceRecording();
    } else {
      isRecordingVoice = false;
      showToast("Processing Voice Note...");
      const audioUrl = await stopVoiceRecording();
      if (audioUrl && currentRoomCode) {
        await sendMessage(currentRoomCode, currentUid, {
          text: "🎙️ Voice Note",
          mediaType: "audio",
          mediaUrl: audioUrl
        });
        soundEngine.playMessageDing();
        showToast("Voice Note sent!");
      }
    }
  });

  // Room Member Drawer
  buttons.membersDrawer?.addEventListener("click", () => {
    renderRoomMembers(currentRoomMembersList);
    displays.modalRoomMembers.classList.remove("hidden");
  });

  buttons.closeRoomMembers?.addEventListener("click", () => {
    displays.modalRoomMembers.classList.add("hidden");
  });

  // Panic Wipe & Vault Export
  buttons.panicWipe?.addEventListener("click", () => {
    if (confirm("⚡ Are you sure you want to 1-Click Panic Wipe all local memory, cookies, and tokens?")) {
      panicWipeAllData();
    }
  });

  buttons.exportVault?.addEventListener("click", () => {
    exportVaultBackup();
    showToast("Vault Backup downloaded!");
  });

  // Upward Expanding Tools Menu Toggle
  buttons.toolsMenuToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    displays.dropdownToolsMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (displays.dropdownToolsMenu && !displays.dropdownToolsMenu.contains(e.target) && e.target !== buttons.toolsMenuToggle) {
      displays.dropdownToolsMenu.classList.add("hidden");
    }
  });

  // Showcase Navigation & Tour
  buttons.navLogin?.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("login");
  });

  buttons.navSignup?.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("signup");
  });

  buttons.heroLogin?.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("login");
  });

  buttons.heroSignup?.addEventListener("click", () => {
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("signup");
  });

  buttons.navTour?.addEventListener("click", () => {
    showView("showcase");
    setTimeout(() => {
      document.getElementById("section-tour-details")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  });

  buttons.startTourScroll?.addEventListener("click", () => {
    document.getElementById("section-tour-details")?.scrollIntoView({ behavior: "smooth" });
  });

  buttons.navFeatures?.addEventListener("click", () => {
    showView("showcase");
    setTimeout(() => {
      document.getElementById("section-tour-details")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  });

  // Auth Modal Handlers
  buttons.closeAuthModal?.addEventListener("click", closeAuthModal);
  buttons.authTabSignup?.addEventListener("click", () => {
    currentAuthMode = "signup";
    updateAuthModalUI();
  });
  buttons.authTabLogin?.addEventListener("click", () => {
    currentAuthMode = "login";
    updateAuthModalUI();
  });
  buttons.submitAuth?.addEventListener("click", handleAuthSubmit);

  // Profile Customization Studio Handlers
  buttons.closeProfileCard?.addEventListener("click", () => displays.modalProfileCard.classList.add("hidden"));
  buttons.closeEditProfile?.addEventListener("click", closeEditProfileStudio);
  buttons.saveProfileCustomization?.addEventListener("click", handleSaveProfileCustomization);

  document.querySelectorAll(".banner-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".banner-swatch").forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      selectedBannerColor = swatch.dataset.color;
    });
  });

  // Create Public Code Handlers
  buttons.createPublicCode?.addEventListener("click", openCreatePublicModal);
  buttons.closeCreatePublic?.addEventListener("click", () => displays.modalCreatePublicRoom.classList.add("hidden"));
  buttons.submitCreatePublic?.addEventListener("click", handleCreatePublicCodeSubmit);

  // Room Invitations Handlers
  buttons.inviteFriendsChat?.addEventListener("click", openInviteFriendsModal);
  buttons.closeInviteFriends?.addEventListener("click", () => displays.modalInviteFriends.classList.add("hidden"));

  // Friends List Drawer Handlers
  buttons.friendsDrawer?.addEventListener("click", () => {
    updateFriendsUI();
    displays.modalFriendsList.classList.remove("hidden");
  });

  buttons.closeFriendsModal?.addEventListener("click", () => {
    displays.modalFriendsList.classList.add("hidden");
  });

  buttons.addFriendSubmit?.addEventListener("click", () => {
    const handleOrKey = inputs.addFriendHandle.value.trim();
    if (!handleOrKey) {
      showToast("Please enter a handle or Friend Key e.g. CN-9X4A-82");
      return;
    }
    try {
      addFriend(handleOrKey);
      inputs.addFriendHandle.value = "";
      updateFriendsUI();
      showToast(`Added friend connection successfully!`);
    } catch (err) {
      showToast(err.message);
    }
  });

  // Private & Public Room Creation & Joining
  buttons.createPrivateCode?.addEventListener("click", () => handleCreateRoom(false));
  buttons.join?.addEventListener("click", handleJoinRoom);

  inputs.code?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleJoinRoom();
  });

  inputs.code?.addEventListener("input", () => {
    inputs.code.value = inputs.code.value.toUpperCase().trim();
  });

  buttons.copyCode?.addEventListener("click", () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
      showToast(`Room code [${currentRoomCode}] copied to clipboard!`);
    }
  });

  buttons.endSession?.addEventListener("click", handleEndSession);
  buttons.returnHome?.addEventListener("click", handleReturnHome);

  // Profile Cards on Header Pills
  buttons.profileLanding?.addEventListener("click", () => openProfileCardModal(getUsername(), true, openEditProfileStudio));
  buttons.profileHeader?.addEventListener("click", () => openProfileCardModal(getUsername(), true, openEditProfileStudio));

  // Settings Gear
  buttons.gearLanding?.addEventListener("click", openFullscreenSettings);
  buttons.gearChat?.addEventListener("click", openFullscreenSettings);
  buttons.closeFullscreenSettings?.addEventListener("click", closeFullscreenSettings);
  buttons.saveFullscreenSettings?.addEventListener("click", handleSaveSettings);

  // Chat Send
  buttons.send?.addEventListener("click", handleSendMessage);
  inputs.message?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // File Upload Handlers
  inputs.fileUpload?.addEventListener("change", (e) => {
    displays.dropdownToolsMenu.classList.add("hidden");
    handleFileUpload(e, currentRoomCode);
  });
  inputs.photoUpload?.addEventListener("change", (e) => {
    displays.dropdownToolsMenu.classList.add("hidden");
    handlePhotoUpload(e, currentRoomCode);
  });

  buttons.closeLightbox?.addEventListener("click", closeLightbox);
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

  soundEngine.playMessageDing();
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
    soundEngine.playMessageDing();
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
      soundEngine.playMessageDing();
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
    savePublicRoomToHub(roomCode, currentPublicRoomInfo.name, currentPublicRoomInfo.topic);
  } else {
    currentPublicRoomInfo = null;
  }

  try {
    await createRoom(roomCode, currentUid);
    currentRoomCode = roomCode;
    
    if (!isCurrentRoomPublic) {
      registerUnloadCleanup(currentRoomCode);
    }

    // Instantly launch chat room session so messenger is immediately active!
    soundEngine.playSoundFX("bell");
    startChatSession();
    showToast(`Created ${isPublic ? 'Public' : 'Private'} Room [${roomCode}]! Share code to chat.`);
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
    await joinRoom(code, currentUid, getUsername());
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

    soundEngine.playSoundFX("bell");
    startChatSession();
    showToast(`Entered Room [${code}]!`);
  } catch (err) {
    showToast(err.message || "Could not join room.");
  } finally {
    buttons.join.disabled = false;
  }
}

function startChatSession() {
  displays.chatRoomCode.textContent = currentRoomCode;
  displays.chatHeaderRoomType.textContent = isCurrentRoomPublic ? `🌐 ${currentPublicRoomInfo?.name || 'Public Room'}` : "🔒 Ephemeral Room";
  showView("chat");
  setTimeout(() => inputs.message.focus(), 100);

  if (chatUnsubscribe) chatUnsubscribe();
  chatUnsubscribe = listenToMessages(currentRoomCode, currentUid, (messages) => {
    renderMessages(messages, currentUid, displays.messagesList);
  });

  if (roomUnsubscribe) roomUnsubscribe();
  roomUnsubscribe = listenToRoom(currentRoomCode, (roomData) => {
    if (roomData && roomData.members) {
      currentRoomMembersList = roomData.members;
    }
    if (!roomData || roomData.status === "ended") {
      onSessionEnded();
    }
  });
}

async function handleEndSession() {
  if (isCurrentRoomPublic && currentRoomCode) {
    savePublicRoomToHub(currentRoomCode, currentPublicRoomInfo?.name, currentPublicRoomInfo?.topic);
    showToast(`Saved [${currentRoomCode}] to your Public Rooms Hub.`);
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
    displays.overlaySubtitleDesc.textContent = "public room saved to your Rooms Hub";
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
  currentRoomMembersList = [];
  
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
