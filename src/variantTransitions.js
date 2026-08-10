// Directional Variant Transition Animations for Connect

const editionOrder = {
  standard: 0,
  dev: 1,
  design: 2
};

export function triggerVariantTransition(fromEdition, toEdition, callback) {
  const overlay = document.getElementById("variant-transition-overlay");
  if (!overlay) {
    if (callback) callback();
    return;
  }

  const fromIdx = editionOrder[fromEdition] !== undefined ? editionOrder[fromEdition] : 0;
  const toIdx = editionOrder[toEdition] !== undefined ? editionOrder[toEdition] : 0;
  const direction = toIdx >= fromIdx ? "l2r" : "r2l";

  // Build custom overlay content based on target variant
  let overlayHTML = "";
  if (toEdition === "dev") {
    overlayHTML = `
      <div class="transition-curtain dev-curtain ${direction}">
        <div class="code-stream-wrapper">
          <pre class="code-stream-text"><code>$ connect init --variant=coders --zero-trace
[100%] Initializing Monokai IDE Environment...
const channel = new ConnectStream({ cipher: "AES-GCM", cache: true });
await channel.connect(); // 0 Compilation Errors</code></pre>
        </div>
      </div>
    `;
  } else if (toEdition === "design") {
    overlayHTML = `
      <div class="transition-curtain design-curtain ${direction}">
        <div class="design-wave-wrapper">
          <div class="wave-bar bar-pink"></div>
          <div class="wave-bar bar-purple"></div>
          <div class="wave-bar bar-cyan"></div>
          <span class="design-label">CALIBRATING DISPLAY P3 CANVAS • 60 FPS</span>
        </div>
      </div>
    `;
  } else {
    overlayHTML = `
      <div class="transition-curtain standard-curtain ${direction}">
        <div class="standard-wave-wrapper">
          <span class="standard-label">INITIALIZING JUST CONNECT STANDARD SUITE</span>
        </div>
      </div>
    `;
  }

  overlay.innerHTML = overlayHTML;
  overlay.classList.remove("hidden");

  setTimeout(() => {
    if (callback) callback();
  }, 350);

  setTimeout(() => {
    overlay.classList.add("hidden");
    overlay.innerHTML = "";
  }, 750);
}
