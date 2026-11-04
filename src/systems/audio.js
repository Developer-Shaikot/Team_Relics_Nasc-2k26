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
    this.unlockInstalled = false;
    this.gestureResumePending = false;
    this.gestureResumeTimer = null;
    this.unlockedByGestureAt = 0;
    this.installUnlockListeners();
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
      // Safety limiter: overlapping sounds can never sum past full scale and crackle/clip
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-10, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(6, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.15, this.ctx.currentTime);
      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.ctx.destination);

      // Wind Noise Generator (Brownian / Lowpass filtered pink noise)
      this.setupWindSystem();

      // Ambient Sci-Fi Space Drone
      this.setupAmbientDrone();

      this.initialized = true;

      // Let the UI know when the browser blocks / unblocks / suspends audio
      this.ctx.addEventListener?.("statechange", () => this.emitState());
      this.emitState();
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  // Lazily create the context and request a resume. Safe to call from anywhere;
  // browsers only honour resume() during a real user gesture (click/key/touch),
  // which the persistent unlock listeners below guarantee.
  ensureActive() {
    if (!this.initialized) {
      this.init();
    }
    if (!this.ctx) return false;
    // Safari can report "interrupted" (e.g. after a call / tab switch), not just "suspended".
    if (this.ctx.state !== "running" && this.ctx.state !== "closed") {
      try {
        const p = this.ctx.resume();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch (e) {}
    }
    if (!this.isMuted && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.6, this.ctx.currentTime, 0.1);
    }
    return this.ctx.state === "running";
  }

  // True when a sound may be scheduled right now. While the context is blocked
  // (no gesture yet), sounds are dropped instead of queuing up on a frozen clock
  // and then all firing at once when audio unlocks.
  canPlay() {
    if (this.isMuted) return false;
    this.ensureActive();
    if (!this.ctx || !this.masterGain) return false;
    return this.ctx.state === "running" || this.gestureResumePending;
  }

  // Persistent unlock: real activation events only (mouse movement / hover is NOT a
  // user gesture and cannot start audio). Listeners stay installed for the whole
  // session so audio recovers after the browser suspends it (tab switch, sleep,
  // Bluetooth device change, iOS interruption).
  installUnlockListeners() {
    if (this.unlockInstalled || typeof window === "undefined") return;
    this.unlockInstalled = true;

    const onGesture = () => {
      if (this.isMuted) return;
      if (!this.initialized) this.init();
      if (!this.ctx || this.ctx.state === "running" || this.ctx.state === "closed") return;
      this.unlockedByGestureAt = performance.now();
      this.resumeFromGesture();
    };

    ["pointerdown", "pointerup", "mousedown", "touchstart", "touchend", "click", "keydown"].forEach(evt => {
      window.addEventListener(evt, onGesture, { capture: true, passive: true });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !this.isMuted && this.ctx && this.ctx.state !== "running") {
        this.ensureActive();
      }
    });
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

  // Call only inside a real user gesture: resumes the context and lets sounds
  // triggered by this same gesture be scheduled while resume() is in flight.
  resumeFromGesture() {
    this.gestureResumePending = true;
    clearTimeout(this.gestureResumeTimer);
    this.gestureResumeTimer = setTimeout(() => { this.gestureResumePending = false; }, 600);
    this.ensureActive();
  }

  // Audio is switched ON but the browser hasn't let it start yet (needs a click/tap/key)
  isBlocked() {
    return !this.isMuted && (!this.ctx || this.ctx.state !== "running");
  }

  emitState() {
    try {
      window.dispatchEvent(new CustomEvent("martianaudio:state", {
        detail: { muted: this.isMuted, blocked: this.isBlocked() }
      }));
    } catch (e) {}
  }

  toggleMute() {
    if (!this.initialized) {
      this.init();
    }
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.resumeFromGesture(); // toggle is always a click/tap
    }
    if (this.isMuted) {
      this.stopFlute();
    }
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : 0.6;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
    }
    this.emitState();
    return !this.isMuted;
  }

  // Audio-button handler: if audio is ON but the browser is still blocking it,
  // the player's click means "give me sound" (unlock), never "turn it off".
  unlockOrToggle() {
    // pointerdown may already have unlocked audio before this click handler runs,
    // so a click that is part of the unlocking gesture also counts as "unlock".
    const unlockedJustNow = performance.now() - (this.unlockedByGestureAt || -1e9) < 1500;
    if (this.isBlocked() || unlockedJustNow) {
      this.unlockedByGestureAt = 0;
      this.resumeFromGesture();
      this.playUiConfirm();
      this.emitState();
      return true;
    }
    return this.toggleMute();
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

  // Short enveloped tone helper used by the UI cues below
  playTone(freq, endFreq, duration, volume, type = "sine", delay = 0) {
    if (!this.canPlay()) return;
    try {
      const start = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (endFreq && endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration * 0.8);
      }
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch (e) {}
  }

  playUiClick() {
    this.playTone(980, 720, 0.06, 0.12, "triangle");
  }

  playUiConfirm() {
    this.playTone(660, 660, 0.09, 0.12, "sine");
    this.playTone(990, 990, 0.14, 0.12, "sine", 0.08);
  }

  playUiAlert() {
    this.playTone(880, 880, 0.12, 0.14, "square");
    this.playTone(660, 660, 0.16, 0.14, "square", 0.14);
  }

  playThrusterPuff() {
    if (!this.canPlay()) return;
    try {
      const now = this.ctx.currentTime;
      const len = Math.floor(this.ctx.sampleRate * 0.18);
      const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.16);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      src.start(now);
      src.stop(now + 0.18);
    } catch (e) {}
  }

  // Returns false if `key` fired less than `ms` ago (stops sounds stacking on fast mouse moves)
  rateLimit(key, ms) {
    const t = performance.now();
    this.lastPlayed = this.lastPlayed || {};
    if (t - (this.lastPlayed[key] || 0) < ms) return false;
    this.lastPlayed[key] = t;
    return true;
  }

  playUiHover() {
    if (!this.canPlay() || !this.rateLimit("hover", 90)) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.035);
      // Short attack ramp instead of jumping straight to full volume (that jump is an audible click)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // One soft signature chime when hovering a destination (Moon / Mars / Deep Space) card or planet.
  // Replaces the harsh 5-burst square-wave telemetry that used to stack on every hover.
  playPortalHover(dest = "mars") {
    if (!this.rateLimit("portal-" + dest, 450) || !this.rateLimit("portal-any", 120)) return;
    const notes = {
      moon: [880, 1174.66],
      mars: [659.25, 987.77],
      deepspace: [523.25, 783.99, 1046.5],
    }[dest] || [659.25, 987.77];
    notes.forEach((f, i) => this.playTone(f, f, 0.22, 0.05, "sine", i * 0.07));
  }

  playUiSwitch() {
    if (!this.canPlay()) return;
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
      osc.start(now);
      osc.stop(now + 0.085);
    } catch (e) {}
  }

  playScannerBeep(highPitch = false) {
    if (!this.canPlay()) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const freq = highPitch ? 1480 : 880;
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  playServoMotor() {
    if (!this.canPlay()) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(190, now + 0.25);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playTelemetryTransmission() {
    if (!this.canPlay()) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [1200, 1500, 1800, 1350, 2100];

      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(f, now + i * 0.08);

        gain.gain.setValueAtTime(0.07, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.06);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.07);
      });
    } catch (e) {}
  }

  // Mission 1: Apollo 11 Ascent Stage Thruster & Pyrotechnic Staging Ignition
  playRocketIgnition(duration = 3.2) {
    if (!this.canPlay()) return;
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
    if (!this.canPlay()) return;
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
    if (!this.canPlay()) return;
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
    if (!this.canPlay()) return;

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
        vibrato.connect(vibGain);
        vibGain.connect(osc1.frequency);

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
    if (!this.canPlay()) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = actor === 'asha' ? 540 : 420;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq + (i % 2 === 0 ? 65 : -30), now + i * 0.065);
        gain.gain.setValueAtTime(0.07, now + i * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.065);
        osc.stop(now + i * 0.065 + 0.055);
      }
    } catch (e) {}
  }
}

export const martianAudio = new MartianAudioSystem();
