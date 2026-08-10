// Connect Hub Web Desktop OS Platform Manager
// Native, zero-block interactive client app windows & official portals for Connect Messages, Instagram, Discord, YouTube, X, GitHub, Spotify

let activeZIndex = 100;

export const HUB_APPS_CONFIG = {
  connect: {
    id: "connect",
    name: "Connect Messages",
    mode: "embed",
    url: "#",
    description: "Official Connect zero-trace AES-GCM messenger.",
    icon: `<img src="/logo.svg" width="24" height="24" alt="Connect">`
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    mode: "launch",
    url: "https://www.instagram.com/",
    description: "Share photos, reels, and direct messages on your official Instagram account.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e1306c" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`
  },
  discord: {
    id: "discord",
    name: "Discord",
    mode: "launch",
    url: "https://discord.com/app",
    description: "Voice, video, and text chat communities.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5865f2" stroke-width="2"><path d="M18 6h0a14.5 14.5 0 0 0-4-1.25M6 6h0A14.5 14.5 0 0 0 2 4.75M18 18h0a14.5 14.5 0 0 0 4 1.25M6 18h0A14.5 14.5 0 0 0 2 19.25M8.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>`
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    mode: "embed",
    url: "https://www.youtube.com/",
    embedUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
    description: "Watch music, tutorials, and live video streams.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    mode: "launch",
    url: "https://x.com/",
    description: "Real-time trends, news, and community posts.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>`
  },
  github: {
    id: "github",
    name: "GitHub",
    mode: "oauth",
    url: "https://github.com/",
    description: "Inspect repositories, pull requests, and dev workflows.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`
  },
  spotify: {
    id: "spotify",
    name: "Spotify",
    mode: "embed",
    url: "https://open.spotify.com/",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M",
    description: "Stream music playlists, tracks, and audio.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1db954" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 11.5c4-1 8 0 10 1.5"/><path d="M7.5 14.5c4.5-1 9 0 10.5 1.5"/><path d="M9 8.5c4-1 7.5 0 9 1"/></svg>`
  }
};

export function initConnectHubDesktop() {
  const desktop = document.getElementById("connect-hub-desktop");
  if (!desktop) return;

  renderHubAppPortalCards();
  setupWindowDragging();
  setupDockAppTriggers();
  setupClockUpdater();
}

export function launchAppPortal(appId) {
  const app = HUB_APPS_CONFIG[appId];
  if (app && app.url && app.url !== "#") {
    window.open(app.url, "_blank", "noopener,noreferrer");
    setAppConnectionStatus(appId, true);
  }
}

export function openHubAppWindow(appId) {
  const windowEl = document.getElementById(`hub-win-${appId}`);
  if (!windowEl) return;

  activeZIndex++;
  windowEl.style.zIndex = activeZIndex;
  windowEl.classList.remove("hidden");
  windowEl.classList.remove("minimized");
  windowEl.classList.add("focused");

  // Highlight dock icon
  const dockIcon = document.querySelector(`.dock-item[data-app="${appId}"]`);
  if (dockIcon) {
    dockIcon.classList.add("active");
  }
}

export function closeHubAppWindow(appId) {
  const windowEl = document.getElementById(`hub-win-${appId}`);
  if (!windowEl) return;

  windowEl.classList.add("hidden");

  const dockIcon = document.querySelector(`.dock-item[data-app="${appId}"]`);
  if (dockIcon) {
    dockIcon.classList.remove("active");
  }
}

export function focusHubAppWindow(windowEl) {
  if (!windowEl) return;
  activeZIndex++;
  windowEl.style.zIndex = activeZIndex;

  document.querySelectorAll(".hub-app-window").forEach((w) => w.classList.remove("focused"));
  windowEl.classList.add("focused");
}

function setAppConnectionStatus(appId, isConnected) {
  const key = `connect_hub_status_${appId}`;
  localStorage.setItem(key, isConnected ? "connected" : "disconnected");

  const badge = document.querySelector(`#hub-win-${appId} .hub-status-badge`);
  if (badge) {
    if (isConnected) {
      badge.className = "hub-status-badge status-connected";
      badge.textContent = "🟢 Active Session / Connected";
    }
  }
}

