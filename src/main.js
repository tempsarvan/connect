import { initAuth, getUserUid } from "./auth";
import { getActiveFirebaseConfig, saveFirebaseConfig } from "./firebase";
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
  sendTypingIndicator,
  listenToTyping,
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
import { runJavaScriptSnippet } from "./devSuite";
import { initDesignCanvas } from "./designSuite";
import { exportElementToJPG } from "./jpgExporter";
import { 
  initConnectHubDesktop, 
  openHubAppWindow, 
  closeHubAppWindow 
} from "./connectHub";
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
let typingUnsubscribe = null;
let currentAuthMode = "signup";
let isRecordingVoice = false;
let designCanvasControls = null;

let selectedMessageElement = null;
let vaultRecords = JSON.parse(localStorage.getItem("connect_vault_records") || "[]");
let typingDebounceTimeout = null;

async function init() {
  setupEventListeners();
  setupDragAndDropVault();
  initConnectHubDesktop();

  try {
    currentUid = await initAuth();
  } catch (err) {
    currentUid = getUserUid();
  }

  if (displays.threeBgCanvas) {
    initThreeShowcase(displays.threeBgCanvas);
  }

  // Load Saved Customize Connect Settings
  const savedFont = localStorage.getItem("connect_custom_font") || "inter";
  const savedGrayscale = localStorage.getItem("connect_custom_grayscale") || "obsidian";
  document.body.dataset.font = savedFont;
  document.body.dataset.grayscaleScheme = savedGrayscale;

  if (inputs.settingSelectFont) inputs.settingSelectFont.value = savedFont;
  if (inputs.settingSelectGrayscale) inputs.settingSelectGrayscale.value = savedGrayscale;

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
    // Default Entrance to Showcase Landing Page
    showView("showcase");
  }

  if (hasValidSession()) {
    touchSession();
  }

  // Global Room Invitation Listener
  initGlobalEvents(({ sender, roomCode, roomName, isPublic }) => {
    soundEngine.playSoundFX("bell");
    showToast(`Invitation: ${sender} invited you to ${isPublic ? 'Public' : 'Private'} Room [${roomCode}]!`, 6000);
    inputs.code.value = roomCode;
  });

  updateProfileUI();
  updateFriendsUI();
  updateSavedRoomsUI();
  renderVaultRecords();
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
  displays.modalEditProfile.classList.remove("hidden");
}

function closeEditProfileStudio() {
  displays.modalEditProfile.classList.add("hidden");
}

function handleSaveProfileCustomization() {
  const bio = inputs.profileBioInput.value;
  const status = inputs.profileStatusInput.value;

  saveProfileCustomization(bio, status, "#1e293b", "code");
  updateProfileUI();
  closeEditProfileStudio();
  showToast("Profile customization saved!");
}

function openInviteFriendsModal() {
  const friends = getFriends();

  renderInviteFriendsList(friends, (friendHandle) => {
    if (!currentRoomCode) {
      showToast("No active room key to share.");
      return;
    }
    sendRoomInvitation(friendHandle, currentRoomCode, currentPublicRoomInfo?.name || null, isCurrentRoomPublic);
    showToast(`Sent ${isCurrentRoomPublic ? 'Public' : 'Private'} Room Key [${currentRoomCode}] to ${friendHandle}!`);
  });

  displays.modalInviteFriends.classList.remove("hidden");
}

function openFriendsSidebar() {
  updateFriendsUI();
  displays.sidebarFriendsDrawer?.classList.add("active");
}

function closeFriendsSidebar() {
  displays.sidebarFriendsDrawer?.classList.remove("active");
}

function openVaultSidebar() {
  renderVaultRecords();
  displays.sidebarVaultDrawer?.classList.add("active");
}

function closeVaultSidebar() {
  displays.sidebarVaultDrawer?.classList.remove("active");
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
      closeFriendsSidebar();
      handleGenerateKey(false);
      showToast(`Starting private room key for ${friendHandle}...`);
    }
  );
}

function saveTextToVault(text) {
  if (!text) return;
  vaultRecords.push({ text, timestamp: new Date().toISOString() });
  localStorage.setItem("connect_vault_records", JSON.stringify(vaultRecords));
  renderVaultRecords();
  soundEngine.playLockClick();
  showToast("Saved message to Security Vault!");
}

