import * as THREE from 'three';
import { setupScene } from './renderer/scene.js';
import { createMartianTerrain } from './renderer/terrain.js';
import { createOpportunityRover } from './renderer/rover.js';
import { createMartianAtmosphere } from './renderer/atmosphere.js';
import { PlanetaryScanner } from './systems/scanner.js';
import { RoverController } from './systems/roverControls.js';
import { Sol5111TimelineManager } from './systems/sol5111.js';
import { PitchShowcaseDirector } from './systems/pitchMode.js';
import { martianAudio } from './systems/audio.js';
import { MissionQuestManager } from './systems/quests.js';
import { HISTORICAL_SOL_LOGS, SCIENTIFIC_PAYLOADS, ARCHAEOLOGICAL_ARTIFACTS } from './data/telemetryData.js';
import { CADET_QUIZ, KIDS_MISSIONS } from './data/kidsContent.js';

// Initialize WebGL Application
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('webgl-container');
  if (!container) return;

  // 1. Setup Three.js Scene, Camera & WebGL Renderer
  const sceneManager = setupScene(container);
  const { scene, camera, renderer, setOrbitEnabled, setTarget } = sceneManager;

  // 2. Create HiRISE Martian Digital Elevation Model & Terrain
  const { group: terrainGroup, getTerrainHeight } = createMartianTerrain();
  scene.add(terrainGroup);

  // 3. Create Opportunity Rover 3D Model
  const roverData = createOpportunityRover();
  const { rover, wheels, setDustAccumulation } = roverData;
  rover.position.set(0, getTerrainHeight(0, 0), 0);
  scene.add(rover);

  // 4. Create Martian Atmosphere & Sol 5111 Optical Extinction
  const atmosphere = createMartianAtmosphere(scene);
  scene.add(atmosphere.group);

  // 5. Setup Planetary LiDAR Scanner
  const scanner = new PlanetaryScanner(camera, scene, renderer.domElement);
  scanner.registerRoverSubsystems(rover);

  // 6. Setup Rover Driving Controller with Dynamic Scene Tracking
  const roverController = new RoverController(rover, wheels, getTerrainHeight, camera, sceneManager);

  // 7. Setup Mission Quest Manager for Kids & Youth Education
  let currentLanguage = 'en';
  const questManager = new MissionQuestManager(() => { });
  questManager.setLanguage(currentLanguage);

  // Live Driving Telemetry & GPS Waypoint Tracker
  const odometerElem = document.querySelector('.odometer-badge');
  const coordsElem = document.querySelector('.coords-line');
  const siteNameElem = document.querySelector('.coordinates-card .site-name');
  const radarHud = document.getElementById('rover-radar-hud');
  const radarTitle = document.getElementById('radar-title');
  const radarSub = document.getElementById('radar-sub');
  const radarScanBtn = document.getElementById('radar-scan-btn');
  const waypointHud = document.getElementById('waypoint-tracker-hud');

  let activeRadarArtifact = null;

  function getActiveMission() {
    const selected = KIDS_MISSIONS.find(m => m.id === questManager.selectedMissionId);
    if (selected) return selected;
    const firstUncompleted = KIDS_MISSIONS.find(m => !questManager.completedMissions.has(m.id));
    return firstUncompleted || KIDS_MISSIONS[0];
  }

  function getActiveMissionArtifact(missionId) {
    return ARCHAEOLOGICAL_ARTIFACTS.find(a => a.missionId === missionId);
  }

  function updateWaypointHUD() {
    const activeMission = getActiveMission();
    const artifact = getActiveMissionArtifact(activeMission?.id);
    const isBn = currentLanguage === 'bn';

    const iconElem = document.getElementById('waypoint-icon');
    const badgeElem = document.getElementById('waypoint-badge');
    const nameElem = document.getElementById('waypoint-name');
    const subElem = document.getElementById('waypoint-sub');
    const distValElem = document.getElementById('waypoint-dist-val');

    if (questManager.completedMissions.size === KIDS_MISSIONS.length) {
      if (iconElem) iconElem.innerText = '🏆';
      if (badgeElem) badgeElem.innerText = isBn ? 'সব মিশন সম্পন্ন!' : 'ALL 6 MISSIONS COMPLETED!';
      if (nameElem) nameElem.innerText = isBn ? 'মার্স মাস্টার সার্টিফিকেট আনলক হয়েছে!' : 'Master Certificate Unlocked!';
      if (subElem) subElem.innerText = isBn ? 'কুইজ খেলুন বা সার্টিফিকেট দেখুন ➔' : 'Play Space Cadet Quiz or View Certificate ➔';
      if (distValElem) distValElem.innerText = '100%';
      return;
    }

    if (activeMission) {
      scanner.setActiveWaypoint(activeMission.id);
      const isCompleted = questManager.completedMissions.has(activeMission.id);
      if (iconElem) iconElem.innerText = activeMission.badge || '🚀';
      if (badgeElem) badgeElem.innerText = `${isBn ? 'মিশন' : 'MISSION'} ${activeMission.level} / 6 ${isCompleted ? '✓' : ''}`;
      if (nameElem) nameElem.innerText = isBn ? activeMission.title_bn : activeMission.title_en;
      if (subElem) {
        subElem.innerText = isBn
          ? `নিশান: ${artifact ? artifact.title : ''} • ড্রাইভ করে কাছে যান`
          : `Drive rover toward the glowing beacon light pillar`;
      }

      if (artifact && distValElem) {
        const dx = rover.position.x - artifact.coords.x;
        const dz = rover.position.z - artifact.coords.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        distValElem.innerText = `${dist.toFixed(1)}m`;
      }
    }
  }

  roverController.onTelemetryUpdate = (stats) => {
    if (coordsElem) {
      coordsElem.innerText = `LAT: ${stats.lat}° S | LON: ${stats.lon}° E | ${stats.compassDir} (${stats.speedKmH} km/h)`;
    }
    if (odometerElem) {
      const extraKm = (stats.distanceMeters / 1000).toFixed(2);
      const totalKm = (45.16 + parseFloat(extraKm)).toFixed(2);
      odometerElem.innerText = `ODOMETER: ${totalKm} KM (+${stats.distanceMeters.toFixed(0)} M)`;
    }
    if (siteNameElem && stats.speedKmH > 0.1) {
      siteNameElem.innerText = `Perseverance Valley (Driving: ${stats.slopeDeg}° Slope)`;
    }

    // Live distance calculation to active GPS waypoint
    const activeMission = getActiveMission();
    const artifact = getActiveMissionArtifact(activeMission?.id);
    if (artifact && questManager.completedMissions.size < KIDS_MISSIONS.length) {
      const dx = rover.position.x - artifact.coords.x;
      const dz = rover.position.z - artifact.coords.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const distValElem = document.getElementById('waypoint-dist-val');
      if (distValElem) {
        distValElem.innerText = `${dist.toFixed(1)}m`;
      }

      // If rover is in direct proximity of target waypoint (<= 3.5m), trigger quick collection HUD
      if (dist <= 3.8 && !questManager.completedMissions.has(activeMission.id)) {
        activeRadarArtifact = artifact;
        if (radarHud) radarHud.style.display = 'flex';
        if (radarTitle) {
          radarTitle.innerText = currentLanguage === 'bn' ? `📍 ${artifact.title}` : `📍 TARGET WAYPOINT: ${artifact.title}`;
        }
        if (radarSub) {
          radarSub.innerText = currentLanguage === 'bn'
            ? `লক্ষ্যে পৌঁছেছ! (${dist.toFixed(1)}m) • সংগ্রহ করতে [E] চাপুন বা স্ক্যান করুন`
            : `Objective reached! (${dist.toFixed(1)}m) • Press [E] or Click to Collect`;
        }
      }
    }
  };

  roverController.onProximityAlert = (artifact, dist) => {
    if (dist <= 4.0 && artifact) {
      activeRadarArtifact = artifact;
      if (radarHud) radarHud.style.display = 'flex';
      if (radarTitle) {
        radarTitle.innerText = currentLanguage === 'bn' ? '📍 নিকটবর্তী ঐতিহাসিক নিদর্শন' : '📍 HISTORIC HARDWARE DETECTED';
      }
      if (radarSub) {
        radarSub.innerText = `${artifact.title} (${dist.toFixed(1)}m) • ${currentLanguage === 'bn' ? '[E] চাপুন বা স্ক্যান করুন' : 'Press [E] or Click to Scan'}`;
      }
    } else if (!activeRadarArtifact || dist > 4.5) {
      activeRadarArtifact = null;
      if (radarHud) radarHud.style.display = 'none';
    }
  };

  if (radarScanBtn) {
    radarScanBtn.addEventListener('click', () => {
      if (activeRadarArtifact) {
        scanner.triggerManualScan(activeRadarArtifact.id);
      }
    });
  }

  // Quick Key E to scan nearest artifact
  window.addEventListener('keydown', (e) => {
    if (['KeyE', 'e', 'E'].includes(e.code) && activeRadarArtifact) {
      scanner.triggerManualScan(activeRadarArtifact.id);
    }
  });

  // Clicking the Waypoint Tracker HUD opens the Missions Roadmap Drawer
  if (waypointHud) {
    waypointHud.addEventListener('click', () => {
      questManager.renderMissionsList();
      document.getElementById('missions-modal-backdrop')?.classList.add('active');
    });
  }

  updateWaypointHUD();

  // 8. State & Mode Manager
  let currentMode = 'archaeologist'; // 'archaeologist', 'sol5111', 'drive', 'pitch'
  let currentTau = 10.8;

  function updateAtmosphericOptics(tau) {
    currentTau = tau;
    const opticalResult = atmosphere.setAtmosphericTau(tau);
    setDustAccumulation(tau);
    martianAudio.updateAtmosphereWind(tau);

    // Update Left HUD values
    const hudTau = document.getElementById('hud-tau');
    const hudTauBar = document.getElementById('hud-tau-bar');
    const hudExtinction = document.getElementById('hud-extinction');
    const tauSlider = document.getElementById('tau-range-input');
    const tauValDisplay = document.getElementById('tau-val-display');

    if (hudTau) hudTau.innerText = tau.toFixed(1);
    if (hudTauBar) {
      const pct = Math.min(100, (tau / 10.8) * 100);
      hudTauBar.style.width = `${pct}%`;
    }
    if (hudExtinction) {
      hudExtinction.innerText = `${opticalResult.extinctionPercent.toFixed(3)}% ${currentLanguage === 'bn' ? 'সূর্যালোক বিলীন' : 'Sunlight Extinguished'}`;
    }
    if (tauSlider) tauSlider.value = tau;
    if (tauValDisplay) {
      const statusStr = tau > 8.0
        ? (currentLanguage === 'bn' ? '(রেকর্ড ধূলিঝড়)' : '(Record Storm)')
        : tau > 3.0
          ? (currentLanguage === 'bn' ? '(ধূলিঝড় চলমান)' : '(Dust Storm)')
          : (currentLanguage === 'bn' ? '(পরিষ্কার আকাশ)' : '(Nominal Clear)');
      tauValDisplay.innerText = `${tau.toFixed(1)} ${statusStr}`;
    }

    // Check Sol 5111 Storm Quest completion
    if (tau >= 10.0) {
      questManager.markMissionCompleted('mission_storm');
    }

    // Extrapolate Solar Array Power based on Beer-Lambert
    const simulatedPower = Math.max(18, Math.min(900, Math.round(900 * Math.exp(-tau / 0.82))));
    const hudPower = document.getElementById('hud-power');
    const hudPowerBar = document.getElementById('hud-power-bar');
    const hudVoltage = document.getElementById('hud-voltage');

    if (hudPower) hudPower.innerText = simulatedPower;
    if (hudPowerBar) {
      const pPct = Math.min(100, Math.max(2, (simulatedPower / 900) * 100));
      hudPowerBar.style.width = `${pPct}%`;
    }
    if (hudVoltage) {
      hudVoltage.innerText = (20.5 + (simulatedPower / 900) * 13.5).toFixed(1);
    }
  }

  // 9. Sol 5111 Timeline Simulation Manager
  const solTimelineManager = new Sol5111TimelineManager(
    (tau) => updateAtmosphericOptics(tau),
    (solData) => {
      const solDisplay = document.getElementById('current-sol-display');
      const solRange = document.getElementById('sol-range-input');
      if (solDisplay) {
        const tag = solData.sol === 5111 ? 'Final Transmission' : `Storm Sol ${solData.sol}`;
        solDisplay.innerText = `SOL ${solData.sol} (${tag})`;
      }
      if (solRange) solRange.value = solTimelineManager.currentSolIndex;
    }
  );

  // 10. 120-Second Pitch Showcase Director
  const pitchDirector = new PitchShowcaseDirector(
    camera,
    { enabled: true },
    atmosphere,
    rover,
    (tau) => updateAtmosphericOptics(tau),
    (pitchState) => {
      const overlay = document.getElementById('pitch-overlay');
      const actTag = document.getElementById('pitch-act-tag');
      const actTitle = document.getElementById('pitch-act-title');
      const timer = document.getElementById('pitch-timer');
      const narration = document.getElementById('pitch-narration-text');
      const bar = document.getElementById('pitch-progress-bar');

      if (overlay) overlay.style.display = 'block';
      if (actTag) actTag.innerText = `ACT ${pitchState.act.start < 19 ? 'I' : pitchState.act.start < 56 ? 'II' : pitchState.act.start < 89 ? 'III' : 'IV'}`;
      if (actTitle) actTitle.innerText = pitchState.act.title;
      if (timer) {
        const mins = Math.floor(pitchState.elapsed / 60);
        const secs = Math.floor(pitchState.elapsed % 60);
        timer.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} / 02:00`;
      }
      if (narration) narration.innerText = `"${pitchState.act.script}"`;
      if (bar) bar.style.width = `${pitchState.progress * 100}%`;
    }
  );

  // Initial optical settings
  updateAtmosphericOptics(10.8);

  // Scanner Callback & Quest Progression Hooks
  scanner.onScanCallback = ({ type, data }) => {
    // Mission Triggers
    questManager.markMissionCompleted('mission_locate');

    if (data.id === 'hematite_blueberries') {
      questManager.markMissionCompleted('mission_blueberries');
    } else if (data.id === 'rat' || data.id === 'rat_grind_spot') {
      questManager.markMissionCompleted('mission_rat');
    } else if (data.id === 'mossbauer') {
      questManager.markMissionCompleted('mission_mossbauer');
    } else if (data.id === 'blackbox_core') {
      questManager.markMissionCompleted('mission_blackbox');
    }

    // Update Top Badge Counter
    const topCount = document.getElementById('top-badge-count');
    if (topCount) topCount.innerText = `${questManager.completedMissions.size}/6`;

    // Show Scan Modal
    const modal = document.getElementById('scan-modal-backdrop');
    const badge = document.getElementById('modal-type-badge');
    const title = document.getElementById('modal-title');
    const abbrev = document.getElementById('modal-abbrev');
    const discoveries = document.getElementById('modal-discoveries');
    const wavelengths = document.getElementById('modal-wavelengths');
    const resolution = document.getElementById('modal-resolution');
    const significance = document.getElementById('modal-significance');
    const blackboxBox = document.getElementById('blackbox-audio-box');

    if (badge) badge.innerText = type === 'artifact'
      ? (currentLanguage === 'bn' ? 'মার্স প্রত্নতাত্ত্বিক স্মৃতিচিহ্ন' : 'ARCHAEOLOGICAL MONUMENT')
      : (currentLanguage === 'bn' ? 'সাবসিস্টেম ডায়াগনস্টিক স্ক্যান' : 'SUBSYSTEM SCAN');
    if (title) title.innerText = data.name || data.title;
    if (abbrev) abbrev.innerText = data.abbreviation || 'SITE ARTIFACT';
    if (discoveries) discoveries.innerText = data.discoveries || data.description;
    if (wavelengths) wavelengths.innerText = data.wavelengths || 'Visual / Elevation Spectral';
    if (resolution) resolution.innerText = data.resolution || 'Direct Physical Surface';
    if (significance) significance.innerText = data.significance;

    if (blackboxBox) {
      if (data.id === 'blackbox_core') {
        blackboxBox.style.display = 'block';
        martianAudio.playTelemetryTransmission();
      } else {
        blackboxBox.style.display = 'none';
      }
    }

    updateWaypointHUD();
    if (modal) modal.classList.add('active');
  };

  // Language Switcher Toggle (EN / BN)
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      currentLanguage = currentLanguage === 'en' ? 'bn' : 'en';
      questManager.setLanguage(currentLanguage);

      const flag = document.getElementById('lang-flag');
      const text = document.getElementById('lang-btn-text');
      if (flag) flag.innerText = currentLanguage === 'en' ? '🇧🇩' : '🇬🇧';
      if (text) text.innerText = currentLanguage === 'en' ? 'বাংলা' : 'English';

      applyLanguageTranslations(currentLanguage);
      updateWaypointHUD();
    });
  }

  function applyLanguageTranslations(lang) {
    const isBn = lang === 'bn';
    document.getElementById('top-badge-text').innerText = isBn ? 'নাসা স্পেস অ্যাপস • ইয়ুথ এক্সপ্লোরার' : 'NASA SPACE APPS • YOUTH EXPLORER';
    document.getElementById('top-project-title').innerText = isBn ? 'রিলিক্স অব দ্য রেড ডাস্ট' : 'RELICS OF THE RED DUST';
    document.getElementById('top-project-sub').innerText = isBn ? 'দ্য লাস্ট ট্রান্সমিশন • অপরচুনিটি রোভার (MER-B)' : 'THE LAST TRANSMISSION • MER-B OPPORTUNITY ROVER';
    document.getElementById('lbl-tab-archaeologist').innerText = isBn ? 'আর্কিওলজিস্ট ২০৮৫' : 'Archaeologist 2085';
    document.getElementById('lbl-tab-sol5111').innerText = isBn ? 'সল ৫১১১ ঝড়' : 'Sol 5111 Storm';
    document.getElementById('lbl-tab-drive').innerText = isBn ? 'রোভার ড্রাইভ' : 'Drive Rover';
    document.getElementById('lbl-tab-missions').innerHTML = `${isBn ? 'মিশন ও ব্যাজ' : 'Missions & Badges'} (<span id="top-badge-count">${questManager.completedMissions.size}/6</span>)`;
    document.getElementById('lbl-tab-pitch').innerText = isBn ? '১২০ সে. পিচ শোকেস' : '120s Pitch Showcase';
    document.getElementById('lbl-quiz-btn').innerText = isBn ? 'কুইজ' : 'Quiz';
    document.getElementById('lbl-pds-header').innerText = isBn ? 'নাসা পিডিএস লাইভ ডেটা' : 'NASA PDS TELEMETRY';
    document.getElementById('lbl-tau-card').innerText = isBn ? 'বায়ুমণ্ডলীয় ধূলির অপাসিটি (TAU)' : 'ATMOSPHERIC DUST OPACITY (TAU)';
    document.getElementById('lbl-power-card').innerText = isBn ? 'সোলার প্যানেল উৎপাদন' : 'SOLAR ARRAY GENERATION';
    document.getElementById('lbl-power-baseline').innerText = isBn ? 'স্বাভাবিক উৎপাদন: ৯০০ Wh' : 'Nominal baseline: 900 Wh';
    document.getElementById('lbl-volt-card').innerText = isBn ? 'ব্যাটারি ভোল্টেজ' : 'BUS VOLTAGE / BATTERY';
    document.getElementById('lbl-volt-sub').innerText = isBn ? 'স্লিপ কাটঅফ: ২০.৫ V' : 'Critical sleep cutoff: 20.5 V';
    document.getElementById('lbl-site-card').innerText = isBn ? 'মঙ্গলে অবস্থান' : 'MARTIAN SITE';
    document.getElementById('lbl-scanner-header').innerText = isBn ? 'আর্কিওলজিস্ট স্ক্যানার' : 'ARCHAEOLOGIST SCANNER';
    document.getElementById('lbl-scanner-instruction').innerHTML = isBn
      ? 'মিশন সম্পন্ন করতে যেকোনো <strong>রোভার পার্টস</strong> অথবা <strong>উজ্জ্বল নিশানে</strong> ক্লিক করো!'
      : 'Click on any <strong>Rover Subsystem</strong> or <strong>Glowing Beacons</strong> to scan and complete your missions!';
    document.getElementById('lbl-msb-title').innerText = isBn ? 'মিশন অগ্রগতি' : 'MISSION PROGRESS';
    document.getElementById('open-sheet-btn').innerText = isBn ? 'সবগুলো ৬টি মিশন দেখুন ➔' : 'View All 6 Missions ➔';

    // Game Hub Bilingual Strings
    const hubUserName = document.getElementById('lbl-hub-user-name');
    const hubRank = document.getElementById('lbl-hub-rank');
    const hubDust = document.getElementById('lbl-hub-dust');
    const hubGems = document.getElementById('lbl-hub-gems');
    const hubDaily = document.getElementById('lbl-hub-daily');
    const hubNews = document.getElementById('lbl-hub-news');
    const hubQuiz = document.getElementById('lbl-hub-quiz');
    const heroTag = document.getElementById('lbl-hero-tag');
    const heroTitle = document.getElementById('lbl-hero-title');
    const heroSub = document.getElementById('lbl-hero-sub');
    const heroBtn = document.getElementById('lbl-hero-btn');
    const cardArchTitle = document.getElementById('lbl-card-arch-title');
    const cardArchDesc = document.getElementById('lbl-card-arch-desc');
    const cardArchBtn = document.getElementById('lbl-card-arch-btn');
    const cardStormTitle = document.getElementById('lbl-card-storm-title');
    const cardStormDesc = document.getElementById('lbl-card-storm-desc');
    const cardStormBtn = document.getElementById('lbl-card-storm-btn');
    const cardRoadTitle = document.getElementById('lbl-card-road-title');
    const cardRoadDesc = document.getElementById('lbl-card-road-desc');
    const cardRoadBtn = document.getElementById('lbl-card-road-btn');
    const hnavHome = document.getElementById('lbl-hnav-home');
    const hnavRoad = document.getElementById('lbl-hnav-road');
    const hnavArch = document.getElementById('lbl-hnav-arch');
    const hnavStorm = document.getElementById('lbl-hnav-storm');
    const hnavDrive = document.getElementById('lbl-hnav-drive');
    const hnavPitch = document.getElementById('lbl-hnav-pitch');
    const hnavQuiz = document.getElementById('lbl-hnav-quiz');
    const hubLangFlag = document.getElementById('hub-lang-flag');
    const hubLangText = document.getElementById('hub-lang-text');

    if (hubUserName) hubUserName.innerText = isBn ? 'ক্যাডেট এক্সপ্লোরার' : 'CADET EXPLORER';
    if (hubRank) hubRank.innerText = isBn ? 'লেভেল ৪ প্রত্নতাত্ত্বিক' : 'LVL 4 ARCHAEOLOGIST';
    if (hubDust) hubDust.innerText = isBn ? 'সোলার ডাস্ট' : 'Solar Dust';
    if (hubGems) hubGems.innerText = isBn ? 'রত্ন' : 'Gems';
    if (hubDaily) hubDaily.innerText = isBn ? 'দৈনিক সল লগ' : 'DAILY SOL LOG';
    if (hubNews) hubNews.innerText = isBn ? 'মিশন আর্কাইভ' : 'MISSION NEWS';
    if (hubQuiz) hubQuiz.innerText = isBn ? 'রত্ন অর্জন' : 'EARN GEMS';
    if (heroTag) heroTag.innerText = isBn ? 'নাসা স্পেস অ্যাপস চ্যালেঞ্জ • ২০২৬' : 'THE SAVIOR OF PLANETARY HISTORY • NASA SPACE APPS';
    if (heroTitle) heroTitle.innerText = isBn ? 'রিলিক্স অব দ্য রেড ডাস্ট' : 'RELICS OF THE RED DUST';
    if (heroSub) heroSub.innerText = isBn ? 'দ্য লাস্ট ট্রান্সমিশন • অপরচুনিটি রোভার (MER-B)' : 'THE LAST TRANSMISSION • MER-B OPPORTUNITY ROVER';
    if (heroBtn) heroBtn.innerText = isBn ? '৩D মঙ্গল সিমুলেশনে প্রবেশ করুন' : 'ENTER 3D MARS SIMULATION';
    if (cardArchTitle) cardArchTitle.innerText = isBn ? 'আর্কিওলজিস্ট ২০৮৫' : 'Archaeologist 2085';
    if (cardArchDesc) cardArchDesc.innerText = isBn ? 'রোভারের যন্ত্রপাতি (RAT, Mini-TES, Mössbauer) স্ক্যান করে প্রাচীন পানির স্মৃতিচিহ্ন উন্মোচন করো।' : 'Locate MER-B, scan scientific instruments (RAT, Mini-TES, Mössbauer), and uncover ancient water relics.';
    if (cardArchBtn) cardArchBtn.innerText = isBn ? 'শুরু করুন ➔' : 'Play Now ➔';
    if (cardStormTitle) cardStormTitle.innerText = isBn ? 'সল ৫১১১-এর ভয়াল ঝড়' : 'The Sol 5111 Storm';
    if (cardStormDesc) cardStormDesc.innerText = isBn ? 'মঙ্গলের ভয়াল ধূলিঝড়ে অপটিক্যাল টাউ ১০.৮ করে সৌরশক্তি কমে যাওয়া লক্ষ্য করো।' : 'Witness the record global dust storm, slide Optical Tau to 10.8, and experience the solar power collapse.';
    if (cardStormBtn) cardStormBtn.innerText = isBn ? 'শুরু করুন ➔' : 'Play Now ➔';
    if (cardRoadTitle) cardRoadTitle.innerText = isBn ? 'এক্সপেডিশন রোডম্যাপ' : 'Expedition Roadmap';
    if (cardRoadDesc) cardRoadDesc.innerText = isBn ? '৬টি লেভেল সম্পন্ন করে রোভারের শেষ বার্তা ডিকোড করো এবং মাস্টার সার্টিফিকেট অর্জন করো।' : 'Follow the S-curve trail across 6 mission levels to decode Oppy\'s final words and earn the Master Certificate.';
    if (cardRoadBtn) cardRoadBtn.innerText = isBn ? 'শুরু করুন ➔' : 'Play Now ➔';
    if (hnavHome) hnavHome.innerText = isBn ? 'হোম' : 'HOME';
    if (hnavRoad) hnavRoad.innerText = isBn ? 'রোডম্যাপ' : 'ROADMAP';
    if (hnavArch) hnavArch.innerText = isBn ? '৩D সিম' : '3D SIMULATOR';
    if (hnavStorm) hnavStorm.innerText = isBn ? 'সল ৫১১১' : 'SOL 5111';
    if (hnavDrive) hnavDrive.innerText = isBn ? 'ড্রাইভ' : 'DRIVE ROVER';
    if (hnavPitch) hnavPitch.innerText = isBn ? 'পিচ' : '120s PITCH';
    if (hnavQuiz) hnavQuiz.innerText = isBn ? 'কুইজ' : 'QUIZ';
    if (hubLangFlag) hubLangFlag.innerText = isBn ? '🇬🇧' : '🇧🇩';
    if (hubLangText) hubLangText.innerText = isBn ? 'English' : 'বাংলা';
  }

  // UI Mode Setting
  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    const scannerPanel = document.getElementById('scanner-panel');
    const solSlider = document.getElementById('sol-slider-container');
    const driveControls = document.getElementById('drive-touch-controls');
    const pitchOverlay = document.getElementById('pitch-overlay');

    if (mode !== 'pitch') {
      pitchDirector.stop();
      if (pitchOverlay) pitchOverlay.style.display = 'none';
      setOrbitEnabled(true);
    }

    if (mode === 'archaeologist') {
      if (scannerPanel) scannerPanel.style.display = 'flex';
      if (solSlider) solSlider.style.display = 'flex';
      if (driveControls) driveControls.style.display = 'none';
      updateAtmosphericOptics(1.2);
    } else if (mode === 'sol5111') {
      if (scannerPanel) scannerPanel.style.display = 'none';
      if (solSlider) solSlider.style.display = 'flex';
      if (driveControls) driveControls.style.display = 'none';
      solTimelineManager.setSolByIndex(HISTORICAL_SOL_LOGS.length - 1);
    } else if (mode === 'drive') {
      if (scannerPanel) scannerPanel.style.display = 'none';
      if (solSlider) solSlider.style.display = 'none';
      if (driveControls) driveControls.style.display = 'flex';
      updateAtmosphericOptics(1.0);
      setOrbitEnabled(true);
      setTarget(rover.position.x, rover.position.y + 0.6, rover.position.z);
    } else if (mode === 'pitch') {
      if (scannerPanel) scannerPanel.style.display = 'none';
      if (solSlider) solSlider.style.display = 'none';
      if (driveControls) driveControls.style.display = 'none';
      pitchDirector.start();
    }
  }

  // Game Hub Management
  const gameHubScreen = document.getElementById('game-hub-screen');

  function openGameHub() {
    if (gameHubScreen) gameHubScreen.classList.add('active');
    document.querySelectorAll('.hub-nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById('hub-tab-home')?.classList.add('active');
  }

  function closeGameHub() {
    if (gameHubScreen) gameHubScreen.classList.remove('active');
  }

  // Back to Hub button from 3D HUD
  document.getElementById('tab-home-hub')?.addEventListener('click', () => {
    openGameHub();
  });

  // Hero Launch Button
  document.getElementById('hub-hero-explore-btn')?.addEventListener('click', () => {
    closeGameHub();
    setMode('archaeologist');
  });

  // Hub Cards Click Handlers
  document.getElementById('hub-card-archaeology')?.addEventListener('click', () => {
    closeGameHub();
    setMode('archaeologist');
  });

  document.getElementById('hub-card-storm')?.addEventListener('click', () => {
    closeGameHub();
    setMode('sol5111');
  });

  document.getElementById('hub-card-roadmap')?.addEventListener('click', () => {
    closeGameHub();
    questManager.renderMissionsList();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });

  // Hub Quick Actions
  document.getElementById('hub-daily-log-btn')?.addEventListener('click', () => {
    questManager.nextFunFact();
    questManager.showBotDialogue(currentLanguage === 'bn' ? 'মঙ্গলের দৈনন্দিন গবেষণা লগ চেক করো!' : 'Here is today\'s Mars research log!', true);
    closeGameHub();
  });

  document.getElementById('hub-news-btn')?.addEventListener('click', () => {
    questManager.nextFunFact();
    questManager.showBotDialogue(currentLanguage === 'bn' ? 'মার্স রিকনেসাঁস ও নাসার সাম্প্রতিক সায়েন্স নিউজ আপডেট!' : 'Mars Reconnaissance and NASA Science Bulletin updated!', true);
    closeGameHub();
  });

  document.getElementById('hub-quiz-btn')?.addEventListener('click', () => {
    closeGameHub();
    document.getElementById('open-quiz-btn')?.click();
  });

  // Hub Bottom Navigation Tabs
  document.getElementById('hub-tab-home')?.addEventListener('click', () => {
    openGameHub();
  });

  document.getElementById('hub-tab-roadmap')?.addEventListener('click', () => {
    closeGameHub();
    questManager.renderMissionsList();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });

  document.getElementById('hub-tab-archaeology')?.addEventListener('click', () => {
    closeGameHub();
    setMode('archaeologist');
  });

  document.getElementById('hub-tab-storm')?.addEventListener('click', () => {
    closeGameHub();
    setMode('sol5111');
  });

  document.getElementById('hub-tab-drive')?.addEventListener('click', () => {
    closeGameHub();
    setMode('drive');
  });

  document.getElementById('hub-tab-pitch')?.addEventListener('click', () => {
    closeGameHub();
    setMode('pitch');
  });

  document.getElementById('hub-tab-quiz')?.addEventListener('click', () => {
    closeGameHub();
    document.getElementById('open-quiz-btn')?.click();
  });

  // Hub Utility Buttons Sync
  document.getElementById('hub-lang-toggle')?.addEventListener('click', () => {
    document.getElementById('lang-toggle-btn')?.click();
  });

  document.getElementById('hub-audio-toggle')?.addEventListener('click', () => {
    document.getElementById('audio-toggle-btn')?.click();
  });

  // Hook up Roadmap Direct Action Callback
  questManager.onMissionActionCallback = (missionId) => {
    closeGameHub();
    document.getElementById('missions-modal-backdrop')?.classList.remove('active');
    questManager.setSelectedMission(missionId);
    updateWaypointHUD();
    setMode('drive');

    const artifact = getActiveMissionArtifact(missionId);
    if (artifact) {
      scanner.setActiveWaypoint(missionId);
      const isBn = currentLanguage === 'bn';
      questManager.showBotDialogue(
        isBn
          ? `রোভার ড্রাইভ করে ${artifact.title}-এর উজ্জ্বল আলোর নিশানের দিকে যাও!`
          : `Drive the rover toward the glowing waypoint beacon for ${artifact.title}!`,
        true
      );
    }
  };

  // Navigation Click Handlers
  document.querySelectorAll('.nav-tab[data-mode]').forEach(tab => {
    tab.addEventListener('click', () => {
      setMode(tab.dataset.mode);
    });
  });

  // Missions Drawer Open
  document.getElementById('open-missions-btn')?.addEventListener('click', () => {
    questManager.renderMissionsList();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('open-sheet-btn')?.addEventListener('click', () => {
    questManager.renderMissionsList();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('missions-close-btn')?.addEventListener('click', () => {
    document.getElementById('missions-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('missions-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('missions-modal-backdrop')?.classList.remove('active');
  });

  // Interactive Space Cadet Quiz System
  let quizIndex = 0;
  let quizScore = 0;

  function renderQuizQuestion(idx) {
    const qData = CADET_QUIZ[idx];
    const isBn = currentLanguage === 'bn';
    const qStep = document.getElementById('lbl-quiz-step');
    const qText = document.getElementById('quiz-question-text');
    const optList = document.getElementById('quiz-options-list');
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const nextBtn = document.getElementById('quiz-next-btn');

    if (qStep) qStep.innerText = isBn ? `প্রশ্ন ${idx + 1} / 3` : `Question ${idx + 1} of 3`;
    if (qText) qText.innerText = isBn ? qData.question_bn : qData.question_en;
    if (feedbackBox) feedbackBox.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    const opts = isBn ? qData.options_bn : qData.options_en;
    if (optList) {
      optList.innerHTML = opts.map((opt, i) => `
        <button class="quiz-opt-btn" data-opt-idx="${i}">
          ${String.fromCharCode(65 + i)}) ${opt}
        </button>
      `).join('');

      optList.querySelectorAll('.quiz-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const selected = parseInt(btn.dataset.optIdx, 10);
          const isCorrect = selected === qData.correct;

          optList.querySelectorAll('.quiz-opt-btn').forEach((b, bi) => {
            b.disabled = true;
            if (bi === qData.correct) b.classList.add('correct');
            else if (bi === selected) b.classList.add('wrong');
          });

          if (isCorrect) {
            quizScore++;
            questManager.triggerConfetti();
            martianAudio.playScannerBeep(true);
          }

          if (feedbackBox) {
            feedbackBox.style.display = 'block';
            feedbackBox.style.borderColor = isCorrect ? '#10b981' : '#ff2a4b';
            feedbackBox.querySelector('p').innerText = isBn ? qData.explanation_bn : qData.explanation_en;
          }

          if (nextBtn) {
            nextBtn.style.display = 'block';
            nextBtn.innerText = idx === CADET_QUIZ.length - 1
              ? (isBn ? 'ফলাফল ও সার্টিফিকেট দেখুন 🏆' : 'VIEW RESULT & CERTIFICATE 🏆')
              : (isBn ? 'পরবর্তী প্রশ্ন ➔' : 'NEXT QUESTION ➔');
          }
        });
      });
    }
  }

  document.getElementById('open-quiz-btn')?.addEventListener('click', () => {
    quizIndex = 0;
    quizScore = 0;
    renderQuizQuestion(quizIndex);
    document.getElementById('quiz-modal-backdrop')?.classList.add('active');
  });

  document.getElementById('quiz-close-btn')?.addEventListener('click', () => {
    document.getElementById('quiz-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('quiz-next-btn')?.addEventListener('click', () => {
    quizIndex++;
    if (quizIndex < CADET_QUIZ.length) {
      renderQuizQuestion(quizIndex);
    } else {
      document.getElementById('quiz-modal-backdrop')?.classList.remove('active');
      questManager.triggerBigConfetti();
      questManager.showCertificateModal();
    }
  });

  // Certificate Modal Close
  document.getElementById('cert-close-btn')?.addEventListener('click', () => {
    document.getElementById('certificate-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('cert-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('certificate-modal-backdrop')?.classList.remove('active');
  });

  // Fun Fact Next Button
  document.getElementById('next-fact-btn')?.addEventListener('click', () => {
    questManager.nextFunFact();
  });

  // Companion Bot Avatar Click
  document.getElementById('bot-avatar-btn')?.addEventListener('click', () => {
    const speech = document.getElementById('bot-speech-bubble');
    if (speech) speech.classList.toggle('visible');
    martianAudio.playScannerBeep(false);
  });

  // Camera Buttons
  document.getElementById('cam-orbit')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.target);
    setOrbitEnabled(true);
    setTarget(rover.position.x, rover.position.y + 0.6, rover.position.z);
    camera.position.set(rover.position.x, rover.position.y + 2.2, rover.position.z + 5.5);
  });

  document.getElementById('cam-pancam')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.target);
    setOrbitEnabled(false);
    camera.position.set(rover.position.x + 0.28, rover.position.y + 1.5, rover.position.z + 0.45);
    camera.lookAt(rover.position.x, rover.position.y + 1.2, rover.position.z + 10);
  });

  document.getElementById('cam-top')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.target);
    setOrbitEnabled(false);
    camera.position.set(rover.position.x, rover.position.y + 16, rover.position.z);
    camera.lookAt(rover.position.x, rover.position.y, rover.position.z);
  });

  document.getElementById('cam-surface')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.target);
    setOrbitEnabled(true);
    camera.position.set(rover.position.x - 2.5, rover.position.y + 0.5, rover.position.z + 3.2);
    setTarget(rover.position.x, rover.position.y + 0.5, rover.position.z);
  });

  function setActiveCamBtn(target) {
    document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
  }

  // Sol Timeline Slider
  const solRangeInput = document.getElementById('sol-range-input');
  if (solRangeInput) {
    solRangeInput.addEventListener('input', (e) => {
      solTimelineManager.setSolByIndex(parseInt(e.target.value, 10));
    });
  }

  // Play Timeline Button
  document.getElementById('play-sol-timeline')?.addEventListener('click', () => {
    if (solTimelineManager.isPlayingTimeline) {
      solTimelineManager.stopTimeline();
      document.getElementById('play-sol-timeline').innerText = currentLanguage === 'bn' ? '▶ ঝড় চালান' : '▶ Play PEDE Storm';
    } else {
      solTimelineManager.playTimeline();
      document.getElementById('play-sol-timeline').innerText = currentLanguage === 'bn' ? '⏸ বিরতি' : '⏸ Pause';
    }
  });

  // Manual Tau Range Slider
  const tauRangeInput = document.getElementById('tau-range-input');
  if (tauRangeInput) {
    tauRangeInput.addEventListener('input', (e) => {
      updateAtmosphericOptics(parseFloat(e.target.value));
    });
  }

  // Reset Rover Position
  document.getElementById('reset-rover-pos')?.addEventListener('click', () => {
    roverController.position.set(0, 0, 0);
    roverController.heading = 0;
    roverController.velocity = 0;
    rover.position.set(0, getTerrainHeight(0, 0), 0);
    rover.rotation.set(0, 0, 0);
    setTarget(0, 0.6, 0);
  });

  // Audio Toggle Button
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isUnmuted = martianAudio.toggleMute();
      if (audioIcon) audioIcon.innerText = isUnmuted ? '🔊' : '🔇';
      const audioLabel = isUnmuted
        ? (currentLanguage === 'bn' ? 'অডিও: চালু' : 'Audio: ON')
        : (currentLanguage === 'bn' ? 'অডিও: বন্ধ' : 'Audio: OFF');
      document.getElementById('lbl-audio-btn').innerText = audioLabel;
      audioBtn.style.borderColor = isUnmuted ? 'var(--accent-mars)' : 'rgba(255, 255, 255, 0.15)';

      const hubAudioIcon = document.getElementById('hub-audio-icon');
      const hubAudioText = document.getElementById('hub-audio-text');
      if (hubAudioIcon) hubAudioIcon.innerText = isUnmuted ? '🔊' : '🔇';
      if (hubAudioText) hubAudioText.innerText = audioLabel;
    });
  }

  // Subsystem Quick Click in Right Panel
  document.querySelectorAll('.subsystem-item').forEach(item => {
    item.addEventListener('click', () => {
      const scanId = item.dataset.scan;
      const payload = SCIENTIFIC_PAYLOADS.find(p => p.id === scanId) ||
        ARCHAEOLOGICAL_ARTIFACTS.find(a => a.id === scanId);
      if (payload && scanner.onScanCallback) {
        scanner.onScanCallback({ type: 'payload', data: payload, point: rover.position });
      }
    });
  });

  // Modals Dismissal
  document.getElementById('modal-close-btn')?.addEventListener('click', () => {
    document.getElementById('scan-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('modal-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('scan-modal-backdrop')?.classList.remove('active');
  });

  // Drive Touch Controls
  const btnUp = document.getElementById('btn-drive-up');
  const btnDown = document.getElementById('btn-drive-down');
  const btnLeft = document.getElementById('btn-drive-left');
  const btnRight = document.getElementById('btn-drive-right');

  const setupTouchBtn = (btn, forward, turn) => {
    if (!btn) return;
    btn.addEventListener('pointerdown', () => roverController.setJoystickInput(forward, turn));
    btn.addEventListener('pointerup', () => roverController.setJoystickInput(0, 0));
    btn.addEventListener('pointerleave', () => roverController.setJoystickInput(0, 0));
  };
  setupTouchBtn(btnUp, 1, 0);
  setupTouchBtn(btnDown, -1, 0);
  setupTouchBtn(btnLeft, 0, 1);
  setupTouchBtn(btnRight, 0, -1);

  // 11. Main Animation Render Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    atmosphere.update(delta, currentTau);
    scanner.update(elapsedTime);

    if (currentMode === 'drive') {
      roverController.update(delta);
    }

    if (currentMode === 'pitch') {
      pitchDirector.update(delta);
    }

    renderer.render(scene, camera);
  }

  animate();
  console.log("🌟 Relics of the Red Dust: Youth Educational WebGL Engine Ready.");
});
