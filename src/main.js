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
import { generateQRCodeSVG } from "./qrcode";
import { startVoiceRecording, stopVoiceRecording } from "./audio";
import { exportVaultBackup, panicWipeAllData } from "./vault";
import { runJavaScriptSnippet } from "./devSuite";
import { initDesignCanvas, generateColorPalette } from "./designSuite";
import { triggerVariantTransition } from "./variantTransitions";
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

import { MatrixScrambler } from "./matrixScrambler";

let currentRoomCode = null;
let isCurrentRoomPublic = false;
let currentPublicRoomInfo = null;
let currentRoomMembersList = [];

let currentUid = null;
let roomUnsubscribe = null;
let chatUnsubscribe = null;
let currentAuthMode = "signup";
let selectedBannerColor = getProfileBannerColor();
let selectedDeviceMode = "computer";
let isRecordingVoice = false;
let currentEdition = "standard";
let designCanvasControls = null;
let matrixScramblerInstance = null;

async function init() {
  setupEventListeners();
  setupEditionSwitcher();

  try {
    currentUid = await initAuth();
  } catch (err) {
    currentUid = getUserUid();
  }

  if (displays.threeBgCanvas) {
    initThreeShowcase(displays.threeBgCanvas);
  }

  // Initialize Matrix Text Scrambler Engine on Footer Button
  const scrambleTarget = document.getElementById("matrix-scramble-output");
  if (scrambleTarget) {
    matrixScramblerInstance = new MatrixScrambler(scrambleTarget, "Enter Connect's World");
  }

  // Auto-join via QR Code Scan Query URL Parameter e.g. ?join=X7K9P2
  const urlParams = new URLSearchParams(window.location.search);
  const qrJoinCode = urlParams.get("join") || urlParams.get("code");
  const editionParam = urlParams.get("edition");

  if (editionParam) {
    switchEdition(editionParam);
  }

  if (qrJoinCode && qrJoinCode.length === 6) {
    inputs.code.value = qrJoinCode.toUpperCase();
    showView("landing");
    setTimeout(() => {
      handleJoinRoom();
      showToast(`Scanned QR Code! Auto-entering room [${qrJoinCode.toUpperCase()}]...`);
    }, 400);
  } else {
    showView("showcase");
  }

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

function switchEdition(edition) {
  if (edition === currentEdition) return;

  const oldEdition = currentEdition;
  triggerVariantTransition(oldEdition, edition, () => {
    currentEdition = edition;
    document.body.dataset.edition = edition;

    document.querySelectorAll(".edition-tab").forEach((tab) => {
      if (tab.dataset.edition === edition) tab.classList.add("active");
      else tab.classList.remove("active");
    });

    document.querySelectorAll(".variant-animated-tab").forEach((tab) => {
      if (tab.dataset.variant === edition) tab.classList.add("active");
      else tab.classList.remove("active");
    });

    document.querySelectorAll(".edition-card").forEach((card) => {
      if (card.dataset.editionSelect === edition) card.classList.add("active");
      else card.classList.remove("active");
    });

    const heroBadge = document.getElementById("hero-badge-edition-text");
    const heroHeadline = document.getElementById("hero-headline-edition");
    const heroSubtitle = document.getElementById("hero-subtitle-edition");
    const landingTagline = document.getElementById("landing-tagline-edition");

    if (edition === "dev") {
      if (heroBadge) heroBadge.textContent = "CONNECT FOR CODERS • MONOKAI IDE SUITE";
      if (heroHeadline) heroHeadline.innerHTML = "Code together.<br>Ship zero-trace.";
      if (heroSubtitle) heroSubtitle.textContent = "Built for developers & coders. Experience live JS evaluator console, syntax highlighting, Git snippet sharing, and 1 TB archives.";
      if (landingTagline) landingTagline.textContent = "programmer IDE chat & live code execution suite";
      showToast("Switched to Connect for Coders edition 💻");
    } else if (edition === "design") {
      if (heroBadge) heroBadge.textContent = "CONNECT FOR DESIGNERS • CANVAS SUITE";
      if (heroHeadline) heroHeadline.innerHTML = "Design together.<br>Canvas whiteboards.";
      if (heroSubtitle) heroSubtitle.textContent = "Built for designers & creators. Experience collaborative whiteboard canvas, color palette generators, and HSL moodboards.";
      if (landingTagline) landingTagline.textContent = "designer whiteboard canvas & moodboard suite";
      showToast("Switched to Connect for Designers edition 🎨");
    } else {
      if (heroBadge) heroBadge.textContent = "ZERO-TRACE EPHEMERAL & PERSISTENT SUITE";
      if (heroHeadline) heroHeadline.innerHTML = "Talk freely.<br>Leave no trace.";
      if (heroSubtitle) heroSubtitle.textContent = "Connect is a hybrid communications suite engineered for phone, tablet, and desktop. Experience 6-digit private & public room codes, instant device QR pairing, unique handle protection, and 1 TB file support.";
      if (landingTagline) landingTagline.textContent = "ephemeral private & persistent public rooms";
      showToast("Switched to Just Connect Standard edition ⚡");
    }
  });
}

function setupEditionSwitcher() {
  document.querySelectorAll(".edition-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchEdition(btn.dataset.edition));
  });

  document.querySelectorAll(".variant-animated-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchEdition(btn.dataset.variant));
  });

  document.querySelectorAll(".btn-select-edition").forEach((btn) => {
    btn.addEventListener("click", () => switchEdition(btn.dataset.editionSelect));
  });

  document.getElementById("link-edition-std")?.addEventListener("click", (e) => { e.preventDefault(); switchEdition("standard"); });
  document.getElementById("link-edition-dev")?.addEventListener("click", (e) => { e.preventDefault(); switchEdition("dev"); });
  document.getElementById("link-edition-design")?.addEventListener("click", (e) => { e.preventDefault(); switchEdition("design"); });

  document.getElementById("link-variant-std")?.addEventListener("click", (e) => { e.preventDefault(); switchEdition("standard"); });
  document.getElementById("link-variant-dev")?.addEventListener("click", (e) => { e.preventDefault(); switchEdition("dev"); });
  document.getElementById("link-variant-design")?.addEventListener("click", (e) => { e.preventDefault(); switchEdition("design"); });
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
  inputs.settingFriendKey.value = getFriendKey();

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