function renderHubAppPortalCards() {
  Object.values(HUB_APPS_CONFIG).forEach((app) => {
    if (app.id === "connect") return; // Connect Messages handled by custom DOM

    const windowEl = document.getElementById(`hub-win-${app.id}`);
    if (!windowEl) return;

    const bodyEl = windowEl.querySelector(".hub-window-body");
    if (!bodyEl) return;

    const isConnected = localStorage.getItem(`connect_hub_status_${app.id}`) === "connected";

    if (app.mode === "launch") {
      // mode: 'launch' — Clean Portal Card UI (No broken X-Frame-Options iframe)
      bodyEl.innerHTML = `
        <div class="hub-app-portal-card">
          <div>
            <div class="hub-portal-header">
              <div class="hub-portal-icon">${app.icon}</div>
              <div class="hub-portal-title-group">
                <h3>${app.name} Portal</h3>
                <span class="hub-status-badge ${isConnected ? 'status-connected' : 'status-launch'}">
                  ${isConnected ? '🟢 Active Session / Connected' : '🌐 External Web App Portal'}
                </span>
              </div>
            </div>
            <p class="hub-portal-desc">${app.description}</p>
            <div class="hub-portal-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Opens in a new tab using your active ${app.name} browser session. Protected against X-Frame-Options framing blocks.</span>
            </div>
          </div>
          <button class="btn btn-primary btn-launch-portal" data-app-url="${app.url}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>Launch Official ${app.name} Portal ↗</span>
          </button>
        </div>
      `;
    } else if (app.mode === "embed") {
      // mode: 'embed' — Official Embed iframe with header action
      bodyEl.innerHTML = `
        <div style="height:100%; display:flex; flex-direction:column;">
          <div style="padding:6px 12px; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-space-between; border-bottom:1px solid rgba(255,255,255,0.1);">
            <span class="hub-status-badge status-embed" style="font-size:0.7rem;">⚡ Official Interactive Embed</span>
            <button class="btn btn-ghost btn-launch-portal" data-app-url="${app.url}" style="height:26px; font-size:0.72rem; padding:0 8px;">Full Site ↗</button>
          </div>
          <iframe src="${app.embedUrl}" class="hub-app-iframe" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="${app.name}"></iframe>
        </div>
      `;
    } else if (app.mode === "oauth") {
      // mode: 'oauth' — OAuth 2.0 PKCE / Personal Access Token integration
      const storedToken = localStorage.getItem(`connect_hub_token_${app.id}`) || "";
      const clientEnvVar = import.meta.env.VITE_GITHUB_CLIENT_ID || "";

      bodyEl.innerHTML = `
        <div class="hub-app-portal-card">
          <div>
            <div class="hub-portal-header">
              <div class="hub-portal-icon">${app.icon}</div>
              <div class="hub-portal-title-group">
                <h3>${app.name} Integration</h3>
                <span class="hub-status-badge ${storedToken ? 'status-connected' : 'status-launch'}">
                  ${storedToken ? '🟢 Account Connected (OAuth / PAT)' : '⚪ Not Connected'}
                </span>
              </div>
            </div>
            <p class="hub-portal-desc">${app.description}</p>

            <div class="hub-oauth-card">
              <div class="hub-oauth-title">Connect ${app.name} Account (OAuth 2.0 / Token)</div>
              <p class="hub-oauth-desc">Connect your account via OAuth 2.0 PKCE flow or enter your Personal Access Token.</p>
              
              <div style="display:flex; gap:6px; margin-bottom:8px;">
                <input type="password" id="input-oauth-token-${app.id}" class="input-field" placeholder="Enter Access Token..." value="${storedToken}" style="height:36px; font-size:0.8rem;">
                <button id="btn-save-oauth-${app.id}" class="btn btn-secondary" style="height:36px; font-size:0.75rem; padding:0 12px;">Save</button>
              </div>
              ${clientEnvVar ? `<button id="btn-oauth-pkce-${app.id}" class="btn btn-primary" style="width:100%; height:34px; font-size:0.75rem; margin-top:4px;">Authorize via OAuth 2.0 (PKCE) 🔐</button>` : ''}
            </div>

            <div id="hub-oauth-data-${app.id}" class="hub-oauth-data-preview" style="font-size:0.78rem; color:#cbd5e1; max-height:140px; overflow-y:auto;">
              ${storedToken ? 'Fetching connected account repositories & data...' : 'Connect your token above to fetch live account data.'}
            </div>
          </div>

          <button class="btn btn-primary btn-launch-portal" data-app-url="${app.url}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>Launch Official ${app.name} ↗</span>
          </button>
        </div>
      `;

      // Bind Token Save Handler
      setTimeout(() => {
        const saveBtn = document.getElementById(`btn-save-oauth-${app.id}`);
        const tokenInput = document.getElementById(`input-oauth-token-${app.id}`);
        saveBtn?.addEventListener("click", () => {
          const tok = tokenInput.value.trim();
          if (tok) {
            localStorage.setItem(`connect_hub_token_${app.id}`, tok);
            setAppConnectionStatus(app.id, true);
            fetchOAuthData(app.id, tok);
          } else {
            localStorage.removeItem(`connect_hub_token_${app.id}`);
            setAppConnectionStatus(app.id, false);
          }
        });

        if (storedToken) {
          fetchOAuthData(app.id, storedToken);
        }
      }, 50);
    }

    // Bind Launch Buttons
    bodyEl.querySelectorAll(".btn-launch-portal").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const url = btn.dataset.appUrl || app.url;
        if (url && url !== "#") {
          window.open(url, "_blank", "noopener,noreferrer");
          setAppConnectionStatus(app.id, true);
        }
      });
    });
  });
}

