// High-Fidelity Accurate Sound Effects Engine

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playMessageDing() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // A6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn("Audio ding play error:", e);
    }
  }

  playRingtone() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const startTime = now + i * 0.4;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, startTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, startTime + 0.15); // E5

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      }
    } catch (e) {
      console.warn("Audio ringtone play error:", e);
    }
  }

  playSoundFX(type) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === "airhorn") {
        // Accurate Stadium Airhorn: Harmonic Bb Chord (Bb3, D4, F4, Bb4) with distortion
        const freqs = [233.08, 293.66, 349.23, 466.16];
        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0.35, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        // Distorter for brassy airhorn growl
        const distortion = this.ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          const x = (i * 2) / 256 - 1;
          curve[i] = ((3 + 20) * x * 20 * (Math.PI / 180)) / (Math.PI + 20 * Math.abs(x));
        }
        distortion.curve = curve;

        freqs.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.setValueAtTime(freq * 1.02, now + 0.05); // slight pitch modulation
          osc.connect(distortion);
        });

        distortion.connect(masterGain);
        masterGain.connect(this.ctx.destination);
      } else if (type === "applause") {
        // Accurate Multi-Person Clapping Simulation
        for (let i = 0; i < 35; i++) {
          const clapTime = now + Math.random() * 0.7;
          const bufferSize = this.ctx.sampleRate * 0.04;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let j = 0; j < bufferSize; j++) {
            data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.2));
          }
          const src = this.ctx.createBufferSource();
          src.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 1200 + Math.random() * 1200;
          filter.Q.value = 3;
          const gain = this.ctx.createGain();
          gain.gain.value = 0.15 + Math.random() * 0.15;
          src.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(clapTime);
        }
      } else if (type === "badumtss") {
        // Accurate 3-Part Rimshot: Ba (0ms) -> Dum (180ms) -> Tss Cymbal Crash (360ms)
        
        // 1. "Ba" Drum
        const baOsc = this.ctx.createOscillator();
        const baGain = this.ctx.createGain();
        baOsc.frequency.setValueAtTime(160, now);
        baOsc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
        baGain.gain.setValueAtTime(0.4, now);
        baGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        baOsc.connect(baGain);
        baGain.connect(this.ctx.destination);
        baOsc.start(now);
        baOsc.stop(now + 0.1);

        // 2. "Dum" Drum (180ms)
        const dumTime = now + 0.18;
        const dumOsc = this.ctx.createOscillator();
        const dumGain = this.ctx.createGain();
        dumOsc.frequency.setValueAtTime(140, dumTime);
        dumOsc.frequency.exponentialRampToValueAtTime(45, dumTime + 0.08);
        dumGain.gain.setValueAtTime(0.4, dumTime);
        dumGain.gain.exponentialRampToValueAtTime(0.01, dumTime + 0.1);
        dumOsc.connect(dumGain);
        dumGain.connect(this.ctx.destination);
        dumOsc.start(dumTime);
        dumOsc.stop(dumTime + 0.1);

        // 3. "Tss" Cymbal Crash (360ms)
        const tssTime = now + 0.36;
        const bufLen = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.3));
        }
        const cymbal = this.ctx.createBufferSource();
        cymbal.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 6500;
        const cymbalGain = this.ctx.createGain();
        cymbalGain.gain.setValueAtTime(0.3, tssTime);
        cymbalGain.gain.exponentialRampToValueAtTime(0.001, tssTime + 0.4);
        cymbal.connect(filter);
        filter.connect(cymbalGain);
        cymbalGain.connect(this.ctx.destination);
        cymbal.start(tssTime);

      } else if (type === "cheer") {
        // Accurate Crowd Cheering with whistle overtones
        const bufLen = this.ctx.sampleRate * 1.2;
        const buffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const crowd = this.ctx.createBufferSource();
        crowd.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(2200, now + 0.4);
        filter.frequency.linearRampToValueAtTime(1000, now + 1.2);
        filter.Q.value = 1.5;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        crowd.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        crowd.start(now);

      } else if (type === "bell") {
        // Accurate Brass Bell Chime (C6 1046.5Hz + Harmonics)
        const bellFreqs = [1046.5, 2093.0, 3139.5, 4186.0];
        const bellGains = [0.4, 0.25, 0.15, 0.08];

        bellFreqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(bellGains[idx], now);
          gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.8);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 1.8);
        });

      } else if (type === "laser" || type === "matrix") {
        // High-Tech Cyber Matrix Synth Chirp
        const now = this.ctx.currentTime;
        const freqs = [1200, 1600, 2200, 2800];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(0.08, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.08);
        });

      } else if (type === "chime" || type === "designer") {
        // Clean Human Designer Pentatonic Chime (Eb5, G5, Bb5, Eb6)
        const now = this.ctx.currentTime;
        const freqs = [622.25, 783.99, 932.33, 1244.50];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.12, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.05 + 0.6);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.6);
        });
      }
    } catch (e) {
      console.warn("Sound FX error:", e);
    }
  }
}

export const soundEngine = new SoundEngine();
