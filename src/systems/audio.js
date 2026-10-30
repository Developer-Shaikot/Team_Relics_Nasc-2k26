// Procedural Web Audio Synthesizer for Moon, Mars & Deep Space Telemetry Soundscape
// Includes JPL-authentic Marsquake P/S Wave Acoustics, APXS X-Ray Pulses, Rocket Staging, and Golden Record Bamboo Flute

class MartianAudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false; // Audio ON by default on load
    this.initialized = false;
    this.masterGain = null;
    this.windGain = null;
    this.windFilter = null;
    this.ambientGain = null;
    this.noiseNode = null;
    this.droneOscillators = [];
    this.fluteTimers = [];
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      const initialGain = this.isMuted ? 0.0 : 0.6;
      this.masterGain.gain.setValueAtTime(initialGain, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Wind Noise Generator (Brownian / Lowpass filtered pink noise)
      this.setupWindSystem();

      // Ambient Sci-Fi Space Drone
      this.setupAmbientDrone();

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  ensureActive() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (!this.isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0.6, this.ctx.currentTime, 0.1);
    }
  }

  setupWindSystem() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = "lowpass";
    this.windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

    this.noiseNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    this.noiseNode.start(0);
  }

  setupAmbientDrone() {
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    const freqs = [73.42, 110.0, 146.83, 220.0];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.18 / (idx + 1), this.ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.ambientGain);
      osc.start(0);
      this.droneOscillators.push({ osc, gain: oscGain });
    });
  }

  toggleMute() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopFlute();
    }
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : 0.6;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
    }
    return !this.isMuted;
  }

  updateAtmosphereWind(tau) {
    if (!this.windFilter || !this.windGain || !this.ctx) return;
    const clampedTau = Math.max(0.1, Math.min(tau, 11.0));
    if (tau <= 0.05) {
      // Vacuum (Moon / Deep Space)
      this.windGain.gain.setTargetAtTime(0.02, this.ctx.currentTime, 0.3);
      return;
    }
    const targetFreq = 180 + clampedTau * 85 + (Math.sin(Date.now() * 0.001) * 30);
    const targetGain = 0.15 + (clampedTau / 10.8) * 0.45;

    this.windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.3);
    this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
  }

  playClick() {
    this.playScannerBeep(false);
  }

  playUiHover() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.035);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(now + 0.045);
    } catch (e) {}
  }

  playUiSwitch() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.07);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(now + 0.085);
    } catch (e) {}
  }

  playScannerBeep(highPitch = false) {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const freq = highPitch ? 1480 : 880;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playServoMotor() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(190, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playTelemetryTransmission() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [1200, 1500, 1800, 1350, 2100];

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(f, now + i * 0.08);

      gain.gain.setValueAtTime(0.06, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.07);
    });
  }

  // Mission 1: Apollo 11 Ascent Stage Thruster & Pyrotechnic Staging Ignition
  playRocketIgnition(duration = 3.2) {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // 1. Pyrotechnic staging bolt snap
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(920, now);
    snapOsc.frequency.exponentialRampToValueAtTime(90, now + 0.14);
    snapGain.gain.setValueAtTime(0.45, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.16);

    // 2. APS Rocket Engine Roar (Filtered Noise + Sub-bass harmonic)
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.06 * w) / 1.06;
      data[i] = last * 2.8;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(160, now + 0.1);
    filter.frequency.exponentialRampToValueAtTime(620, now + duration);
    filter.Q.setValueAtTime(1.2, now);

    const roarGain = this.ctx.createGain();
    roarGain.gain.setValueAtTime(0.01, now);
    roarGain.gain.linearRampToValueAtTime(0.42, now + 0.25);
    roarGain.gain.exponentialRampToValueAtTime(0.005, now + duration);

    noise.connect(filter);
    filter.connect(roarGain);
    roarGain.connect(this.masterGain);
    noise.start(now + 0.08);
    noise.stop(now + duration);
  }

  // Mission 2: Opportunity APXS Alpha Particle X-Ray Fluorescence Pulse
  playAPXSSpectrometerBeam() {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const harmonicFreqs = [640, 706, 960, 1280, 1412, 1920];
    harmonicFreqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + idx * 0.07);
      osc.frequency.exponentialRampToValueAtTime(f * 1.12, now + idx * 0.07 + 0.18);

      gain.gain.setValueAtTime(0.14, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.24);
    });
  }

  // Mission 3: NASA InSight Marsquake Acoustic Synthesizer (P-Wave + S-Wave Arrival)
  playMarsquakeWave() {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // 1. Distant Meteoroid Impact Flash Thump (t = 0.0s)
    const impactOsc = this.ctx.createOscillator();
    const impactGain = this.ctx.createGain();
    impactOsc.type = "sine";
    impactOsc.frequency.setValueAtTime(150, now);
    impactOsc.frequency.exponentialRampToValueAtTime(36, now + 0.35);
    impactGain.gain.setValueAtTime(0.35, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    impactOsc.connect(impactGain);
    impactGain.connect(this.masterGain);
    impactOsc.start(now);
    impactOsc.stop(now + 0.42);

    // 2. P-Wave (Primary Compressional Wave) Arrival at t = 1.0s
    const pOsc = this.ctx.createOscillator();
    const pGain = this.ctx.createGain();
    pOsc.type = "triangle";
    pOsc.frequency.setValueAtTime(98, now + 1.0);
    pOsc.frequency.exponentialRampToValueAtTime(48, now + 1.9);
    pGain.gain.setValueAtTime(0.001, now + 0.98);
    pGain.gain.linearRampToValueAtTime(0.38, now + 1.08);
    pGain.gain.exponentialRampToValueAtTime(0.04, now + 2.0);
    pOsc.connect(pGain);
    pGain.connect(this.masterGain);
    pOsc.start(now + 0.98);
    pOsc.stop(now + 2.05);

    // 3. S-Wave (Secondary Shear Wave) Stronger Rolling Tremor at t = 2.3s
    const sDuration = 2.4;
    const bufLen = Math.floor(this.ctx.sampleRate * sDuration);
    const sBuf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const sData = sBuf.getChannelData(0);
    let prev = 0;
    for (let i = 0; i < bufLen; i++) {
      const tSec = i / this.ctx.sampleRate;
      const white = Math.random() * 2 - 1;
      prev = (prev + 0.03 * white) / 1.03;
      const shearMod = Math.sin(tSec * Math.PI * 2 * 11) * 0.5 + 0.5;
      const subWave = Math.sin(tSec * Math.PI * 2 * 58) * 0.45;
      sData[i] = (prev * 3.2 * shearMod) + subWave;
    }

    const sSource = this.ctx.createBufferSource();
    sSource.buffer = sBuf;

    const sFilter = this.ctx.createBiquadFilter();
    sFilter.type = "lowpass";
    sFilter.frequency.setValueAtTime(175, now + 2.3);

    const sGain = this.ctx.createGain();
    sGain.gain.setValueAtTime(0.001, now + 2.25);
    sGain.gain.linearRampToValueAtTime(0.55, now + 2.45);
    sGain.gain.exponentialRampToValueAtTime(0.005, now + 2.3 + sDuration);

    sSource.connect(sFilter);
    sFilter.connect(sGain);
    sGain.connect(this.masterGain);
    sSource.start(now + 2.25);
    sSource.stop(now + 2.35 + sDuration);
  }

  stopFlute() {
    this.fluteTimers.forEach(t => clearTimeout(t));
    this.fluteTimers = [];
  }

  // Mission 4: Voyager 1 Golden Record South Asian / Chakma Bamboo Flute Melody
  playGoldenRecordFlute() {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.ctx || this.isMuted) return;

    // Clear any running flute notes
    this.stopFlute();

    // Soulful pentatonic bamboo flute phrase (D4, F4, G4, A4, C5, D5, C5, A4, G4, F4, D4)
    const notes = [
      { freq: 587.33, dur: 0.65, delay: 0.0 },   // D5
      { freq: 659.25, dur: 0.45, delay: 0.7 },   // E5
      { freq: 783.99, dur: 0.85, delay: 1.2 },   // G5
      { freq: 880.00, dur: 0.95, delay: 2.1 },   // A5
      { freq: 783.99, dur: 0.55, delay: 3.1 },   // G5
      { freq: 659.25, dur: 0.75, delay: 3.7 },   // E5
      { freq: 587.33, dur: 1.25, delay: 4.5 }    // D5
    ];

    notes.forEach(n => {
      const timer = setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Fundamental flute sine + soft 2nd harmonic + gentle vibrato
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const vibrato = this.ctx.createOscillator();
        const vibGain = this.ctx.createGain();
        const noteGain = this.ctx.createGain();

        osc1.type = "sine";
        osc2.type = "triangle";
        osc1.frequency.setValueAtTime(n.freq, now);
        osc2.frequency.setValueAtTime(n.freq * 2, now);

        vibrato.frequency.setValueAtTime(5.2, now);
        vibGain.gain.setValueAtTime(4.5, now);
        vibrato.connect(osc1.frequency);

        const harmGain = this.ctx.createGain();
        harmGain.gain.setValueAtTime(0.12, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.24, now + 0.12);
        noteGain.gain.setValueAtTime(0.22, now + n.dur - 0.18);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + n.dur);

        osc1.connect(noteGain);
        osc2.connect(harmGain);
        harmGain.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        vibrato.start(now);

        osc1.stop(now + n.dur + 0.05);
        osc2.stop(now + n.dur + 0.05);
        vibrato.stop(now + n.dur + 0.05);
      }, n.delay * 1000);
      this.fluteTimers.push(timer);
    });
  }

  // Expressive Spoken Voice Synthesis with Web Speech API
  speakDialogue(text, speaker = 'kitty') {
    this.playVoiceCadence(speaker === 'leo' ? 'leo' : 'asha');
    if (this.isMuted || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (speaker === 'kitty') {
        utterance.pitch = 1.3;
        utterance.rate = 1.05;
      } else if (speaker === 'asha') {
        utterance.pitch = 1.15;
        utterance.rate = 1.0;
      } else if (speaker === 'leo') {
        utterance.pitch = 0.95;
        utterance.rate = 1.0;
      }
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  }

  // Expressive Character Voice Cadence Pip (Asha & Leo Comms)
  playVoiceCadence(actor = 'asha') {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = actor === 'asha' ? 540 : 420;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq + (i % 2 === 0 ? 65 : -30), now + i * 0.065);
      gain.gain.setValueAtTime(0.05, now + i * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.065);
      osc.stop(now + i * 0.065 + 0.055);
    }
  }
}

export const martianAudio = new MartianAudioSystem();
