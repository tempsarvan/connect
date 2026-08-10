// High-Definition HTML5 Canvas JPG Exporter for Messages & Full Chat Threads

export function exportElementToJPG(element, fileName = "connect-export.jpg") {
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scale = window.devicePixelRatio || 2;
  const width = Math.max(320, Math.ceil(rect.width));
  const height = Math.max(100, Math.ceil(rect.height));

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Dark Cold Obsidian Background
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, width, height);

  // Subtle Border Frame
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Watermark Header
  ctx.font = "600 12px Inter, sans-serif";
  ctx.fillStyle = "#60a5fa";
  ctx.fillText("CONNECT MESSENGER • SECURE EXPORT", 24, 30);

  // Extract Text Content
  const textContent = element.innerText || element.textContent || "Message Content";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillStyle = "#ffffff";

  // Wrap text cleanly
  const words = textContent.split(" ");
  let line = "";
  let y = 60;
  const maxWidth = width - 48;
  const lineHeight = 20;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, 24, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 24, y);

  // Timestamp footer
  ctx.font = "10px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(new Date().toLocaleString(), 24, height - 24);

  // Convert to JPG blob & download
  const imageURI = canvas.toDataURL("image/jpeg", 0.92);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = imageURI;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
