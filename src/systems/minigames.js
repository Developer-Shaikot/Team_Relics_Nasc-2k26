// JPL-Authentic Scientific Mini-Game Workbench Engine
// Implements the 4 Flagship Missions of "Relics of the Cosmic Dust: The Last Handshake":
// 1. Moon (Apollo 11): "The Staging Sacrifice" — Tsiolkovsky Rocket Equation & Delta-V Puzzle
// 2. Mars (Opportunity MER-B): "The Blueberries of Life" — APXS Alpha Particle X-Ray Spectroscopy Matcher
// 3. Mars (InSight Lander): "Listening to the Heart of Mars" — Planetary Seismology P-Wave & S-Wave Analyzer
// 4. Deep Space (Voyager 1): "The Dying Candle & The Golden Record" — RTG Power Budgeting, 22h Light-Delay & Golden Record Player

import { martianAudio } from './audio.js';

export const GOLDEN_RECORD_GREETINGS = [
  {
    lang: "Bengali (South Asia)",
    flag: "🇧🇩",
    nativePhonetic: "Namaskar! Vishwe shanti hok.",
    englishTranslation: "Hello! Let there be peace everywhere.",
    speakerNote: "Recorded by Subrata Mukherjee for NASA's 1977 Golden Record committee chaired by Carl Sagan."
  },
  {
    lang: "English (USA / Global)",
    flag: "🇺🇸",
    nativePhonetic: "Hello from the children of planet Earth.",
    englishTranslation: "Hello from the children of planet Earth.",
    speakerNote: "Spoken by 5-year-old Nick Sagan, son of astronomer Carl Sagan."
  },
  {
    lang: "Spanish",
    flag: "🇪🇸",
    nativePhonetic: "Hola y saludos a todos.",
    englishTranslation: "Hello and greetings to everyone.",
    speakerNote: "One of the 55 human greetings etched into the gold-plated copper disc."
  },
  {
    lang: "Arabic",
    flag: "🇸🇦",
    nativePhonetic: "Tahiyyatun ilal-asdiqa fi al-nujum.",
    englishTranslation: "Greetings to our friends in the stars. May time bring us together.",
    speakerNote: "Poetic greeting addressed to interstellar civilizations."
  },
  {
    lang: "Mandarin Chinese",
    flag: "🇨🇳",
    nativePhonetic: "Gewei dou hao ma? Women dou hen xiang nimen.",
    englishTranslation: "Hope everyone's well. We are thinking about all of you. Please come here to visit when you have time.",
    speakerNote: "Warm invitation carried beyond the Heliosphere at 17 km/s."
  },
  {
    lang: "Japanese",
    flag: "🇯🇵",
    nativePhonetic: "Konnichiwa. O-genki desu ka?",
    englishTranslation: "Hello. How are you?",
    speakerNote: "Preserved for over 1 billion years in interstellar vacuum."
  }
];

export class ScienceMiniGameManager {
  constructor(questManager, actorDirector) {
    this.questManager = questManager;
    this.actorDirector = actorDirector;
    this.activeMissionKey = null; // 'apollo11' | 'opportunity' | 'insight' | 'voyager1'
    this.animFrameId = null;

    // Mission 1 (Apollo 11 Delta-V) State
    this.apolloState = {
      jettisonDescentStage: false,
      fuelKg: 1450,
      sampleKg: 21.5,
      launched: false,
      launchProgress: 0
    };

    // Mission 2 (Opportunity APXS Spectroscopy) State
    this.oppyState = {
      energyCalibrationShift: -1.8, // Target is 0.0
      peakGain: 0.65,               // Target is 1.0
      selectedMineral: 'basalt',    // 'basalt' | 'olivine' | 'hematite'
      locked: false
    };

    // Mission 3 (InSight Seismology P/S Wave) State
    this.insightState = {
      tP: 14, // Target is 28.0s
      tS: 82, // Target is 64.0s
      quakeTriggered: false,
      wavePhase: 0,
      solved: false
    };

    // Mission 4 (Voyager 1 RTG Power & 22h Light-Delay) State
    this.voyagerState = {
      subsystems: {
        iss_camera: true,      // 28W (Should be OFF)
        scan_heater: true,     // 24W (Should be OFF)
        mag_sensor: true,      // 14W (Should be ON)
        pws_plasma: true,      // 18W (Should be ON)
        attitude_rcs: true,    // 35W (Should be ON)
        dsn_transmitter: true  // 178W (Should be ON)
      },
      transmitting: false,
      lightTravelProgress: 0, // 0 to 1 (represents 22h 34m 18s)
      goldenRecordUnlocked: false,
      selectedGreetingIdx: 0,
      flutePlaying: false
    };

    this.bindModalEvents();
  }

