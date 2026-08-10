// Connect Hub Web Desktop OS Platform Manager
// Native, zero-block interactive client app windows for Connect Messages, Instagram, Discord, YouTube, X, GitHub, Spotify, Whiteboard & IDE Console

let activeZIndex = 100;

export function initConnectHubDesktop() {
  const desktop = document.getElementById("connect-hub-desktop");
  if (!desktop) return;

  setupWindowDragging();
  setupDockAppTriggers();
  setupClockUpdater();
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

      // Keep inside desktop bounds
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
