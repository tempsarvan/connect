// Directional Variant Transition Animations for Connect
// Features: Matrix Rapid Code Waterfall Wipe (Coders) & Vibrant Gradient Mesh Wipe (Designers)

const editionOrder = {
  standard: 0,
  dev: 1,
  design: 2
};

const matrixCodeLines = [
  "const room = new EphemeralStream({ zeroTrace: true });",
  "$ connect init --variant=coders --speed=fast",
  "0101101010010101011010010101011010101",
  "function decipher(payload) { return AES_GCM.decrypt(payload); }",
  "0x9F4A7B2C8D1E3F • 0 Compilation Errors",
  "import { MatrixCipher } from '@connect/core';",
  "await room.handshake({ cache: 'yes', poll: 1 });",
  "01100110011001100110011001100110",
  "git commit -m 'Deploying zero-trace channel'",
  "process.env.ZERO_LOGS = 'true';"
];

export function triggerVariantTransition(fromEdition, toEdition, callback) {
  const overlay = document.getElementById("variant-transition-overlay");
  if (!overlay) {
    if (callback) callback();
    return;
  }

  const fromIdx = editionOrder[fromEdition] !== undefined ? editionOrder[fromEdition] : 0;
  const toIdx = editionOrder[toEdition] !== undefined ? editionOrder[toEdition] : 0;
  const direction = toIdx >= fromIdx ? "l2r" : "r2l";

  let overlayHTML = "";

  if (toEdition === "dev") {
    // Matrix Code Waterfall Wipe
    let columns = "";
    for (let i = 0; i < 12; i++) {
      const line1 = matrixCodeLines[Math.floor(Math.random() * matrixCodeLines.length)];
      const line2 = matrixCodeLines[Math.floor(Math.random() * matrixCodeLines.length)];
      const line3 = matrixCodeLines[Math.floor(Math.random() * matrixCodeLines.length)];
      const delay = (i * 40) + "ms";
      columns += `
        <div class="matrix-code-column" style="animation-delay: ${delay};">
          <span class="matrix-line">${line1}</span>
          <span class="matrix-line">${line2}</span>
          <span class="matrix-line">${line3}</span>
        </div>
      `;
    }

    overlayHTML = `
      <div class="transition-curtain dev-matrix-wipe ${direction}">
        <div class="matrix-rain-container">
          ${columns}
        </div>
      </div>
    `;
  } else if (toEdition === "design") {
    // Vibrant Mesh Gradient Wipe
    overlayHTML = `
      <div class="transition-curtain design-gradient-wipe ${direction}">
        <div class="gradient-wipe-reflection"></div>
        <div class="gradient-wipe-content">
          <span class="gradient-wipe-badge">🎨 CONNECT FOR DESIGNERS</span>
          <span class="gradient-wipe-title">DISPLAY P3 • HUMAN DESIGN SUITE</span>
        </div>
      </div>
    `;
  } else {
    // Just Connect Standard Sweep
    overlayHTML = `
      <div class="transition-curtain standard-curtain ${direction}">
        <div class="standard-wave-wrapper">
          <span class="standard-label">⚡ JUST CONNECT STANDARD</span>
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
