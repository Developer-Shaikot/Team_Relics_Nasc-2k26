// Procedural Web Audio Synthesizer for Mars Atmosphere and Telemetry Soundscape

class MartianAudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.initialized = false;
    this.masterGain = null;
    this.windGain = null;
    this.windFilter = null;
    this.ambientGain = null;
    this.noiseNode = null;
    this.droneOscillators = [];
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
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

  setupWindSystem() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // boost brown noise
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = "lowpass";
    this.windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    this.noiseNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    this.noiseNode.start(0);
  }

  setupAmbientDrone() {
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    // Minor ninth / atmospheric frequencies (D minor / Mars space chords: 73.4Hz, 110Hz, 146.8Hz, 220Hz)
    const freqs = [73.42, 110.0, 146.83, 220.0];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      
      // subtle detuning for celestial warmth
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
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : 0.6;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
    }
    return !this.isMuted;
  }

  updateAtmosphereWind(tau) {
    if (!this.windFilter || !this.windGain || !this.ctx) return;
    // As Tau rises from 0.5 to 10.8, wind becomes deeper and more violent
    const clampedTau = Math.max(0.5, Math.min(tau, 11.0));
    const targetFreq = 180 + clampedTau * 85 + (Math.sin(Date.now() * 0.001) * 30);
    const targetGain = 0.15 + (clampedTau / 10.8) * 0.45;
    
    this.windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.3);
    this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
  }

  playScannerBeep(highPitch = false) {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    const freq = highPitch ? 1480 : 880;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
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
}

export const martianAudio = new MartianAudioSystem();