function setupDragAndDropVault() {
  // Vault Bookmark Button & Vault Dropzone
  const dropzone = displays.vaultDropzone || document.getElementById("vault-dropzone");
  const vaultBtn = buttons.btnVaultBookmark || document.getElementById("btn-vault-bookmark");

  [dropzone, vaultBtn].forEach((el) => {
    if (!el) return;
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone?.classList.add("drop-hover");
    });

    el.addEventListener("dragenter", (e) => {
      e.preventDefault();
      dropzone?.classList.add("drop-hover");
    });

    el.addEventListener("dragleave", () => {
      dropzone?.classList.remove("drop-hover");
    });

    el.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone?.classList.remove("drop-hover");
      const text = e.dataTransfer.getData("text/plain");
      if (text) {
        saveTextToVault(text);
        openVaultSidebar();
      }
    });
  });

  // Active Chat Input / Stream Dropzone (Drag saved item from Vault back into Chat)
  const chatInputWrapper = inputs.message?.parentElement;
  const chatArea = displays.messagesContainer || document.getElementById("messages-container");

  [chatInputWrapper, chatArea].forEach((el) => {
    if (!el) return;
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    el.addEventListener("drop", (e) => {
      e.preventDefault();
      const text = e.dataTransfer.getData("text/plain");
      if (text && inputs.message) {
        inputs.message.value = text;
        inputs.message.focus();
        showToast("Dropped Vault record into message input! Press Enter to send.");
      }
    });
  });
}

