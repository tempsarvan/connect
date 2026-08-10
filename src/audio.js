// Audio & Voice Note Recording Studio for Connect

let mediaRecorder = null;
let audioChunks = [];
let audioContext = null;
let analyser = null;
let animFrameId = null;

export async function startVoiceRecording(onWaveformFrame) {
  audioChunks = [];
  
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 64;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function renderFrame() {
    analyser.getByteFrequencyData(dataArray);
    if (onWaveformFrame) onWaveformFrame(Array.from(dataArray));
    animFrameId = requestAnimationFrame(renderFrame);
  }

  renderFrame();

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start();
}

export function stopVoiceRecording() {
  return new Promise((resolve) => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (audioContext) audioContext.close();

    if (!mediaRecorder) {
      resolve(null);
      return;
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.stop();
  });
}