  bindModalEvents() {
    document.getElementById('minigame-close-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('minigame-dismiss-btn')?.addEventListener('click', () => this.closeModal());

    // Quick Launch Buttons in HUD & Comms Bubble
    document.getElementById('comms-minigame-btn')?.addEventListener('click', (e) => {
      const mId = e.currentTarget.dataset.missionId || 'apollo11';
      this.openMiniGame(mId);
    });
  }

  openMiniGame(missionKey) {
    // Map mission IDs or artifact IDs to the 4 flagship mini-games
    const keyMap = {
      moon_quest_apollo11: 'apollo11',
      moon_quest_pioneer: 'apollo11',
      apollo_lm: 'apollo11',
      apollo11: 'apollo11',

      mission_blueberries: 'opportunity',
      mission_locate: 'opportunity',
      hematite_blueberries: 'opportunity',
      oppy_rover: 'opportunity',
      opportunity: 'opportunity',

      mission_mossbauer: 'insight',
      mission_rat: 'insight',
      mission_insight: 'insight',
      insight_lander: 'insight',
      insight: 'insight',

      mission_blackbox: 'voyager1',
      mission_voyager: 'voyager1',
      voyager1: 'voyager1',
      golden_record: 'voyager1'
    };

    this.activeMissionKey = keyMap[missionKey] || 'apollo11';
    const backdrop = document.getElementById('minigame-modal-backdrop');
    if (backdrop) backdrop.classList.add('active');

    this.renderActiveMiniGame();
    this.startCanvasLoop();
  }

  closeModal() {
    const backdrop = document.getElementById('minigame-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.actorDirector?.voyagerActor) {
      this.actorDirector.voyagerActor.setGoldenRecordSpin(false);
      this.actorDirector.voyagerActor.triggerHandshakeWave(false);
    }
  }

  renderActiveMiniGame() {
    const badgeEl = document.getElementById('minigame-modal-badge');
    const titleEl = document.getElementById('minigame-modal-title');
    const subEl = document.getElementById('minigame-modal-sub');
    const container = document.getElementById('minigame-workbench-container');
    if (!container) return;

    // Update top mission switcher pills inside modal
    document.querySelectorAll('.mg-tab-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mg === this.activeMissionKey);
    });

    if (this.activeMissionKey === 'apollo11') {
      if (badgeEl) badgeEl.innerText = "MISSION 1 • TRANQUILITY BASE, MOON (1969)";
      if (titleEl) titleEl.innerText = "Apollo 11 ('Eagle') — The Staging Sacrifice";
      if (subEl) subEl.innerText = "Solve Tsiolkovsky's Rocket Equation (Delta-V) to discover why the golden Descent Stage stayed behind on the Moon.";
      this.renderApollo11Workbench(container);
    } else if (this.activeMissionKey === 'opportunity') {
      if (badgeEl) badgeEl.innerText = "MISSION 2 • PERSEVERANCE VALLEY, MARS (2018)";
      if (titleEl) titleEl.innerText = "Opportunity Rover — The Blueberries of Life";
      if (subEl) subEl.innerText = "Operate Oppy's Alpha Particle X-Ray Spectrometer (APXS) to match the atomic emission spectrum of Hematite.";
      this.renderOpportunityWorkbench(container);
    } else if (this.activeMissionKey === 'insight') {
      if (badgeEl) badgeEl.innerText = "MISSION 3 • ELYSIUM / ENDEAVOUR RIM, MARS";
      if (titleEl) titleEl.innerText = "InSight Lander — Listening to the Heart of Mars";
      if (subEl) subEl.innerText = "Listen to real synthesized Marsquake acoustics and align the P-Wave and S-Wave arrivals to probe Mars's liquid core.";
      this.renderInSightWorkbench(container);
    } else if (this.activeMissionKey === 'voyager1') {
      if (badgeEl) badgeEl.innerText = "MISSION 4 • INTERSTELLAR DEEP SPACE (24.3 BILLION KM)";
      if (titleEl) titleEl.innerText = "Voyager 1 — The Dying Candle & The Golden Record";
      if (subEl) subEl.innerText = "Balance decaying Plutonium-238 RTG power (249W limit), experience the 22-hour light-travel time delay, and unlock the Golden Record.";
      this.renderVoyagerWorkbench(container);
    }
  }

  // =========================================================================
  // MISSION 1: APOLLO 11 — TSIOLKOVSKY ROCKET EQUATION & STAGING SACRIFICE
  // =========================================================================
  calculateApolloDeltaV() {
    const Isp = 311; // seconds (APS hypergolic engine)
    const g0 = 9.80665;
    const ascentDryKg = 2158 + this.apolloState.sampleKg;
    const descentDryKg = this.apolloState.jettisonDescentStage ? 0 : 2150;
    const mFinal = ascentDryKg + descentDryKg;
    const mInitial = mFinal + this.apolloState.fuelKg;
    const deltaV = Isp * g0 * Math.log(mInitial / mFinal);
    return {
      deltaV: Math.round(deltaV),
      mInitial: Math.round(mInitial),
      mFinal: Math.round(mFinal),
      targetDeltaV: 1870,
      canReachOrbit: deltaV >= 1870 && this.apolloState.jettisonDescentStage
    };
  }