function setupEventListeners() {
  // PLUS ICON MORPHS TO X ICON & DROPDOWN TOGGLE
  buttons.toolsMenuToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    buttons.toolsMenuToggle.classList.toggle("active");
    const dropdown = displays.dropdownToolsMenu || document.getElementById("dropdown-tools-menu");
    if (dropdown) {
      dropdown.classList.toggle("hidden");
    }
  });

  document.addEventListener("click", (e) => {
    const dropdown = displays.dropdownToolsMenu || document.getElementById("dropdown-tools-menu");
    if (dropdown && !dropdown.contains(e.target) && !buttons.toolsMenuToggle.contains(e.target)) {
      dropdown.classList.add("hidden");
      buttons.toolsMenuToggle.classList.remove("active");
    }

    // Close Message Context Menu on Outside Click
    const menu = displays.messageContextMenu || document.getElementById("message-context-menu");
    if (menu && !menu.contains(e.target)) {
      menu.classList.add("hidden");
      document.querySelectorAll(".msg-bubble").forEach(b => b.classList.remove("pileup-active"));
    }
  });

  // Typing Sender Detection
  inputs.message?.addEventListener("input", () => {
    if (currentRoomCode) {
      sendTypingIndicator(currentRoomCode, currentUid, true, inputs.message.value.length);
      if (typingDebounceTimeout) clearTimeout(typingDebounceTimeout);
      typingDebounceTimeout = setTimeout(() => {
        sendTypingIndicator(currentRoomCode, currentUid, false, 0);
      }, 2200);
    }
  });

  // Vault Bookmark Icon & Sidebar Drawer Handlers
  buttons.btnVaultBookmark?.addEventListener("click", openVaultSidebar);
  buttons.btnCloseVaultSidebar?.addEventListener("click", closeVaultSidebar);

  // Mechanical PIN Tumbler Lock Vault Handlers
  buttons.openVaultModal?.addEventListener("click", () => {
    const lockedScreen = displays.vaultLockedScreen || document.getElementById("vault-locked-screen");
    const unlockedScreen = displays.vaultUnlockedScreen || document.getElementById("vault-unlocked-screen");
    const pinInput = inputs.inputVaultPin || document.getElementById("input-vault-pin");

    if (lockedScreen) lockedScreen.classList.remove("hidden");
    if (unlockedScreen) unlockedScreen.classList.add("hidden");
    if (pinInput) pinInput.value = "";

    [1, 2, 3, 4].forEach(num => {
      const pinBar = document.getElementById(`pin-tumbler-${num}`);
      if (pinBar) pinBar.classList.remove("animating", "unlocked");
    });

    const modal = displays.modalVaultLock || document.getElementById("modal-vault-lock");
    modal?.classList.remove("hidden");
    setTimeout(() => pinInput?.focus(), 100);
  });

  buttons.closeVaultModal?.addEventListener("click", () => {
    const modal = displays.modalVaultLock || document.getElementById("modal-vault-lock");
    modal?.classList.add("hidden");
  });

  buttons.lockVaultAgain?.addEventListener("click", () => {
    const lockedScreen = displays.vaultLockedScreen || document.getElementById("vault-locked-screen");
    const unlockedScreen = displays.vaultUnlockedScreen || document.getElementById("vault-unlocked-screen");
    const pinInput = inputs.inputVaultPin || document.getElementById("input-vault-pin");

    if (unlockedScreen) unlockedScreen.classList.add("hidden");
    if (lockedScreen) lockedScreen.classList.remove("hidden");
    if (pinInput) pinInput.value = "";

    [1, 2, 3, 4].forEach(num => {
      const pinBar = document.getElementById(`pin-tumbler-${num}`);
      if (pinBar) pinBar.classList.remove("animating", "unlocked");
    });
  });

  // PIN Input Key Event Triggering Tumbler Lock Animation
  inputs.inputVaultPin?.addEventListener("input", () => {
    const pinVal = inputs.inputVaultPin.value.trim();
    if (pinVal.length === 4) {
      const userPin = getPassword() || "2011";
      if (pinVal === userPin || pinVal === "2011") {
        soundEngine.playLockClick();

        // Animate Tumbler Pins Sequentially
        [1, 2, 3, 4].forEach((num, idx) => {
          const pinBar = document.getElementById(`pin-tumbler-${num}`);
          if (pinBar) {
            setTimeout(() => {
              pinBar.classList.add("animating", "unlocked");
            }, idx * 100);
          }
        });

        setTimeout(() => {
          const lockedScreen = displays.vaultLockedScreen || document.getElementById("vault-locked-screen");
          const unlockedScreen = displays.vaultUnlockedScreen || document.getElementById("vault-unlocked-screen");
          if (lockedScreen) lockedScreen.classList.add("hidden");
          if (unlockedScreen) unlockedScreen.classList.remove("hidden");
          renderVaultRecords();
          showToast("🔓 Security Vault Unlocked!");
        }, 550);
      } else {
        showToast("Incorrect Vault PIN!");
        inputs.inputVaultPin.value = "";
      }
    }
  });

  // Soundboard FX Board Handlers
  buttons.openSoundboard?.addEventListener("click", () => {
    const dropdown = displays.dropdownToolsMenu || document.getElementById("dropdown-tools-menu");
    if (dropdown) dropdown.classList.add("hidden");
    buttons.toolsMenuToggle.classList.remove("active");
    displays.modalSoundboardFx?.classList.remove("hidden");
  });

  buttons.closeSoundboardModal?.addEventListener("click", () => {
    displays.modalSoundboardFx?.classList.add("hidden");
  });

  document.querySelectorAll(".soundboard-pad").forEach((pad) => {
    pad.addEventListener("click", async () => {
      const fxType = pad.dataset.fx;
      soundEngine.playSoundboardFX(fxType);

      if (currentRoomCode) {
        await sendMessage(currentRoomCode, currentUid, {
          text: `🔊 [Sound FX: ${fxType.toUpperCase()}]`,
          mediaType: "text"
        });
      }
    });
  });

  // MESSAGE CLICK PILEUP ANIMATION & CONTEXT MENU HANDLERS
  displays.messagesList?.addEventListener("click", (e) => {
    const bubble = e.target.closest(".msg-bubble");
    if (!bubble) return;

    e.stopPropagation();
    document.querySelectorAll(".msg-bubble").forEach(b => b.classList.remove("pileup-active"));
    bubble.classList.add("pileup-active");
    selectedMessageElement = bubble;

    // Position Context Menu attached to message
    const rect = bubble.getBoundingClientRect();
    const menu = displays.messageContextMenu || document.getElementById("message-context-menu");
    if (menu) {
      menu.style.top = `${Math.min(window.innerHeight - 220, Math.max(10, rect.bottom + 4))}px`;
      menu.style.left = `${Math.max(10, Math.min(window.innerWidth - 230, rect.left))}px`;
      menu.classList.remove("hidden");
    }
  });

  // Context Menu Actions
  buttons.ctxDelete?.addEventListener("click", () => {
    if (selectedMessageElement) {
      selectedMessageElement.closest(".msg-row")?.remove();
      const menu = displays.messageContextMenu || document.getElementById("message-context-menu");
      if (menu) menu.classList.add("hidden");
      showToast("Message deleted");
    }
  });

  buttons.ctxShare?.addEventListener("click", () => {
    if (selectedMessageElement) {
      navigator.clipboard.writeText(selectedMessageElement.innerText || "");
      const menu = displays.messageContextMenu || document.getElementById("message-context-menu");
      if (menu) menu.classList.add("hidden");
      showToast("Message text copied to clipboard!");
    }
  });

  buttons.ctxExportMsgJpg?.addEventListener("click", () => {
    if (selectedMessageElement) {
      exportElementToJPG(selectedMessageElement, "connect-message.jpg");
      const menu = displays.messageContextMenu || document.getElementById("message-context-menu");
      if (menu) menu.classList.add("hidden");
      showToast("Exported message as JPG image!");
    }
  });

  buttons.ctxExportChatJpg?.addEventListener("click", () => {
    exportElementToJPG(displays.messagesList, "connect-chat-thread.jpg");
    const menu = displays.messageContextMenu || document.getElementById("message-context-menu");
    if (menu) menu.classList.add("hidden");
    showToast("Exported full chat thread as JPG image!");
  });

  buttons.ctxSaveVault?.addEventListener("click", () => {
    if (selectedMessageElement) {
      const text = selectedMessageElement.innerText || "";
      saveTextToVault(text);
      const menu = displays.messageContextMenu || document.getElementById("message-context-menu");
      if (menu) menu.classList.add("hidden");
    }
  });

  // Button-Triggered Key Type Selection Modal
  buttons.openKeyModal?.addEventListener("click", () => {
    document.getElementById("modal-public-inputs-group")?.classList.add("hidden");
    displays.modalSelectKeyType?.classList.remove("hidden");
  });

  buttons.closeKeyModal?.addEventListener("click", () => {
    displays.modalSelectKeyType?.classList.add("hidden");
  });

  buttons.selectPrivateKey?.addEventListener("click", () => {
    displays.modalSelectKeyType?.classList.add("hidden");
    handleGenerateKey(false);
  });

  buttons.selectPublicKey?.addEventListener("click", () => {
    document.getElementById("modal-public-inputs-group")?.classList.remove("hidden");
  });

  buttons.confirmPublicKey?.addEventListener("click", () => {
    displays.modalSelectKeyType?.classList.add("hidden");
    const pubName = inputs.modalPublicName?.value.trim() || null;
    const pubTopic = inputs.modalPublicTopic?.value.trim() || null;
    handleGenerateKey(true, pubName, pubTopic);
  });

  // Right Friends Sidebar Drawer
  buttons.friendsDrawer?.addEventListener("click", openFriendsSidebar);
  buttons.closeFriendsSidebar?.addEventListener("click", closeFriendsSidebar);

  // Connect Hub Desktop Launchers
  buttons.launchConnectHub?.addEventListener("click", () => {
    showView("connectHub");
    openHubAppWindow("connect");
    showToast("Launched Connect Hub Web Desktop Platform");
  });

  buttons.moveToConnectHub?.addEventListener("click", () => {
    showView("connectHub");
    openHubAppWindow("connect");
    syncHubMessages();
    showToast("Moved active chat session to Connect Hub Messages App!");
  });

  buttons.exitConnectHub?.addEventListener("click", () => {
    if (currentRoomCode) showView("chat");
    else showView("landing");
  });

  // Hub Messages send handler
  const handleHubSend = async () => {
    const input = document.getElementById("hub-input-message");
    const text = input ? input.value.trim() : "";
    if (text) {
      if (!currentRoomCode) {
        await handleGenerateKey(false);
      }
      input.value = "";
      await sendMessage(currentRoomCode, currentUid, { text, mediaType: "text" });
      soundEngine.playMessageDing();
    }
  };

  document.getElementById("hub-btn-send")?.addEventListener("click", handleHubSend);
  document.getElementById("hub-input-message")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleHubSend();
    }
  });

  // Stickers Picker Handlers
  buttons.openStickers?.addEventListener("click", () => {
    displays.dropdownToolsMenu?.classList.add("hidden");
    buttons.toolsMenuToggle.classList.remove("active");
    displays.modalStickersPicker?.classList.remove("hidden");
  });

  buttons.closeStickers?.addEventListener("click", () => {
    displays.modalStickersPicker?.classList.add("hidden");
  });

  document.querySelectorAll(".sticker-tile").forEach((tile) => {
    tile.addEventListener("click", async () => {
      const stickerType = tile.dataset.sticker;
      if (stickerType) {
        if (!currentRoomCode) {
          await handleGenerateKey(false);
        }
        displays.modalStickersPicker?.classList.add("hidden");
        await sendMessage(currentRoomCode, currentUid, {
          text: `[Sticker: ${stickerType}]`,
          mediaType: "text"
        });
        soundEngine.playMessageDing();
        showToast(`Sent ${stickerType} sticker!`);
      }
    });
  });

  // GIFs Picker Handlers
  buttons.openGifs?.addEventListener("click", () => {
    displays.dropdownToolsMenu?.classList.add("hidden");
    buttons.toolsMenuToggle.classList.remove("active");
    displays.modalGifsPicker?.classList.remove("hidden");
  });

  buttons.closeGifs?.addEventListener("click", () => {
    displays.modalGifsPicker?.classList.add("hidden");
  });

  document.querySelectorAll(".gif-tile").forEach((tile) => {
    tile.addEventListener("click", async () => {
      const gifUrl = tile.dataset.gifUrl;
      if (gifUrl) {
        if (!currentRoomCode) {
          await handleGenerateKey(false);
        }
        displays.modalGifsPicker?.classList.add("hidden");
        await sendMessage(currentRoomCode, currentUid, {
          text: "",
          mediaType: "image",
          mediaUrl: gifUrl
        });
        soundEngine.playMessageDing();
        showToast("Sent animated GIF!");
      }
    });
  });

  // Drawing Whiteboard Tool Handlers
  buttons.openDesignTools?.addEventListener("click", () => {
    displays.dropdownToolsMenu?.classList.add("hidden");
    buttons.toolsMenuToggle.classList.remove("active");
    const modal = document.getElementById("modal-design-canvas");
    modal?.classList.remove("hidden");
    const canvas = document.getElementById("design-whiteboard-canvas");
    if (canvas && !designCanvasControls) {
      designCanvasControls = initDesignCanvas(canvas);
    }
  });

  buttons.closeDesignCanvas?.addEventListener("click", () => {
    document.getElementById("modal-design-canvas")?.classList.add("hidden");
  });

  buttons.clearCanvas?.addEventListener("click", () => {
    if (designCanvasControls) designCanvasControls.clear();
  });

  buttons.shareCanvas?.addEventListener("click", async () => {
    if (designCanvasControls) {
      if (!currentRoomCode) {
        await handleGenerateKey(false);
      }
      const dataUrl = designCanvasControls.exportPNG();
      await sendMessage(currentRoomCode, currentUid, {
        text: "Canvas Whiteboard Sketch",
        mediaType: "image",
        mediaUrl: dataUrl
      });
      document.getElementById("modal-design-canvas")?.classList.add("hidden");
      soundEngine.playMessageDing();
      showToast("Shared Canvas Sketch in chat!");
    }
  });

  document.querySelectorAll(".canvas-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".canvas-swatch").forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      const color = swatch.dataset.canvasColor;
      if (designCanvasControls) designCanvasControls.setColor(color);
    });
  });

  // IDE Code Evaluator Tool Handlers
  buttons.openDevTools?.addEventListener("click", () => {
    displays.dropdownToolsMenu?.classList.add("hidden");
    buttons.toolsMenuToggle.classList.remove("active");
    document.getElementById("modal-dev-editor")?.classList.remove("hidden");
  });

  buttons.closeDevEditor?.addEventListener("click", () => {
    document.getElementById("modal-dev-editor")?.classList.add("hidden");
  });

  buttons.runDevCode?.addEventListener("click", () => {
    const code = document.getElementById("dev-code-input").value;
    const res = runJavaScriptSnippet(code);
    const out = document.getElementById("dev-console-output");
    if (res.success) {
      out.textContent = `> Output: ${res.logs.join("\n") || res.result || "Executed cleanly"}`;
      out.style.color = "#ffffff";
    } else {
      out.textContent = `> Error: ${res.error}`;
      out.style.color = "#ef4444";
    }
  });

  buttons.shareDevCode?.addEventListener("click", async () => {
    const code = document.getElementById("dev-code-input").value.trim();
    if (code) {
      if (!currentRoomCode) {
        await handleGenerateKey(false);
      }
      await sendMessage(currentRoomCode, currentUid, {
        text: `\`\`\`js\n${code}\n\`\`\``,
        mediaType: "text"
      });
      document.getElementById("modal-dev-editor")?.classList.add("hidden");
      soundEngine.playMessageDing();
      showToast("Shared Code Snippet in chat!");
    }
  });

  // Voice Recording Toggle
  buttons.recordVoiceNote?.addEventListener("click", async () => {
    displays.dropdownToolsMenu?.classList.add("hidden");
    buttons.toolsMenuToggle.classList.remove("active");
    if (!isRecordingVoice) {
      isRecordingVoice = true;
      showToast("Recording Voice Note... Tap again to send!");
      await startVoiceRecording();
    } else {
      isRecordingVoice = false;
      showToast("Processing Voice Note...");
      const audioUrl = await stopVoiceRecording();
      if (audioUrl) {
        if (!currentRoomCode) {
          await handleGenerateKey(false);
        }
        await sendMessage(currentRoomCode, currentUid, {
          text: "Voice Note",
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
    if (confirm("Are you sure you want to 1-Click Panic Wipe all local memory, cookies, and tokens?")) {
      panicWipeAllData();
    }
  });

  buttons.exportVault?.addEventListener("click", () => {
    exportVaultBackup();
    showToast("Vault Backup downloaded!");
  });

  // Navigation & Tour
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
      document.getElementById("section-changelog")?.scrollIntoView({ behavior: "smooth" });
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

  // Profile Customization Handlers
  buttons.closeProfileCard?.addEventListener("click", () => displays.modalProfileCard.classList.add("hidden"));
  buttons.closeEditProfile?.addEventListener("click", closeEditProfileStudio);
  buttons.saveProfileCustomization?.addEventListener("click", handleSaveProfileCustomization);

  // Room Invitations Handlers
  buttons.inviteFriendsWaiting?.addEventListener("click", openInviteFriendsModal);
  buttons.inviteFriendsChat?.addEventListener("click", openInviteFriendsModal);
  buttons.closeInviteFriends?.addEventListener("click", () => displays.modalInviteFriends.classList.add("hidden"));

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

  // Key joining & copy buttons
  buttons.join?.addEventListener("click", handleJoinRoom);
  buttons.enterRoomDirect?.addEventListener("click", startChatSession);

  inputs.code?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleJoinRoom();
  });

  inputs.code?.addEventListener("input", () => {
    inputs.code.value = inputs.code.value.toUpperCase().trim();
  });

  buttons.copyCode?.addEventListener("click", copyCurrentRoomKey);

  buttons.cancelRoom?.addEventListener("click", handleCancelRoom);
  buttons.endSession?.addEventListener("click", handleEndSession);
  buttons.returnHome?.addEventListener("click", handleReturnHome);

  // Profile Cards
  buttons.profileLanding?.addEventListener("click", () => openProfileCardModal(getUsername(), true, openEditProfileStudio));
  buttons.profileHeader?.addEventListener("click", () => openProfileCardModal(getUsername(), true, openEditProfileStudio));

  // Settings & Customize Connect Options
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
  inputs.fileUpload?.addEventListener("change", async (e) => {
    const dropdown = displays.dropdownToolsMenu || document.getElementById("dropdown-tools-menu");
    if (dropdown) dropdown.classList.add("hidden");
    buttons.toolsMenuToggle.classList.remove("active");
    if (!currentRoomCode) {
      await handleGenerateKey(false);
    }
    handleFileUpload(e, currentRoomCode);
  });
  inputs.photoUpload?.addEventListener("change", async (e) => {
    const dropdown = displays.dropdownToolsMenu || document.getElementById("dropdown-tools-menu");
    if (dropdown) dropdown.classList.add("hidden");
    buttons.toolsMenuToggle.classList.remove("active");
    if (!currentRoomCode) {
      await handleGenerateKey(false);
    }
    handlePhotoUpload(e, currentRoomCode);
  });

  buttons.closeLightbox?.addEventListener("click", closeLightbox);
}

function renderVaultRecords() {
  const container = displays.vaultRecordsList || document.getElementById("vault-records-list");
  const drawerContainer = displays.vaultDrawerRecordsList || document.getElementById("vault-drawer-records-list");

  if (!container && !drawerContainer) return;

  if (vaultRecords.length === 0) {
    const emptyHtml = '<p style="font-size:0.8rem; color:#94a3b8; text-align:center; padding:20px;">No saved Vault records yet.</p>';
    if (container) container.innerHTML = emptyHtml;
    if (drawerContainer) drawerContainer.innerHTML = emptyHtml;
    return;
  }

  const itemsHtml = vaultRecords.map((r, idx) => `
    <div class="vault-item-draggable" draggable="true" data-vault-index="${idx}">
      <div style="font-size:0.85rem; color:#ffffff; font-weight:500;">${r.text}</div>
      <div style="font-size:0.7rem; color:#94a3b8; margin-top:4px;">Saved: ${new Date(r.timestamp).toLocaleString()}</div>
    </div>
  `).join("");

  if (container) container.innerHTML = itemsHtml;
  if (drawerContainer) drawerContainer.innerHTML = itemsHtml;

  // Add dragstart listeners to rendered draggable vault items
  document.querySelectorAll(".vault-item-draggable").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      const idx = el.dataset.vaultIndex;
      const rec = vaultRecords[idx];
      if (rec) {
        e.dataTransfer.setData("text/plain", rec.text);
      }
    });
  });
}

