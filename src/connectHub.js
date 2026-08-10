// Connect Hub Web Desktop OS Platform Manager
// Full-Screen In-App Web Viewports for Connect Messages, Instagram, Discord, YouTube, X, GitHub, Spotify

let activeZIndex = 100;

export const HUB_APPS_CONFIG = {
  connect: {
    id: "connect",
    name: "Connect Messages",
    url: "#",
    description: "Official Connect zero-trace AES-GCM messenger.",
    icon: `<img src="/logo.svg" width="24" height="24" alt="Connect">`
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com/",
    description: "Official Instagram Web Application.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e1306c" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`
  },
  discord: {
    id: "discord",
    name: "Discord",
    url: "https://discord.com/app",
    description: "Official Discord Web Application.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5865f2" stroke-width="2"><path d="M18 6h0a14.5 14.5 0 0 0-4-1.25M6 6h0A14.5 14.5 0 0 0 2 4.75M18 18h0a14.5 14.5 0 0 0 4 1.25M6 18h0A14.5 14.5 0 0 0 2 19.25M8.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>`
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com/",
    embedUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
    description: "Official YouTube Video & Music Player.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    url: "https://x.com/",
    description: "Official X (Twitter) Web Application.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>`
  },
  github: {
    id: "github",
    name: "GitHub",
    url: "https://github.com/",
    description: "Official GitHub Code Repository Manager.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`
  },
  spotify: {
    id: "spotify",
    name: "Spotify",
    url: "https://open.spotify.com/",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M",
    description: "Official Spotify Music Player.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1db954" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 11.5c4-1 8 0 10 1.5"/><path d="M7.5 14.5c4.5-1 9 0 10.5 1.5"/><path d="M9 8.5c4-1 7.5 0 9 1"/></svg>`
  }
};

export function initConnectHubDesktop() {
  const desktop = document.getElementById("connect-hub-desktop");
  if (!desktop) return;

  renderFullscreenAppViewports();
  setupDockAppTriggers();
  setupClockUpdater();

  // Expand Connect Messages by default
  openHubAppWindow("connect");
}

export function openHubAppWindow(appId) {
  const windowEl = document.getElementById(`hub-win-${appId}`);
  if (!windowEl) return;

  // Hide all other full-screen app viewports
  document.querySelectorAll(".hub-app-window").forEach((w) => {
    w.classList.add("hidden");
    w.classList.remove("focused");
  });

  activeZIndex++;
  windowEl.style.zIndex = activeZIndex;
  windowEl.classList.remove("hidden");
  windowEl.classList.remove("minimized");
  windowEl.classList.add("focused");

  // Update Dock Icon Active States
  document.querySelectorAll(".dock-item").forEach((item) => item.classList.remove("active"));
  const dockIcon = document.querySelector(`.dock-item[data-app="${appId}"]`);
  if (dockIcon) dockIcon.classList.add("active");

  // Update Top Bar App Title
  const appConfig = HUB_APPS_CONFIG[appId];
  const brandTitle = document.querySelector(".hub-brand-name");
  if (brandTitle && appConfig) {
    brandTitle.textContent = `Connect Hub OS — ${appConfig.name}`;
  }
}

export function closeHubAppWindow(appId) {
  const windowEl = document.getElementById(`hub-win-${appId}`);
  if (!windowEl) return;

  windowEl.classList.add("hidden");

  // Default to Connect Messages
  if (appId !== "connect") {
    openHubAppWindow("connect");
  }
}

export function focusHubAppWindow(windowEl) {
  if (!windowEl) return;
  activeZIndex++;
  windowEl.style.zIndex = activeZIndex;

  document.querySelectorAll(".hub-app-window").forEach((w) => w.classList.remove("focused"));
  windowEl.classList.add("focused");
}

function renderFullscreenAppViewports() {
  Object.values(HUB_APPS_CONFIG).forEach((app) => {
    if (app.id === "connect") return; // Connect Messages uses custom chat stream DOM

    const windowEl = document.getElementById(`hub-win-${app.id}`);
    if (!windowEl) return;

    const bodyEl = windowEl.querySelector(".hub-window-body");
    if (!bodyEl) return;

    const targetUrl = app.embedUrl || app.url;

    // Full-Screen In-App Interactive Web Viewport
    bodyEl.innerHTML = `
      <div style="width:100%; height:100%; position:relative; background:#000000;">
        <iframe 
          src="${targetUrl}" 
          class="hub-fullscreen-iframe" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone; display-capture; storage-access" 
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-storage-access-by-user-activation allow-downloads"
          title="${app.name}"
        ></iframe>
      </div>
    `;

    // Titlebar Close Button Listener
    const closeBtn = windowEl.querySelector(".win-btn-close");
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeHubAppWindow(app.id);
      };
    }
  });
}

function setupDockAppTriggers() {
  document.querySelectorAll("[data-app]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const appId = btn.dataset.app;
      openHubAppWindow(appId);
    });
  });
}

function setupClockUpdater() {
  const clockEl = document.getElementById("hub-clock-display");
  if (!clockEl) return;

  function update() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  update();
  setInterval(update, 1000);
}