function updateDevicePairingUI() {
  buttons.deviceComputer.classList.remove("active");
  buttons.deviceTablet.classList.remove("active");
  buttons.devicePhone.classList.remove("active");

  if (selectedDeviceMode === "computer") {
    buttons.deviceComputer.classList.add("active");
    displays.qrCodeDisplayWrapper.classList.add("hidden");
  } else if (selectedDeviceMode === "tablet" || selectedDeviceMode === "phone") {
    if (selectedDeviceMode === "tablet") buttons.deviceTablet.classList.add("active");
    if (selectedDeviceMode === "phone") buttons.devicePhone.classList.add("active");

    displays.qrCodeVectorContainer.innerHTML = `
      <div class="wip-notice-card" style="padding:24px 16px; text-align:center; background:rgba(18,18,24,0.85); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.15); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.5); max-width:280px; margin:0 auto;">
        <div style="font-size:2rem; margin-bottom:8px;">🚧</div>
        <h4 style="color:#ffffff; font-size:0.95rem; font-weight:700; letter-spacing:-0.01em;">Work In Progress</h4>
        <p style="color:var(--text-muted); font-size:0.78rem; margin-top:6px; line-height:1.5;">${selectedDeviceMode === "phone" ? "Phone" : "Tablet"} device pairing is under active development. Please enter the 6-digit room code directly on your device!</p>
      </div>
    `;
    displays.qrCodeDisplayWrapper.classList.remove("hidden");
  }
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
  // Enter Connect's World Matrix Scrambler Button Handler
  document.getElementById("scramble-text-btn")?.addEventListener("click", () => {
    document.getElementById("modal-connect-world-panel")?.classList.remove("hidden");
  });

  document.getElementById("btn-close-world-panel")?.addEventListener("click", () => {
    document.getElementById("modal-connect-world-panel")?.classList.add("hidden");
  });

  document.querySelectorAll(".world-variant-option").forEach((card) => {
    card.addEventListener("click", () => {
      const variant = card.dataset.launchVariant;
      switchEdition(variant);
      document.getElementById("modal-connect-world-panel")?.classList.add("hidden");
      enterConnectApp();
    });
  });

  // Dev & Design Tools Modal Triggers
  document.getElementById("btn-open-dev-tools")?.addEventListener("click", () => {
    document.getElementById("modal-dev-editor")?.classList.remove("hidden");
  });
  document.getElementById("btn-close-dev-editor")?.addEventListener("click", () => {
    document.getElementById("modal-dev-editor")?.classList.add("hidden");
  });

  document.getElementById("btn-run-dev-code")?.addEventListener("click", () => {
    const code = document.getElementById("dev-code-input").value;
    const res = runJavaScriptSnippet(code);
    const out = document.getElementById("dev-console-output");
    if (res.success) {
      out.textContent = `> Output: ${res.logs.join("\n") || res.result || "Executed cleanly"}`;
      out.style.color = "#7ee787";
    } else {
      out.textContent = `> Error: ${res.error}`;
      out.style.color = "#f85149";
    }
  });

  document.getElementById("btn-share-dev-code")?.addEventListener("click", async () => {
    const code = document.getElementById("dev-code-input").value.trim();
    if (code && currentRoomCode) {
      await sendMessage(currentRoomCode, currentUid, {
        text: `\`\`\`js\n${code}\n\`\`\``,
        mediaType: "text"
      });
      document.getElementById("modal-dev-editor")?.classList.add("hidden");
      showToast("Shared Code Snippet in chat!");
    }
  });

  document.getElementById("btn-open-design-tools")?.addEventListener("click", () => {
    const modal = document.getElementById("modal-design-canvas");
    modal?.classList.remove("hidden");
    const canvas = document.getElementById("design-whiteboard-canvas");
    if (canvas && !designCanvasControls) {
      designCanvasControls = initDesignCanvas(canvas);
    }
  });
  document.getElementById("btn-close-design-canvas")?.addEventListener("click", () => {
    document.getElementById("modal-design-canvas")?.classList.add("hidden");
  });

  document.getElementById("btn-clear-canvas")?.addEventListener("click", () => {
    if (designCanvasControls) designCanvasControls.clear();
  });

  document.getElementById("btn-share-canvas")?.addEventListener("click", async () => {
    if (designCanvasControls && currentRoomCode) {
      const dataUrl = designCanvasControls.exportPNG();
      await sendMessage(currentRoomCode, currentUid, {
        text: "🎨 Canvas Whiteboard Sketch",
        mediaType: "image",
        mediaUrl: dataUrl
      });
      document.getElementById("modal-design-canvas")?.classList.add("hidden");
      showToast("Shared Canvas Sketch in chat!");
    }
  });

  document.querySelectorAll("[data-canvas-color]").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      const color = swatch.dataset.canvasColor;
      if (designCanvasControls) designCanvasControls.setColor(color);
      showToast(`Selected canvas color: ${color}`);
    });
  });

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

  // Device QR Code Pairing Tabs
  buttons.deviceComputer?.addEventListener("click", () => {
    selectedDeviceMode = "computer";
    updateDevicePairingUI();
  });
  buttons.deviceTablet?.addEventListener("click", () => {
    selectedDeviceMode = "tablet";
    updateDevicePairingUI();
  });
  buttons.devicePhone?.addEventListener("click", () => {
    selectedDeviceMode = "phone";
    updateDevicePairingUI();
  });

  // Upward Expanding Tools Menu Toggle
  buttons.toolsMenuToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    displays.dropdownToolsMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!displays.dropdownToolsMenu.contains(e.target) && e.target !== buttons.toolsMenuToggle) {
      displays.dropdownToolsMenu.classList.add("hidden");
    }
  });

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
    document.getElementById("section-changelog")?.scrollIntoView({ behavior: "smooth" });
  });

  // Footer link handlers
  document.getElementById("link-footer-login")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("login");
  });
  document.getElementById("link-footer-signup")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (hasValidSession()) enterConnectApp();
    else openAuthModal("signup");
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
  inputs.fileUpload.addEventListener("change", (e) => {
    displays.dropdownToolsMenu.classList.add("hidden");
    handleFileUpload(e, currentRoomCode);
  });
  inputs.photoUpload.addEventListener("change", (e) => {
    displays.dropdownToolsMenu.classList.add("hidden");
    handlePhotoUpload(e, currentRoomCode);
  });

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
    
    selectedDeviceMode = "computer";
    updateDevicePairingUI();

    showView("waiting");

    if (roomUnsubscribe) roomUnsubscribe();
    roomUnsubscribe = listenToRoom(roomCode, (roomData) => {
      if (roomData && roomData.members) {
        currentRoomMembersList = roomData.members;
      }
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
    if (roomData && roomData.members) {
      currentRoomMembersList = roomData.members;
    }
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