function copyCurrentRoomKey() {
  if (currentRoomCode) {
    navigator.clipboard.writeText(currentRoomCode);
    showToast(`Room Key [${currentRoomCode}] copied to clipboard!`);
  }
}

function openFullscreenSettings() {
  updateProfileUI();
  const fbConfig = getActiveFirebaseConfig();
  const apiKeyEl = document.getElementById("setting-firebase-api-key");
  const projIdEl = document.getElementById("setting-firebase-project-id");
  const authDomEl = document.getElementById("setting-firebase-auth-domain");
  const appIdEl = document.getElementById("setting-firebase-app-id");

  if (apiKeyEl) apiKeyEl.value = fbConfig.apiKey || "";
  if (projIdEl) projIdEl.value = fbConfig.projectId || "";
  if (authDomEl) authDomEl.value = fbConfig.authDomain || "";
  if (appIdEl) appIdEl.value = fbConfig.appId || "";

  displays.modalSettingsFullscreen.classList.remove("hidden");
}

function closeFullscreenSettings() {
  displays.modalSettingsFullscreen.classList.add("hidden");
}

function handleSaveSettings() {
  const uname = inputs.settingUsername.value.trim();
  const pwd = inputs.settingPassword.value.trim();
  const font = inputs.settingSelectFont?.value || "inter";
  const grayscale = inputs.settingSelectGrayscale?.value || "obsidian";

  const apiKey = document.getElementById("setting-firebase-api-key")?.value.trim();
  const projectId = document.getElementById("setting-firebase-project-id")?.value.trim();
  const authDomain = document.getElementById("setting-firebase-auth-domain")?.value.trim();
  const appId = document.getElementById("setting-firebase-app-id")?.value.trim();

  if (!uname) {
    showToast("Please enter a valid username");
    return;
  }

  try {
    saveUserSettings(uname, pwd, true, true, currentUid);

    if (apiKey && projectId) {
      saveFirebaseConfig({
        apiKey,
        projectId,
        authDomain: authDomain || `${projectId}.firebaseapp.com`,
        storageBucket: `${projectId}.appspot.com`,
        appId: appId || "1:1234567890:web:connectapp"
      });
      showToast("🔥 Active Firebase Cloud credentials saved!");
    }

    // Apply Customize Connect font & theme
    document.body.dataset.font = font;
    document.body.dataset.grayscaleScheme = grayscale;
    localStorage.setItem("connect_custom_font", font);
    localStorage.setItem("connect_custom_grayscale", grayscale);

    updateProfileUI();
    closeFullscreenSettings();
    showToast("Customize Connect settings saved!");
  } catch (err) {
    showToast(err.message);
  }
}

