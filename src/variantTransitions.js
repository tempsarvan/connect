// High-Fidelity Directional & Dropdown Variant Transitions Engine for Connect
// Coder Transition: Matrix Digital Rain Canvas Dropdown Curtain
// Designer Transition: Clean Silk Glassmorphic Spring Dropdown
import { soundEngine } from "./sound";

let activeMatrixCanvasAnimId = null;

export function triggerVariantTransition(fromEdition, toEdition, callback) {
  const overlay = document.getElementById("variant-transition-overlay");
  if (!overlay) {
    if (callback) callback();
    return;
  }

  // Cancel any ongoing Matrix Canvas loop
  if (activeMatrixCanvasAnimId) {
    cancelAnimationFrame(activeMatrixCanvasAnimId);
    activeMatrixCanvasAnimId = null;
  }

  overlay.className = "variant-transition-overlay";
  let overlayHTML = "";

  if (toEdition === "dev") {
    // Play Cyber Matrix Synth Sound
    soundEngine.playSoundFX("matrix");

    // Coders Matrix Dropdown Animation Curtain
    overlayHTML = `
      <div class="transition-curtain dev-matrix-dropdown-curtain curtain-dropdown-anim">
        <canvas id="matrix-dropdown-canvas" class="matrix-dropdown-canvas"></canvas>
        <div class="matrix-scanline-laser"></div>
        <div class="matrix-dropdown-content">
          <div class="matrix-badge-pill">
            <span class="matrix-badge-glow-dot"></span>
            <span>💻 CONNECT FOR CODERS</span>
          </div>
          <h2 class="matrix-dropdown-title">MONOKAI IDE SUITE</h2>
          <div class="matrix-terminal-prompt">
            <span class="matrix-prompt-symbol">&gt;</span> switch_edition --variant=coders --matrix-drop=true
          </div>
        </div>
      </div>
    `;
  } else if (toEdition === "design") {
    // Play Clean Designer Pentatonic Chime
    soundEngine.playSoundFX("designer");

    // Clean Designer Transition Curtain
    overlayHTML = `
      <div class="transition-curtain design-clean-curtain curtain-dropdown-anim">
        <div class="design-ambient-mesh"></div>
        <div class="design-clean-glass-card">
          <div class="design-badge-pill">
            <span class="design-badge-sparkle">✨</span>
            <span>CONNECT FOR DESIGNERS</span>
          </div>
          <h2 class="design-clean-title">DISPLAY P3 • HUMAN DESIGN SUITE</h2>
          <div class="design-swatches-cascade">
            <div class="swatch-chip s-rose" style="--delay:0ms;"><span class="swatch-dot"></span>#f43f5e</div>
            <div class="swatch-chip s-violet" style="--delay:50ms;"><span class="swatch-dot"></span>#8b5cf6</div>
            <div class="swatch-chip s-cyan" style="--delay:100ms;"><span class="swatch-dot"></span>#06b6d4</div>
            <div class="swatch-chip s-emerald" style="--delay:150ms;"><span class="swatch-dot"></span>#10b981</div>
            <div class="swatch-chip s-amber" style="--delay:200ms;"><span class="swatch-dot"></span>#f59e0b</div>
          </div>
        </div>
        <div class="design-glass-sheen"></div>
      </div>
    `;
  } else {
    // Just Connect Standard Sleek Sweep
    soundEngine.playSoundFX("bell");

    overlayHTML = `
      <div class="transition-curtain standard-clean-curtain curtain-dropdown-anim">
        <div class="standard-ambient-mesh"></div>
        <div class="standard-glass-card">
          <div class="standard-badge-pill">
            <span>⚡ JUST CONNECT STANDARD</span>
          </div>
          <h2 class="standard-clean-title">ZERO-TRACE COMMUNICATIONS</h2>
        </div>
      </div>
    `;
  }

  overlay.innerHTML = overlayHTML;
  overlay.classList.remove("hidden");

  // If Coder edition, start HTML5 Canvas Matrix Digital Rain Dropdown Engine
  if (toEdition === "dev") {
    requestAnimationFrame(() => {
      const canvas = document.getElementById("matrix-dropdown-canvas");
      if (canvas) {
        startMatrixRainEngine(canvas);
      }
    });
  }

  // Trigger state change callback halfway through dropdown animation (~400ms)
  setTimeout(() => {
    if (callback) callback();
  }, 400);

  // Complete animation & cleanup overlay at ~850ms
  setTimeout(() => {
    if (activeMatrixCanvasAnimId) {
      cancelAnimationFrame(activeMatrixCanvasAnimId);
      activeMatrixCanvasAnimId = null;
    }
    overlay.classList.add("hidden");
    overlay.innerHTML = "";
  }, 850);
}

function startMatrixRainEngine(canvas) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;

  const characters = "0123456789ABCDEF!@#$%^&*()_+-=[]{}|;:,.<>?/~$ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜconstfunctionreturnasyncawaitdecrypt";
  const fontSize = 15;
  const columns = Math.floor(width / fontSize);

  // Track Y position of drops
  const drops = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.floor(Math.random() * -40); // Start staggered above canvas
  }

  function draw() {
    // Translucent black fade to create trails
    ctx.fillStyle = "rgba(6, 9, 14, 0.18)";
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = characters[Math.floor(Math.random() * characters.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Glow effect for leading green head character
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#00FF66";
      ctx.shadowBlur = 12;
      ctx.fillText(text, x, y);

      // Subsequent matrix trail green character
      ctx.fillStyle = "#00FF66";
      ctx.shadowBlur = 0;
      ctx.fillText(text, x, y - fontSize);

      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    activeMatrixCanvasAnimId = requestAnimationFrame(draw);
  }

  draw();
}
