// Helper utilities for photos, GIFs, stickers, and voice audio recording

// 1. Photo Compression & Base64 Converter
export function processImageFile(file, maxDimension = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Selected file is not an image."));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

// 2. Curated Stickers Data
export const STICKERS = [
  { id: "s1", label: "Cat Vibe", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZkZnVnd3FubTF4M3U2aXQ4cmk5dGpxZzQ1cnk5NmdyejR6NWQyeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/CjmvTCZf2U3p09Cn0h/giphy.gif" },
  { id: "s2", label: "Fire", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnFlMnZma3U0cnlsNmRxYndwMnY5OXF5NDdsMjdydGFwZzR0b3QzZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/26tP3M3i03hoIyl6o/giphy.gif" },
  { id: "s3", label: "Heart", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHU1cnZpaXk1bnZwbG82dnF1Nndsd2UyaXVqNXFicnhyNXBhNHpqeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l0HlC9lP7r09Yn4aA/giphy.gif" },
  { id: "s4", label: "Mind Blown", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndhNWtydmF1MnJqd3R0dmFrcm8wNHM3ZGNvNzNtdnBrZnF5NDlsdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/xT0xeJpnrWC4XWblEk/giphy.gif" },
  { id: "s5", label: "Party", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGI3aWl1dHdzZHNmaG96enQ3czE2Mm5jYzFucnRwZTZ0dmdvdnFlMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKSjRrfIPjeiVyM/giphy.gif" },
  { id: "s6", label: "Salute", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZndjNndyeWVxbThtc2F3NTVpYW1vNmtybW5pdzN6NDNxeGtxanplZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l3q2K5jinAlChoCLS/giphy.gif" },
  { id: "s7", label: "Cool", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTRxdmdwczE2ZzRkbmxyd3pmN2FtdjExdmpydmRsMGg2aGNsYmt6OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/d31w24psGYeekCxy/giphy.gif" },
  { id: "s8", label: "100", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTBpdnlnZmk1eTN6MHl5MnE1dnVvdHRzMWl3eGN4aXNmaWJkMTBhOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7abKhOpu0NwenH3O/giphy.gif" }
];

// 3. Curated Trending GIFs (Giphy Direct CDN links)
export const TRENDING_GIFS = [
  { id: "g1", title: "Wave", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZkZnVnd3FubTF4M3U2aXQ4cmk5dGpxZzQ1cnk5NmdyejR6NWQyeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dzaUX7CAG0Ihi/giphy.gif" },
  { id: "g2", title: "Popcorn", url: "https://media.giphy.com/media/gl0mkIZOW6Nwc/giphy.gif" },
  { id: "g3", title: "Nod", url: "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif" },
  { id: "g4", title: "Confused", url: "https://media.giphy.com/media/hEc4k5Sy814Oc/giphy.gif" },
  { id: "g5", title: "Applause", url: "https://media.giphy.com/media/Swx36yLmSU43oSm69h/giphy.gif" },
  { id: "g6", title: "Dance", url: "https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif" },
  { id: "g7", title: "Shocked", url: "https://media.giphy.com/media/LpLd2NGvpaD4IXV9KY/giphy.gif" },
  { id: "g8", title: "Laughing", url: "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif" }
];

// 4. Voice Recorder Module using MediaRecorder API
export class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Voice recording is not supported in this browser.");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error("Recorder not initialized"));
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          this.cleanup();
          resolve(reader.result); // Base64 DataURL
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
