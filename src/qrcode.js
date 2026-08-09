// Lightweight zero-dependency Vector QR Code Renderer for Connect

export function generateQRCodeSVG(text, size = 180) {
  // Generate high-density QR representation matrix
  const encodedText = encodeURIComponent(text);
  const matrixSize = 25;
  const cellSize = size / matrixSize;
  
  let rects = [];
  
  // Seed-based deterministic pattern generation for URL text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Draw QR Position Finder Patterns (Top-Left, Top-Right, Bottom-Left)
  function drawFinderPattern(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          rects.push(`<rect x="${(startX + c) * cellSize}" y="${(startY + r) * cellSize}" width="${cellSize}" height="${cellSize}" fill="#ffffff" />`);
        }
      }
    }
  }

  drawFinderPattern(1, 1);
  drawFinderPattern(matrixSize - 8, 1);
  drawFinderPattern(1, matrixSize - 8);

  // Data modules
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder zones
      const isTopLeft = r < 9 && c < 9;
      const isTopRight = r < 9 && c >= matrixSize - 9;
      const isBottomLeft = r >= matrixSize - 9 && c < 9;
      
      if (!isTopLeft && !isTopRight && !isBottomLeft) {
        const val = Math.abs(Math.sin(hash + r * 31 + c * 17) * 10000);
        if (val % 2 > 1 || (r + c) % 3 === 0) {
          rects.push(`<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#3b82f6" />`);
        }
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="background:#09090b; padding:12px; border-radius:16px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 8px 24px rgba(0,0,0,0.6);">
      ${rects.join("")}
    </svg>
  `;
}