async function fetchOAuthData(appId, token) {
  const container = document.getElementById(`hub-oauth-data-${appId}`);
  if (!container) return;

  if (appId === "github") {
    try {
      const res = await fetch("https://api.github.com/user/repos?per_page=5&sort=updated", {
        headers: { Authorization: `token ${token}` }
      });
      if (!res.ok) throw new Error("Invalid token or API rate limit.");
      const repos = await res.json();
      container.innerHTML = `
        <div style="font-weight:700; color:#38bdf8; margin-bottom:6px;">Your GitHub Repositories (${repos.length}):</div>
        ${repos.map(r => `<div style="padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.08);">📦 <strong style="color:#ffffff;">${r.name}</strong> — ${r.stargazers_count} ★</div>`).join("")}
      `;
    } catch (err) {
      container.innerHTML = `<span style="color:#ef4444;">Error fetching API data: ${err.message}</span>`;
    }
  }
}

function setupWindowDragging() {
  document.querySelectorAll(".hub-window-titlebar").forEach((titlebar) => {
    const windowEl = titlebar.closest(".hub-app-window");
    if (!windowEl) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    titlebar.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("win-btn")) return;
      isDragging = true;
      focusHubAppWindow(windowEl);

      const rect = windowEl.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      windowEl.style.transition = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      let left = e.clientX - offsetX;
      let top = e.clientY - offsetY;

      left = Math.max(10, Math.min(window.innerWidth - 100, left));
      top = Math.max(36, Math.min(window.innerHeight - 100, top));

      windowEl.style.left = `${left}px`;
      windowEl.style.top = `${top}px`;
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        windowEl.style.transition = "";
      }
    });

    // Window controls
    const closeBtn = windowEl.querySelector(".win-btn-close");
    const minBtn = windowEl.querySelector(".win-btn-min");
    const maxBtn = windowEl.querySelector(".win-btn-max");

    closeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const appId = windowEl.dataset.appId;
      closeHubAppWindow(appId);
    });

    minBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      windowEl.classList.add("minimized");
    });

    maxBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      windowEl.classList.toggle("maximized");
    });

    windowEl.addEventListener("mousedown", () => focusHubAppWindow(windowEl));
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