  renderApollo11Workbench(container) {
    const stats = this.calculateApolloDeltaV();

    container.innerHTML = `
      <div class="mg-dialogue-strip">
        <div class="mg-speaker-chip asha">📡 ASHA (Dhaka Rooftop)</div>
        <p class="mg-dialogue-quote">"Leo, look at the lunar telemetry! Why didn't Neil Armstrong and Buzz Aldrin fly the whole Eagle spacecraft back to Earth? Why leave the golden bottom half behind?"</p>
      </div>

      <div class="mg-split-grid">
        <!-- Left: Live Physics Canvas -->
        <div class="mg-canvas-panel">
          <canvas id="mg-live-canvas" width="540" height="300"></canvas>
          <div class="mg-formula-bar">
            <span><strong>Tsiolkovsky Rocket Equation:</strong> Δv = I<sub>sp</sub> · g<sub>0</sub> · ln(m<sub>0</sub> / m<sub>f</sub>)</span>
            <span class="mg-target-pill">Target Lunar Orbit Δv: ≥ 1,870 m/s</span>
          </div>
        </div>

        <!-- Right: Engineering Controls -->
        <div class="mg-controls-panel">
          <div class="mg-control-box">
            <label class="mg-label">1. SPACECRAFT STAGING CONFIGURATION</label>
            <div class="mg-toggle-row">
              <button class="mg-choice-btn ${!this.apolloState.jettisonDescentStage ? 'active warn' : ''}" id="btn-apollo-keep">
                🔒 Keep Full Lander Attached (+2,150 kg Descent Stage)
              </button>
              <button class="mg-choice-btn ${this.apolloState.jettisonDescentStage ? 'active success' : ''}" id="btn-apollo-stage">
                ⚡ Jettison Golden Descent Stage (Stage Separation)
              </button>
            </div>
          </div>

          <div class="mg-control-box">
            <div class="mg-slider-header">
              <label class="mg-label">2. ASCENT PROPELLANT LOAD (Aerozine-50 / N₂O₄)</label>
              <strong id="lbl-apollo-fuel">${this.apolloState.fuelKg} kg / 2,353 kg</strong>
            </div>
            <input type="range" id="rng-apollo-fuel" min="600" max="2353" step="10" value="${this.apolloState.fuelKg}" />
          </div>

          <div class="mg-telemetry-readout" id="apollo-telemetry-box">
            <div class="mg-stat-item">
              <span>Wet Mass (m₀):</span>
              <strong id="val-apollo-m0">${stats.mInitial} kg</strong>
            </div>
            <div class="mg-stat-item">
              <span>Dry Mass (m_f):</span>
              <strong id="val-apollo-mf">${stats.mFinal} kg</strong>
            </div>
            <div class="mg-stat-item highlight">
              <span>Computed Velocity (Δv):</span>
              <strong id="val-apollo-dv" class="${stats.canReachOrbit ? 'text-emerald' : 'text-amber'}">${stats.deltaV} m/s</strong>
            </div>
          </div>

          <div class="mg-status-banner ${stats.canReachOrbit ? 'ready' : 'blocked'}" id="apollo-status-banner">
            ${stats.canReachOrbit
              ? "✅ ORBITAL VELOCITY ACHIEVED (≥ 1,870 m/s)! Ready for Ascent Stage Liftoff!"
              : !this.apolloState.jettisonDescentStage
                ? "⚠️ TOO HEAVY! With the 2,150 kg golden Descent Stage attached, Eagle cannot reach 1,870 m/s and would fall back to the Moon!"
                : "⚠️ INSUFFICIENT PROPELLANT! Increase Ascent Fuel above 2,290 kg to reach 1,870 m/s."}
          </div>

          <button class="mg-primary-action-btn" id="btn-apollo-launch">
            🚀 FIRE ASCENT ENGINE & TEST LIFTOFF
          </button>

          <div class="mg-emotional-epilogue" id="apollo-epilogue-box" style="display: ${this.apolloState.launched ? 'block' : 'none'};">
            <strong>💛 ASHA & LEO'S REALIZATION — "THE STAGING SACRIFICE":</strong>
            <p>"The golden Descent Stage wasn't abandoned as trash! By staying behind as a launchpad and sacrificing its own return, it made the Ascent Cabin light enough for Neil and Buzz to escape lunar gravity and come home."</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-apollo-keep')?.addEventListener('click', () => {
      this.apolloState.jettisonDescentStage = false;
      this.apolloState.launched = false;
      martianAudio.playScannerBeep(false);
      this.renderApollo11Workbench(container);
    });

    document.getElementById('btn-apollo-stage')?.addEventListener('click', () => {
      this.apolloState.jettisonDescentStage = true;
      martianAudio.playScannerBeep(true);
      this.renderApollo11Workbench(container);
    });

    document.getElementById('rng-apollo-fuel')?.addEventListener('input', (e) => {
      this.apolloState.fuelKg = parseInt(e.target.value, 10);
      const updated = this.calculateApolloDeltaV();
      document.getElementById('lbl-apollo-fuel').innerText = `${this.apolloState.fuelKg} kg / 2,353 kg`;
      document.getElementById('val-apollo-m0').innerText = `${updated.mInitial} kg`;
      document.getElementById('val-apollo-mf').innerText = `${updated.mFinal} kg`;
      const dvEl = document.getElementById('val-apollo-dv');
      if (dvEl) {
        dvEl.innerText = `${updated.deltaV} m/s`;
        dvEl.className = updated.canReachOrbit ? 'text-emerald' : 'text-amber';
      }
      const banner = document.getElementById('apollo-status-banner');
      if (banner) {
        banner.className = `mg-status-banner ${updated.canReachOrbit ? 'ready' : 'blocked'}`;
        banner.innerText = updated.canReachOrbit
          ? "✅ ORBITAL VELOCITY ACHIEVED (≥ 1,870 m/s)! Ready for Ascent Stage Liftoff!"
          : !this.apolloState.jettisonDescentStage
            ? "⚠️ TOO HEAVY! With the 2,150 kg golden Descent Stage attached, Eagle cannot reach 1,870 m/s!"
            : "⚠️ INSUFFICIENT PROPELLANT! Increase Ascent Fuel above 2,290 kg to reach 1,870 m/s.";
      }
    });

    document.getElementById('btn-apollo-launch')?.addEventListener('click', () => {
      const check = this.calculateApolloDeltaV();
      this.apolloState.launchProgress = 0.01;
      if (check.canReachOrbit) {
        this.apolloState.launched = true;
        martianAudio.playRocketIgnition(3.2);
        this.actorDirector?.apolloLMActor?.triggerStagingLiftoff();
        this.questManager?.markMissionCompleted('moon_quest_apollo11');
        const epilogue = document.getElementById('apollo-epilogue-box');
        if (epilogue) epilogue.style.display = 'block';
        this.actorDirector?.triggerCommsDialogue({
          speaker: 'asha',
          emotion: 'emotional',
          title: "ASHA • TRANQUILITY BASE TELEMETRY",
          text: "Look at the golden Descent Stage standing alone at Tranquility Base... It sacrificed itself so the astronauts could go home!"
        });
      } else {
        martianAudio.playScannerBeep(false);
      }
    });
  }

  // =========================================================================
  // MISSION 2: OPPORTUNITY ROVER — APXS SPECTROSCOPY ("BLUEBERRIES OF LIFE")
  // =========================================================================
  calculateAPXSMatch() {
    const shiftErr = Math.abs(this.oppyState.energyCalibrationShift);
    const gainErr = Math.abs(1.0 - this.oppyState.peakGain);
    const alignmentScore = Math.max(0, 100 - (shiftErr * 28 + gainErr * 55));
    const isHematite = this.oppyState.selectedMineral === 'hematite';
    return {
      alignmentPct: Math.min(99.8, Math.round(alignmentScore * 10) / 10),
      isSolved: alignmentScore >= 88 && isHematite
    };
  }

  renderOpportunityWorkbench(container) {
    const match = this.calculateAPXSMatch();

    container.innerHTML = `
      <div class="mg-dialogue-strip">
        <div class="mg-speaker-chip leo">🔬 LEO (KSC Robotics Lab)</div>
        <p class="mg-dialogue-quote">"In normal games, you just press a magic scan button. Here, we're aiming Oppy's real Alpha Particle X-Ray Spectrometer (APXS) at the Martian 'Blueberries' to match the Iron K-alpha (6.40 keV) and K-beta (7.06 keV) spectral lines!"</p>
      </div>

      <div class="mg-split-grid">
        <!-- Left: Live X-Ray Fluorescence Spectrum Canvas -->
        <div class="mg-canvas-panel">
          <canvas id="mg-live-canvas" width="540" height="300"></canvas>
          <div class="mg-formula-bar">
            <span><strong>Instrument:</strong> Curium-244 APXS X-Ray Fluorescence</span>
            <span class="mg-target-pill">Signature Peaks: Fe-Kα (6.40 keV) & Fe-Kβ (7.06 keV)</span>
          </div>
        </div>

        <!-- Right: Spectrometer Controls -->
        <div class="mg-controls-panel">
          <div class="mg-control-box">
            <div class="mg-slider-header">
              <label class="mg-label">1. X-RAY ENERGY CALIBRATION SHIFT (keV Alignment)</label>
              <strong id="lbl-apxs-shift">${this.oppyState.energyCalibrationShift.toFixed(2)} keV</strong>
            </div>
            <input type="range" id="rng-apxs-shift" min="-2.5" max="2.5" step="0.05" value="${this.oppyState.energyCalibrationShift}" />
          </div>

          <div class="mg-control-box">
            <div class="mg-slider-header">
              <label class="mg-label">2. PHOTON DETECTOR GAIN (Peak Amplitude Match)</label>
              <strong id="lbl-apxs-gain">${Math.round(this.oppyState.peakGain * 100)}%</strong>
            </div>
            <input type="range" id="rng-apxs-gain" min="0.4" max="1.3" step="0.02" value="${this.oppyState.peakGain}" />
          </div>

          <div class="mg-control-box">
            <label class="mg-label">3. IDENTIFY MINERAL SPECTRUM SIGNATURE</label>
            <div class="mg-toggle-row three-col">
              <button class="mg-choice-btn ${this.oppyState.selectedMineral === 'basalt' ? 'active' : ''}" data-mineral="basalt">
                🪨 Dry Basalt (Si/Mg)
              </button>
              <button class="mg-choice-btn ${this.oppyState.selectedMineral === 'olivine' ? 'active' : ''}" data-mineral="olivine">
                🌋 Volcanic Olivine
              </button>
              <button class="mg-choice-btn ${this.oppyState.selectedMineral === 'hematite' ? 'active success' : ''}" data-mineral="hematite">
                🫐 Hematite (α-Fe₂O₃)
              </button>
            </div>
          </div>

          <div class="mg-status-banner ${match.isSolved ? 'ready' : 'blocked'}" id="apxs-status-banner">
            Spectral Correlation: <strong>${match.alignmentPct}%</strong> •
            ${match.isSolved
              ? "✅ HEMATITE (α-Fe₂O₃) CONFIRMED! Forms only in liquid groundwater!"
              : "Align the Cyan Measured Curve onto the Red Reference Peaks (Shift → 0.00 keV, Gain → 100%) and select Hematite!"}
          </div>

          <button class="mg-primary-action-btn" id="btn-apxs-confirm">
            🔬 LOCK SPECTRUM & DECODE OPPY'S MEMORY LOG
          </button>

          <div class="mg-emotional-epilogue" id="oppy-epilogue-box" style="display: ${this.oppyState.locked ? 'block' : 'none'};">
            <strong>🤖 OPPORTUNITY'S FINAL MEMORY LOG (SOL 5111 — TAU 10.8):</strong>
            <p>"My solar panels are covered in darkness, and my battery is nearly empty... but don't be sad, Asha and Leo. I left proof for you in these Hematite blueberries: ancient rivers and warm lakes once flowed across Mars!"</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('rng-apxs-shift')?.addEventListener('input', (e) => {
      this.oppyState.energyCalibrationShift = parseFloat(e.target.value);
      document.getElementById('lbl-apxs-shift').innerText = `${this.oppyState.energyCalibrationShift.toFixed(2)} keV`;
      this.updateAPXSStatusBanner();
    });

    document.getElementById('rng-apxs-gain')?.addEventListener('input', (e) => {
      this.oppyState.peakGain = parseFloat(e.target.value);
      document.getElementById('lbl-apxs-gain').innerText = `${Math.round(this.oppyState.peakGain * 100)}%`;
      this.updateAPXSStatusBanner();
    });

    container.querySelectorAll('[data-mineral]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.oppyState.selectedMineral = btn.dataset.mineral;
        martianAudio.playScannerBeep(btn.dataset.mineral === 'hematite');
        this.renderOpportunityWorkbench(container);
      });
    });

    document.getElementById('btn-apxs-confirm')?.addEventListener('click', () => {
      const m = this.calculateAPXSMatch();
      martianAudio.playAPXSSpectrometerBeam();
      this.actorDirector?.marsRoverActor?.triggerAPXSScanAnimation();
      if (m.isSolved) {
        this.oppyState.locked = true;
        this.questManager?.markMissionCompleted('mission_blueberries');
        const epilogue = document.getElementById('oppy-epilogue-box');
        if (epilogue) epilogue.style.display = 'block';
        this.actorDirector?.triggerCommsDialogue({
          speaker: 'both',
          emotion: 'emotional',
          title: "OPPORTUNITY (MER-B) • FINAL MEMORY HANDSHAKE",
          text: "My solar panels are covered in darkness, but I left proof for you—rivers once flowed on Mars!"
        });
      }
    });
  }

  updateAPXSStatusBanner() {
    const match = this.calculateAPXSMatch();
    const banner = document.getElementById('apxs-status-banner');
    if (banner) {
      banner.className = `mg-status-banner ${match.isSolved ? 'ready' : 'blocked'}`;
      banner.innerHTML = `Spectral Correlation: <strong>${match.alignmentPct}%</strong> • ${
        match.isSolved
          ? "✅ HEMATITE (α-Fe₂O₃) CONFIRMED! Forms only in liquid groundwater!"
          : "Align the Cyan Measured Curve onto the Red Reference Peaks (Shift → 0.00 keV, Gain → 100%) and select Hematite!"
      }`;
    }
  }

  // =========================================================================
  // MISSION 3: INSIGHT LANDER — PLANETARY SEISMOLOGY (P-WAVE & S-WAVE PUZZLE)
  // =========================================================================
  calculateSeismologyMatch() {
    const pErr = Math.abs(this.insightState.tP - 28);
    const sErr = Math.abs(this.insightState.tS - 64);
    const deltaT = Math.max(1, this.insightState.tS - this.insightState.tP);
    // v_P = 5.0 km/s, v_S = 2.9 km/s => factor = (5.0 * 2.9) / (5.0 - 2.9) = 6.905 km/s
    const distanceKm = Math.round(deltaT * 6.905);
    const isMatched = pErr <= 4 && sErr <= 4;
    return { deltaT, distanceKm, isMatched };
  }

  renderInSightWorkbench(container) {
    const seis = this.calculateSeismologyMatch();

    container.innerHTML = `
      <div class="mg-dialogue-strip">
        <div class="mg-speaker-chip asha">🎧 ASHA (Headphone Seismology Link)</div>
        <p class="mg-dialogue-quote">"Put on your headphones! A meteoroid just struck Mars! Drag the Cyan P-Wave (Primary) and Amber S-Wave (Secondary) arrival markers onto the two seismic spikes to triangulate the quake and see inside Mars's heart!"</p>
      </div>

      <div class="mg-split-grid">
        <!-- Left: Live SEIS Seismogram & Martian Core Cross-Section Canvas -->
        <div class="mg-canvas-panel">
          <canvas id="mg-live-canvas" width="540" height="300"></canvas>
          <div class="mg-formula-bar">
            <span><strong>Seismic Distance Formula:</strong> D = (t<sub>S</sub> − t<sub>P</sub>) · (v<sub>P</sub>·v<sub>S</sub>)/(v<sub>P</sub> − v<sub>S</sub>)</span>
            <span class="mg-target-pill">v<sub>P</sub> = 5.0 km/s | v<sub>S</sub> = 2.9 km/s</span>
          </div>
        </div>

        <!-- Right: Seismometer Calipers & Audio Trigger -->
        <div class="mg-controls-panel">
          <button class="mg-audio-trigger-btn" id="btn-insight-quake">
            💥 TRIGGER METEOROID IMPACT & PLAY REAL MARSQUAKE AUDIO
          </button>

          <div class="mg-control-box">
            <div class="mg-slider-header">
              <label class="mg-label">1. CYAN P-WAVE (PRIMARY) ARRIVAL MARKER (t<sub>P</sub>)</label>
              <strong id="lbl-seis-tp" class="text-cyan">${this.insightState.tP} s (Target: 28 s)</strong>
            </div>
            <input type="range" id="rng-seis-tp" min="5" max="50" step="1" value="${this.insightState.tP}" />
          </div>

          <div class="mg-control-box">
            <div class="mg-slider-header">
              <label class="mg-label">2. AMBER S-WAVE (SECONDARY) ARRIVAL MARKER (t<sub>S</sub>)</label>
              <strong id="lbl-seis-ts" class="text-amber">${this.insightState.tS} s (Target: 64 s)</strong>
            </div>
            <input type="range" id="rng-seis-ts" min="40" max="95" step="1" value="${this.insightState.tS}" />
          </div>

          <div class="mg-telemetry-readout">
            <div class="mg-stat-item">
              <span>Arrival Lag (Δt = t<sub>S</sub> − t<sub>P</sub>):</span>
              <strong id="val-seis-dt">${seis.deltaT} sec</strong>
            </div>
            <div class="mg-stat-item highlight">
              <span>Epicenter Distance (D):</span>
              <strong id="val-seis-dist">${seis.distanceKm} km</strong>
            </div>
          </div>

          <div class="mg-status-banner ${seis.isMatched ? 'ready' : 'blocked'}" id="seis-status-banner">
            ${seis.isMatched
              ? "✅ P-WAVE (28s) & S-WAVE (64s) LOCKED! Epicenter at 249 km • Martian Liquid Core Mapped!"
              : "Drag Marker t_P to the first cyan packet (28s) and Marker t_S to the larger amber packet (64s)!"}
          </div>

          <button class="mg-primary-action-btn" id="btn-seis-verify">
            🫀 LOCK SEISMOGRAM & LISTEN TO THE HEART OF MARS
          </button>

          <div class="mg-emotional-epilogue" id="insight-epilogue-box" style="display: ${this.insightState.solved ? 'block' : 'none'};">
            <strong>💛 INSIGHT LANDER MEMORY LOG — "HEARTBEAT OF A PLANET":</strong>
            <p>"I never drove a single meter, yet by pressing my golden SEIS ear against the red dust and listening to 1,319 marsquakes, I revealed Mars's crust, mantle, and molten liquid heart."</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-insight-quake')?.addEventListener('click', () => {
      this.insightState.quakeTriggered = true;
      this.insightState.wavePhase = 0.01;
      martianAudio.playMarsquakeWave();
      this.actorDirector?.insightActor?.triggerMarsquake3D();
    });

    const updateSeisUI = () => {
      const s = this.calculateSeismologyMatch();
      document.getElementById('lbl-seis-tp').innerText = `${this.insightState.tP} s (Target: 28 s)`;
      document.getElementById('lbl-seis-ts').innerText = `${this.insightState.tS} s (Target: 64 s)`;
      document.getElementById('val-seis-dt').innerText = `${s.deltaT} sec`;
      document.getElementById('val-seis-dist').innerText = `${s.distanceKm} km`;
      const banner = document.getElementById('seis-status-banner');
      if (banner) {
        banner.className = `mg-status-banner ${s.isMatched ? 'ready' : 'blocked'}`;
        banner.innerText = s.isMatched
          ? "✅ P-WAVE (28s) & S-WAVE (64s) LOCKED! Epicenter at 249 km • Martian Liquid Core Mapped!"
          : "Drag Marker t_P to the first cyan packet (28s) and Marker t_S to the larger amber packet (64s)!";
      }
    };

    document.getElementById('rng-seis-tp')?.addEventListener('input', (e) => {
      this.insightState.tP = parseInt(e.target.value, 10);
      updateSeisUI();
    });

    document.getElementById('rng-seis-ts')?.addEventListener('input', (e) => {
      this.insightState.tS = parseInt(e.target.value, 10);
      updateSeisUI();
    });

    document.getElementById('btn-seis-verify')?.addEventListener('click', () => {
      const s = this.calculateSeismologyMatch();
      martianAudio.playMarsquakeWave();
      this.actorDirector?.insightActor?.triggerMarsquake3D();
      if (s.isMatched) {
        this.insightState.solved = true;
        this.questManager?.markMissionCompleted('mission_mossbauer');
        const epilogue = document.getElementById('insight-epilogue-box');
        if (epilogue) epilogue.style.display = 'block';
        this.actorDirector?.triggerCommsDialogue({
          speaker: 'asha',
          emotion: 'celebrating',
          title: "ASHA & LEO • SEISMIC CORE DISCOVERY",
          text: "We matched the P-wave and S-wave arrivals! InSight proved Mars still has a molten liquid iron-alloy heart!"
        });
      }
    });
  }

  // =========================================================================
  // MISSION 4: VOYAGER 1 — RTG POWER BUDGET, 22H LIGHT-DELAY & GOLDEN RECORD
  // =========================================================================
  calculateVoyagerPower() {
    const costs = {
      iss_camera: 28,
      scan_heater: 24,
      mag_sensor: 14,
      pws_plasma: 18,
      attitude_rcs: 35,
      dsn_transmitter: 178
    };
    const sub = this.voyagerState.subsystems;
    let usedWatts = 0;
    Object.keys(costs).forEach(k => {
      if (sub[k]) usedWatts += costs[k];
    });
    const availableWatts = 249; // 470W at 1977 launch minus 4W/yr Pu-238 decay
    const coreActive = sub.mag_sensor && sub.pws_plasma && sub.attitude_rcs && sub.dsn_transmitter;
    const withinBudget = usedWatts <= availableWatts;
    const isOptimal = withinBudget && coreActive;

    return { usedWatts, availableWatts, withinBudget, coreActive, isOptimal };
  }

  renderVoyagerWorkbench(container) {
    const pwr = this.calculateVoyagerPower();
    const greeting = GOLDEN_RECORD_GREETINGS[this.voyagerState.selectedGreetingIdx] || GOLDEN_RECORD_GREETINGS[0];

    container.innerHTML = `
      <div class="mg-dialogue-strip">
        <div class="mg-speaker-chip leo">🌌 ASHA & LEO (Deep Space Network • 24.3 Billion km)</div>
        <p class="mg-dialogue-quote">"Voyager 1 is 24.3 billion km away where sunlight cannot reach. Its Plutonium-238 nuclear battery (RTG) loses 4 Watts every year—down to 249W! Shut down the cameras and heaters so we have enough power to send our 22-hour light-speed handshake!"</p>
      </div>

      <div class="mg-split-grid">
        <!-- Left: 22-Hour Light-Delay Propagation & Golden Record Canvas -->
        <div class="mg-canvas-panel">
          <canvas id="mg-live-canvas" width="540" height="300"></canvas>
          <div class="mg-formula-bar">
            <span><strong>Pu-238 Decay:</strong> −4.0 W/yr (249W Left)</span>
            <span class="mg-target-pill">One-Way Light Travel (t = d/c): 22h 34m 18s</span>
          </div>
        </div>

        <!-- Right: RTG Power Budgeting & Golden Record Turntable -->
        <div class="mg-controls-panel">
          <div class="mg-control-box">
            <div class="mg-slider-header">
              <label class="mg-label">1. RTG NUCLEAR POWER ALLOCATION MATRIX</label>
              <strong class="${pwr.withinBudget ? 'text-emerald' : 'text-rose'}">${pwr.usedWatts} W / ${pwr.availableWatts} W MAX</strong>
            </div>

            <div class="mg-power-grid">
              <label class="mg-power-toggle ${this.voyagerState.subsystems.iss_camera ? 'on warn' : 'off'}">
                <input type="checkbox" data-sub="iss_camera" ${this.voyagerState.subsystems.iss_camera ? 'checked' : ''}/>
                <span>📷 ISS Cameras (28W) <em>[Pitch Dark — Turn OFF]</em></span>
              </label>
              <label class="mg-power-toggle ${this.voyagerState.subsystems.scan_heater ? 'on warn' : 'off'}">
                <input type="checkbox" data-sub="scan_heater" ${this.voyagerState.subsystems.scan_heater ? 'checked' : ''}/>
                <span>🔥 Scan Platform Heater (24W) <em>[Turn OFF]</em></span>
              </label>
              <label class="mg-power-toggle ${this.voyagerState.subsystems.mag_sensor ? 'on ok' : 'off'}">
                <input type="checkbox" data-sub="mag_sensor" ${this.voyagerState.subsystems.mag_sensor ? 'checked' : ''}/>
                <span>🧲 Magnetometer MAG (14W) <em>[Keep ON]</em></span>
              </label>
              <label class="mg-power-toggle ${this.voyagerState.subsystems.pws_plasma ? 'on ok' : 'off'}">
                <input type="checkbox" data-sub="pws_plasma" ${this.voyagerState.subsystems.pws_plasma ? 'checked' : ''}/>
                <span>⚡ Plasma Wave PWS (18W) <em>[Keep ON]</em></span>
              </label>
              <label class="mg-power-toggle ${this.voyagerState.subsystems.dsn_transmitter ? 'on ok' : 'off'}">
                <input type="checkbox" data-sub="dsn_transmitter" ${this.voyagerState.subsystems.dsn_transmitter ? 'checked' : ''}/>
                <span>📡 High-Gain DSN Transmitter + Attitude (213W) <em>[Keep ON]</em></span>
              </label>
            </div>
          </div>

          <div class="mg-status-banner ${pwr.isOptimal ? 'ready' : 'blocked'}">
            ${pwr.isOptimal
              ? "✅ RTG POWER BALANCED AT 245W / 249W! Ready to transmit across 24.3 billion km!"
              : !pwr.withinBudget
                ? `⚠️ OVERLOAD (${pwr.usedWatts}W > 249W)! Turn OFF the ISS Cameras (-28W) and Scan Heater (-24W) to prevent brownout!`
                : "⚠️ Keep Magnetometer, Plasma Wave, and DSN Transmitter ON for interstellar telemetry!"}
          </div>

          <button class="mg-primary-action-btn" id="btn-voyager-handshake" ${!pwr.isOptimal ? 'disabled' : ''}>
            📡 TRANSMIT HANDSHAKE (SIMULATE 22-HOUR LIGHT-TRAVEL DELAY)
          </button>

          <!-- GOLDEN RECORD INTERACTIVE PLAYER (Unlocks after 22h Light-Delay Handshake) -->
          <div class="mg-golden-record-box" id="voyager-golden-record-ui" style="display: ${this.voyagerState.goldenRecordUnlocked ? 'block' : 'none'};">
            <div class="gr-header">
              <span>📀 <strong>VOYAGER GOLDEN RECORD UNLOCKED (55 LANGUAGES & SOUNDS OF EARTH)</strong></span>
              <button class="gr-flute-btn" id="btn-play-flute">🎵 Play Bamboo Flute Melody</button>
            </div>
            <div class="gr-lang-pills">
              ${GOLDEN_RECORD_GREETINGS.map((g, idx) => `
                <button class="gr-lang-pill ${idx === this.voyagerState.selectedGreetingIdx ? 'active' : ''}" data-gidx="${idx}">
                  ${g.flag} ${g.lang}
                </button>
              `).join('')}
            </div>
            <div class="gr-greeting-card">
              <div class="gr-phonetic">"${greeting.nativePhonetic}"</div>
              <div class="gr-translation">English Meaning: <strong>"${greeting.englishTranslation}"</strong></div>
              <div class="gr-note">${greeting.speakerNote}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-sub]').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.sub;
        if (key === 'dsn_transmitter') {
          this.voyagerState.subsystems.dsn_transmitter = e.target.checked;
          this.voyagerState.subsystems.attitude_rcs = e.target.checked;
        } else {
          this.voyagerState.subsystems[key] = e.target.checked;
        }
        martianAudio.playScannerBeep(true);
        const updatedPwr = this.calculateVoyagerPower();
        this.actorDirector?.voyagerActor?.setCameraPowered(this.voyagerState.subsystems.iss_camera);
        this.actorDirector?.voyagerActor?.setRTGThermalGlow(updatedPwr.availableWatts);
        this.renderVoyagerWorkbench(container);
      });
    });

    document.getElementById('btn-voyager-handshake')?.addEventListener('click', () => {
      if (this.voyagerState.transmitting) return;
      this.voyagerState.transmitting = true;
      this.voyagerState.lightTravelProgress = 0.01;
      martianAudio.playTelemetryTransmission();
      this.actorDirector?.voyagerActor?.triggerHandshakeWave(true);
    });

    container.querySelectorAll('[data-gidx]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.voyagerState.selectedGreetingIdx = parseInt(btn.dataset.gidx, 10);
        martianAudio.playVoiceCadence('asha');
        this.renderVoyagerWorkbench(container);
      });
    });

    document.getElementById('btn-play-flute')?.addEventListener('click', () => {
      this.voyagerState.flutePlaying = true;
      this.actorDirector?.voyagerActor?.setGoldenRecordSpin(true);
      martianAudio.playGoldenRecordFlute();
      this.actorDirector?.triggerCommsDialogue({
        speaker: 'both',
        emotion: 'celebrating',
        title: "VOYAGER 1 GOLDEN RECORD • INTERSTELLAR HARMONY",
        text: "Listen! Across 24.3 billion kilometers of dark space, humanity's greetings and the bamboo flute melody are still shining in the cosmos!"
      });
    });
  }

  // =========================================================================
  // REAL-TIME INTERACTIVE 2D SCIENTIFIC CANVAS RENDERER
  // =========================================================================
  startCanvasLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const loop = (timestamp) => {
      const canvas = document.getElementById('mg-live-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const t = timestamp * 0.001;
        if (this.activeMissionKey === 'apollo11') {
          this.drawApolloCanvas(ctx, canvas.width, canvas.height, t);
        } else if (this.activeMissionKey === 'opportunity') {
          this.drawOpportunityCanvas(ctx, canvas.width, canvas.height, t);
        } else if (this.activeMissionKey === 'insight') {
          this.drawInSightCanvas(ctx, canvas.width, canvas.height, t);
        } else if (this.activeMissionKey === 'voyager1') {
          this.drawVoyagerCanvas(ctx, canvas.width, canvas.height, t);
        }
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  drawApolloCanvas(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#050b16';
    ctx.fillRect(0, 0, w, h);

    // Lunar horizon curve
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, h - 42);
    ctx.quadraticCurveTo(w * 0.5, h - 62, w, h - 42);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Target Lunar Orbit Altitude Dashed Line (1,870 m/s threshold)
    ctx.strokeStyle = '#10b981';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(20, 48);
    ctx.lineTo(w - 20, 48);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('LUNAR ORBIT INSERTION VELOCITY THRESHOLD (Δv = 1,870 m/s)', 26, 40);

    const stats = this.calculateApolloDeltaV();
    const ratio = Math.min(1.08, stats.deltaV / 1870);

    // Predicted Trajectory Curve
    ctx.strokeStyle = stats.canReachOrbit ? '#00e5ff' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(90, h - 55);
    if (stats.canReachOrbit) {
      ctx.quadraticCurveTo(w * 0.45, 42, w - 35, 44);
    } else {
      const peakY = (h - 55) - ratio * 155;
      ctx.quadraticCurveTo(w * 0.42, peakY, w * 0.78, h - 48);
    }
    ctx.stroke();

    // Draw Descent Stage at Tranquility Base (X = 90)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(72, h - 68, 36, 16);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(72, h - 52); ctx.lineTo(64, h - 44);
    ctx.moveTo(108, h - 52); ctx.lineTo(116, h - 44);
    ctx.stroke();

    // Animate Ascent Stage if launched
    if (this.apolloState.launchProgress > 0) {
      this.apolloState.launchProgress = Math.min(1, this.apolloState.launchProgress + 0.008);
    }
    const p = this.apolloState.launchProgress;
    const ascX = 90 + p * (stats.canReachOrbit ? (w - 140) : (w * 0.55));
    const ascY = stats.canReachOrbit
      ? (h - 82) - Math.sin(p * Math.PI * 0.5) * (h - 130)
      : (h - 82) - Math.sin(p * Math.PI) * 110;

    // Draw Ascent Cabin
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(ascX - 14, ascY - 14, 28, 16);
    if (p > 0 && p < 0.98) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(ascX - 6, ascY + 2);
      ctx.lineTo(ascX + 6, ascY + 2);
      ctx.lineTo(ascX, ascY + 18 + Math.sin(t * 40) * 5);
      ctx.fill();
    }

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillText(
      this.apolloState.jettisonDescentStage
        ? '⚡ Stage Separation Active: Golden Descent Stage Remains at Tranquility Base'
        : '🔒 Unstaged: Carrying Heavy Descent Stage (+2,150 kg Dead Weight)',
      26,
      h - 14
    );
  }

  drawOpportunityCanvas(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#070d19';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w - 20; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 25); ctx.lineTo(x, h - 35); ctx.stroke();
    }
    for (let y = 35; y < h - 35; y += 45) {
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(w - 20, y); ctx.stroke();
    }

    // Reference Hematite Spectrum (Red Curve: Fe-Kα at 6.40 keV, Fe-Kβ at 7.06 keV)
    const drawSpectrum = (shiftKeV, gain, color, lineWidth, isDashed = false) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      if (isDashed) ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (let px = 40; px <= w - 20; px += 3) {
        const keV = ((px - 40) / (w - 60)) * 9.0 + 0.5 - shiftKeV;
        // Characteristic peaks: Ti/Ca minor at 4.5 keV, Fe-Kα major at 6.40 keV, Fe-Kβ at 7.06 keV
        const peak1 = Math.exp(-Math.pow((keV - 3.2) / 0.35, 2)) * 32;
        const feKa = Math.exp(-Math.pow((keV - 6.40) / 0.28, 2)) * 175 * gain;
        const feKb = Math.exp(-Math.pow((keV - 7.06) / 0.22, 2)) * 78 * gain;
        const y = (h - 42) - (peak1 + feKa + feKb);
        if (px === 40) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
      ctx.restore();
    };

    // Draw Reference Target Hematite Spectrum (Red)
    drawSpectrum(0.0, 1.0, '#f43f5e', 2.5, true);

    // Draw Player's Calibrated APXS Spectrum (Cyan)
    drawSpectrum(
      this.oppyState.energyCalibrationShift,
      this.oppyState.peakGain + Math.sin(t * 6) * 0.015,
      '#00e5ff',
      3.0,
      false
    );

    // Labels
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('--- Reference Hematite (α-Fe₂O₃): Fe-Kα (6.40 keV) & Fe-Kβ (7.06 keV)', 48, 24);
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('─── Live APXS Measured Spectrum (Align Cyan onto Red Peaks)', 48, 42);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('1.0 keV', 44, h - 14);
    ctx.fillText('5.0 keV', w * 0.5 - 20, h - 14);
    ctx.fillText('6.40 keV (Fe-Kα)', w * 0.67 - 30, h - 14);
    ctx.fillText('9.5 keV', w - 72, h - 14);
  }

  drawInSightCanvas(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#060c17';
    ctx.fillRect(0, 0, w, h);

    const midY = h * 0.52;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.beginPath(); ctx.moveTo(20, midY); ctx.lineTo(w - 20, midY); ctx.stroke();

    // Draw SEIS Seismogram Waveform (Time 0s to 100s)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let px = 25; px <= w - 25; px += 2) {
      const sec = ((px - 25) / (w - 50)) * 100;
      let amp = Math.sin(sec * 2.5 + t * 4) * 2.0; // Micro-seismic background noise

      // Primary P-Wave packet starting at 28s
      if (sec >= 28 && sec <= 46) {
        const env = Math.exp(-(sec - 28) * 0.16);
        amp += Math.sin((sec - 28) * 9.5 - t * 12) * 34 * env;
      }
      // Secondary S-Wave packet starting at 64s (larger shear amplitude)
      if (sec >= 64 && sec <= 92) {
        const env = Math.exp(-(sec - 64) * 0.11);
        amp += Math.sin((sec - 64) * 6.2 - t * 8) * 68 * env;
      }

      const y = midY - amp;
      if (px === 25) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    // Draw Player's P-Wave Marker (t_P)
    const pX = 25 + (this.insightState.tP / 100) * (w - 50);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(pX, 22); ctx.lineTo(pX, h - 28); ctx.stroke();
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`P-Wave (t_P = ${this.insightState.tP}s)`, Math.min(w - 140, Math.max(25, pX - 45)), 18);

    // Draw Player's S-Wave Marker (t_S)
    const sX = 25 + (this.insightState.tS / 100) * (w - 50);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(sX, 22); ctx.lineTo(sX, h - 28); ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`S-Wave (t_S = ${this.insightState.tS}s)`, Math.min(w - 140, Math.max(25, sX - 45)), h - 10);

    // Mini Mars Core Cross-Section Diagram in Top-Right Corner when matched
    const seis = this.calculateSeismologyMatch();
    if (seis.isMatched) {
      const cx = w - 68, cy = 66;
      ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.fill(); // Crust
      ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.arc(cx, cy, 31, 0, Math.PI * 2); ctx.fill(); // Mantle
      ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill(); // Liquid Core
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px "Outfit", sans-serif';
      ctx.fillText('LIQUID', cx - 14, cy + 3);
    }
  }

  drawVoyagerCanvas(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Advance 22-hour light-travel progress if transmitting
    if (this.voyagerState.transmitting) {
      this.voyagerState.lightTravelProgress = Math.min(1, this.voyagerState.lightTravelProgress + 0.0045);
      if (this.voyagerState.lightTravelProgress >= 1 && !this.voyagerState.goldenRecordUnlocked) {
        this.voyagerState.transmitting = false;
        this.voyagerState.goldenRecordUnlocked = true;
        this.questManager?.markMissionCompleted('mission_blackbox');
        this.actorDirector?.voyagerActor?.setGoldenRecordSpin(true);
        martianAudio.playGoldenRecordFlute();
        const grBox = document.getElementById('voyager-golden-record-ui');
        if (grBox) grBox.style.display = 'block';
        this.actorDirector?.triggerCommsDialogue({
          speaker: 'both',
          emotion: 'celebrating',
          title: "22H 34M LATER • VOYAGER 1 HANDSHAKE RECEIVED!",
          text: "Signal locked at 24.3 billion km! We unlocked the Golden Record—listen to the Bengali greeting and the bamboo flute echoing among the stars!"
        });
      }
    }

    // Draw Earth (Left) -> Heliosphere -> Voyager 1 (Right) Light-Speed Propagation Path
    const earthX = 56, voyagerX = w - 68, lineY = h * 0.45;

    // Heliopause boundary arc
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(earthX, lineY, voyagerX - earthX - 75, -0.45, 0.45);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('Heliopause (121 AU)', voyagerX - 180, lineY - 58);

    // Signal Path Line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(earthX, lineY); ctx.lineTo(voyagerX, lineY); ctx.stroke();

    // Active Photon Wave Progress
    const prog = this.voyagerState.goldenRecordUnlocked ? 1.0 : this.voyagerState.lightTravelProgress;
    if (prog > 0) {
      const curX = earthX + prog * (voyagerX - earthX);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(earthX, lineY); ctx.lineTo(curX, lineY); ctx.stroke();

      ctx.fillStyle = '#00e5ff';
      ctx.beginPath(); ctx.arc(curX, lineY, 7, 0, Math.PI * 2); ctx.fill();
    }

    // Pale Blue Dot Earth Node
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(earthX, lineY, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.fillText('🌍 Earth (DSN)', earthX - 34, lineY + 28);

    // Voyager 1 & Spinning Golden Record Disc on Right
    ctx.save();
    ctx.translate(voyagerX, lineY);
    ctx.rotate(t * (this.voyagerState.goldenRecordUnlocked ? 2.4 : 0.3));
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#fbbf24';
    ctx.fillText('🛰️ Voyager 1 (162 AU)', voyagerX - 58, lineY + 36);

    // Simulated Light-Travel Time Counter
    const totalMinutes = Math.round(prog * (22 * 60 + 34));
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText(
      `⏱️ Light-Speed Signal Elapsed Time: ${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m / 22h 34m (Distance: ${(prog * 24.3).toFixed(1)}B km)`,
      32,
      h - 22
    );
  }
}

