// Connect for Designers (Design Suite)

export function generateColorPalette() {
  const hexChars = "0123456789ABCDEF";
  const palette = [];
  for (let i = 0; i < 5; i++) {
    let color = "#";
    for (let j = 0; j < 6; j++) {
      color += hexChars[Math.floor(Math.random() * 16)];
    }
    palette.push(color);
  }
  return palette;
}

export function initDesignCanvas(canvasEl, color = "#3b82f6", lineWidth = 4) {
  if (!canvasEl) return null;
  const ctx = canvasEl.getContext("2d");
  let isDrawing = false;

  canvasEl.width = canvasEl.clientWidth || 320;
  canvasEl.height = canvasEl.clientHeight || 240;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  function startDraw(e) {
    isDrawing = true;
    ctx.beginPath();
    const rect = canvasEl.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e) {
    if (!isDrawing) return;
    const rect = canvasEl.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function stopDraw() {
    isDrawing = false;
  }

  canvasEl.addEventListener("mousedown", startDraw);
  canvasEl.addEventListener("mousemove", draw);
  canvasEl.addEventListener("mouseup", stopDraw);
  canvasEl.addEventListener("mouseleave", stopDraw);

  return {
    setColor: (c) => { ctx.strokeStyle = c; },
    setLineWidth: (w) => { ctx.lineWidth = w; },
    clear: () => { ctx.clearRect(0, 0, canvasEl.width, canvasEl.height); },
    exportPNG: () => canvasEl.toDataURL("image/png")
  };
}