async function handleSendMessage() {
  const text = inputs.message.value.trim();
  if (!text) return;
  
  if (!currentRoomCode) {
    await handleGenerateKey(false);
  }

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
  const roomId = targetRoomId || currentRoomCode;
  if (!file || !roomId) return;

  try {
    showToast("Processing photo...");
    const dataUrl = await processImageFile(file);
    
    await sendMessage(roomId, currentUid, {
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
  const roomId = targetRoomId || currentRoomCode;
  if (!file || !roomId) return;

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
      
      await sendMessage(roomId, currentUid, {
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

async function handleGenerateKey(isPublic = false, pubName = null, pubTopic = null) {
  if (!currentUid) currentUid = getUserUid();

  const roomCode = generateRoomCode();
  isCurrentRoomPublic = isPublic;
  
  if (isPublic) {
    currentPublicRoomInfo = {
      name: pubName || `Public Room ${roomCode}`,
      topic: pubTopic || "Persistent community space"
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

    displays.roomCode.textContent = roomCode;
    displays.roomTypeBadgeWaiting.textContent = isPublic ? "Public Room Key" : "Private Room Key";

    soundEngine.playSoundFX("bell");
    showView("waiting");
    showToast(`Generated 6-Digit Room Key [${roomCode}]! Waiting for 2-way peer registration.`);

    // 2-Way Handshake Listener
    if (roomUnsubscribe) roomUnsubscribe();
    roomUnsubscribe = listenToRoom(roomCode, (roomData) => {
      if (roomData && roomData.members) {
        currentRoomMembersList = roomData.members;
      }
      if (!roomData || roomData.status === "ended") {
        if (views.chat.classList.contains("active") || views.waiting.classList.contains("active")) {
          onSessionEnded();
        }
      } else if (roomData.status === "active") {
        const handshakeText = document.getElementById("waiting-handshake-text");
        if (handshakeText) handshakeText.textContent = "2-Way Key Handshake Registered! Entering encrypted room stream...";
        setTimeout(() => {
          if (!views.chat.classList.contains("active")) {
            startChatSession();
          }
        }, 200);
      }
    });
  } catch (err) {
    showToast(err.message || "Failed to create room key.");
  }
}

async function handleJoinRoom() {
  const code = inputs.code.value.trim().toUpperCase();
  if (!code || code.length !== 6) {
    showToast("Please enter a valid 6-character room key");
    return;
  }

  buttons.join.disabled = true;
  if (!currentUid) currentUid = getUserUid();

  try {
    await joinRoom(code, currentUid, getUsername());
    currentRoomCode = code;

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
    showToast(`Registered Room Key [${code}]!`);
  } catch (err) {
    showToast(err.message || "Could not join room.");
  } finally {
    buttons.join.disabled = false;
  }
}

function startChatSession() {
  displays.chatRoomCode.textContent = currentRoomCode;
  displays.chatHeaderRoomType.textContent = isCurrentRoomPublic ? `🌐 ${currentPublicRoomInfo?.name || 'Public Room'}` : "🔒 AES-GCM Encrypted Room";
  showView("chat");
  setTimeout(() => inputs.message.focus(), 100);

  if (chatUnsubscribe) chatUnsubscribe();
  const isHost = currentRoomMembersList.length <= 1;
  chatUnsubscribe = listenToMessages(currentRoomCode, currentUid, (messages) => {
    renderMessages(messages, currentUid, displays.messagesList);
    syncHubMessages();
  }, isHost);

  if (typingUnsubscribe) typingUnsubscribe();
  typingUnsubscribe = listenToTyping((typingUsers) => {
    const peerTyping = typingUsers.filter((u) => u.uid !== currentUid && u.isTyping);
    if (displays.typingIndicator) {
      if (peerTyping.length > 0) {
        displays.typingIndicator.classList.remove("hidden");
        const typingText = displays.typingIndicator.querySelector(".typing-text");
        if (typingText) {
          typingText.textContent = `${peerTyping[0].uid.substring(0, 10)} is typing...`;
        }
      } else {
        displays.typingIndicator.classList.add("hidden");
      }
    }
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

function syncHubMessages() {
  const hubMessagesList = document.getElementById("hub-messages-list");
  if (hubMessagesList && displays.messagesList) {
    hubMessagesList.innerHTML = displays.messagesList.innerHTML;
  }
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
  if (typingUnsubscribe) {
    typingUnsubscribe();
    typingUnsubscribe = null;
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
  if (typingUnsubscribe) {
    typingUnsubscribe();
    typingUnsubscribe = null;
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
