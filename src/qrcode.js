// Real QR Code generation using qrserver.com public API

export function generateQRCodeSVG(text, size = 200) {
  const encoded = encodeURIComponent(text);
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=09090b&color=ffffff&margin=12&format=svg`;

  return `<img
    src="${apiUrl}"
    alt="QR Code — scan to join room"
    width="${size}"
    height="${size}"
    style="border-radius:16px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 8px 24px rgba(0,0,0,0.6); background:#09090b;"
  >`;
}
