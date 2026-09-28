import * as THREE from 'three';
import { setupScene } from './renderer/scene.js';
import { createMartianTerrain } from './renderer/terrain.js';
import { createOpportunityRover } from './renderer/rover.js';
import { createMartianAtmosphere } from './renderer/atmosphere.js';
import { createLunarTerrain } from './renderer/moonTerrain.js';
import { createLunarRover } from './renderer/lunarRover.js';
import { createLunarAtmosphere } from './renderer/moonAtmosphere.js';
import { PlanetaryScanner } from './systems/scanner.js';
import { RoverController } from './systems/roverControls.js';
import { Sol5111TimelineManager } from './systems/sol5111.js';
import { PitchShowcaseDirector } from './systems/pitchMode.js';
import { martianAudio } from './systems/audio.js';
import { MissionQuestManager } from './systems/quests.js';
import { MissionNewsCarouselManager } from './systems/missionNewsCarousel.js';
import { SpaceCalendarManager } from './systems/spaceCalendar.js';
import { QuizLeaderboardManager } from './systems/quizLeaderboard.js';
import { HISTORICAL_SOL_LOGS, SCIENTIFIC_PAYLOADS, ARCHAEOLOGICAL_ARTIFACTS } from './data/telemetryData.js';
import { KIDS_MISSIONS_MARS, KIDS_MISSIONS_MOON } from './data/kidsContent.js';

// Initialize WebGL Application
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('webgl-container');
  if (!container) return;

  // 1. Setup Three.js Scene, Camera & WebGL Renderer
  const sceneManager = setupScene(container);
  const { scene, camera, renderer, setTarget, setCameraMode, fpp } = sceneManager;

  // 2. Active Planetary Environments & 3D Models
  let currentPlanet = 'mars'; // 'mars' or 'moon'
  let currentVehicle = 'opportunity'; // 'opportunity' or 'lunar_rover'

  // Mars Assets
  const marsTerrain = createMartianTerrain();
  const marsRover = createOpportunityRover();
  const marsAtmosphere = createMartianAtmosphere(scene);

  // Moon Assets
  const moonTerrain = createLunarTerrain();
  const moonRover = createLunarRover();
  const moonAtmosphere = createLunarAtmosphere(scene);

  // Groups currently added to scene
  let activeTerrainGroup = marsTerrain.group;
  let activeAtmosphere = marsAtmosphere;
  let activeRoverGroup = marsRover.rover;
  let activeWheels = marsRover.wheels;
  let activeGetTerrainHeight = marsTerrain.getTerrainHeight;

  scene.add(activeTerrainGroup);
  scene.add(activeAtmosphere.group);
  activeRoverGroup.position.set(0, activeGetTerrainHeight(0, 0), 0);
  scene.add(activeRoverGroup);

  // 3. Setup Planetary LiDAR Scanner
  const scanner = new PlanetaryScanner(camera, scene, renderer.domElement);
  scanner.registerRoverSubsystems(activeRoverGroup);
  scanner.registerInteractiveTerrain(activeTerrainGroup);

  // 4. Setup Rover Driving Controller with Dynamic Scene Tracking
  const roverController = new RoverController(activeRoverGroup, activeWheels, activeGetTerrainHeight, camera, sceneManager);

  // 5. Setup Mission Quest Manager
  let currentLanguage = 'en';
  const questManager = new MissionQuestManager(() => {});
  questManager.setLanguage(currentLanguage);

  // 6. Setup Auxiliary Systems: News, Calendar, Quiz & Leaderboard
  const newsManager = new MissionNewsCarouselManager();
  const calendarManager = new SpaceCalendarManager();
  const quizManager = new QuizLeaderboardManager(questManager);

  newsManager.setLanguage(currentLanguage);
  calendarManager.setLanguage(currentLanguage);
  quizManager.setLanguage(currentLanguage);

  // Sync initial XP display
  questManager.updateXPDisplays();

  // Function to switch Celestial Body (Mars <-> Moon)
  function switchCelestialBody(planet) {
    if (planet === currentPlanet) return;
    currentPlanet = planet;

    scene.remove(activeTerrainGroup);
    scene.remove(activeAtmosphere.group);
    scene.remove(activeRoverGroup);

    if (planet === 'moon') {
      activeTerrainGroup = moonTerrain.group;
      activeAtmosphere = moonAtmosphere;
      activeRoverGroup = currentVehicle === 'lunar_rover' ? moonRover.rover : marsRover.rover;
      activeWheels = currentVehicle === 'lunar_rover' ? moonRover.wheels : marsRover.wheels;
      activeGetTerrainHeight = moonTerrain.getTerrainHeight;
      scene.background = new THREE.Color(0x010204);

      document.getElementById('lbl-tau-card').innerText = currentLanguage === 'bn' ? 'বায়ুমণ্ডলীয় চাপ' : 'LUNAR VACUUM PRESSURE';
      document.getElementById('hud-tau').innerText = '0.0';
      document.getElementById('hud-extinction').innerText = currentLanguage === 'bn' ? 'বায়ুহীন মহাশূন্য' : 'High Vacuum (No Atmosphere)';
      document.getElementById('hud-site-name').innerText = 'Mare Tranquillitatis / Oceanus Procellarum';
      document.getElementById('hud-coords-line').innerText = 'LAT: 0.6740° N | LON: 23.4720° E';
      document.getElementById('top-badge-text').innerText = currentLanguage === 'bn' ? 'নাসা স্পেস অ্যাপস • চন্দ্র অভিযাত্রা' : 'NASA SPACE APPS • LUNAR EXPEDITION';
    } else {
      activeTerrainGroup = marsTerrain.group;
      activeAtmosphere = marsAtmosphere;
      activeRoverGroup = currentVehicle === 'lunar_rover' ? moonRover.rover : marsRover.rover;
      activeWheels = currentVehicle === 'lunar_rover' ? moonRover.wheels : marsRover.wheels;
      activeGetTerrainHeight = marsTerrain.getTerrainHeight;
      scene.background = new THREE.Color(0xc87142);

      document.getElementById('lbl-tau-card').innerText = currentLanguage === 'bn' ? 'বায়ুমণ্ডলীয় অপাসিটি (TAU)' : 'ATMOSPHERIC OPACITY (TAU)';
      document.getElementById('hud-tau').innerText = currentTau.toFixed(1);
      document.getElementById('hud-site-name').innerText = 'Perseverance Valley, Endeavour Rim';
      document.getElementById('hud-coords-line').innerText = 'LAT: 14.5714° S | LON: 354.6734° E';
      document.getElementById('top-badge-text').innerText = currentLanguage === 'bn' ? 'নাসা স্পেস অ্যাপস • মঙ্গল অভিযাত্রা' : 'NASA SPACE APPS • MARS EXPEDITION';
    }

    scene.add(activeTerrainGroup);
    scene.add(activeAtmosphere.group);
    activeRoverGroup.position.set(roverController.position.x, activeGetTerrainHeight(roverController.position.x, roverController.position.z), roverController.position.z);
    scene.add(activeRoverGroup);

    scanner.setPlanet(planet);
    scanner.registerRoverSubsystems(activeRoverGroup);
    scanner.registerInteractiveTerrain(activeTerrainGroup);
    roverController.setPlanet(planet, activeGetTerrainHeight, activeRoverGroup, activeWheels);
    questManager.setPlanet(planet);

    // Update active world pill
    const worldPill = document.getElementById('active-world-pill');
    if (worldPill) {
      worldPill.innerText = planet === 'moon'
        ? (currentLanguage === 'bn' ? '🌕 চাঁদ: শান্তির সাগর' : '🌕 Moon: Tranquility Base')
        : (currentLanguage === 'bn' ? '🔴 মঙ্গল: পারসিভেরেন্স ভ্যালি' : '🔴 Mars: Perseverance Valley');
    }

    updateWaypointHUD();
  }

  // Function to switch Rover Vehicle Model
  function switchRoverVehicle(vehicle) {
    currentVehicle = vehicle;
    scene.remove(activeRoverGroup);

    if (vehicle === 'lunar_rover') {
      activeRoverGroup = moonRover.rover;
      activeWheels = moonRover.wheels;
    } else {
      activeRoverGroup = marsRover.rover;
      activeWheels = marsRover.wheels;
    }

    activeRoverGroup.position.set(roverController.position.x, activeGetTerrainHeight(roverController.position.x, roverController.position.z), roverController.position.z);
    scene.add(activeRoverGroup);

    scanner.registerRoverSubsystems(activeRoverGroup);
    roverController.setPlanet(currentPlanet, activeGetTerrainHeight, activeRoverGroup, activeWheels);

    const vehicleSelect = document.getElementById('select-rover-vehicle');
    if (vehicleSelect) vehicleSelect.value = vehicle;
  }

  // Telemetry & GPS Waypoint Tracker
  const odometerElem = document.querySelector('.odometer-badge');
  const coordsElem = document.getElementById('hud-coords-line');
  const siteNameElem = document.getElementById('hud-site-name');
  const radarHud = document.getElementById('rover-radar-hud');
  const radarTitle = document.getElementById('radar-title');
  const radarSub = document.getElementById('radar-sub');
  const radarScanBtn = document.getElementById('radar-scan-btn');
  const waypointHud = document.getElementById('waypoint-tracker-hud');

  let activeRadarArtifact = null;

  function getActiveMission() {
    const list = questManager.activeMissionsList;
    const selected = list.find(m => m.id === questManager.selectedMissionId);
    if (selected) return selected;
    const firstUncompleted = list.find(m => !questManager.completedMissions.has(m.id));
    return firstUncompleted || list[0];
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

    const totalMissions = questManager.activeMissionsList.length;
    const completedCount = questManager.activeMissionsList.filter(m => questManager.completedMissions.has(m.id)).length;

    if (completedCount === totalMissions) {
      if (iconElem) iconElem.innerText = '🏆';
      if (badgeElem) badgeElem.innerText = isBn ? 'সব মিশন সম্পন্ন!' : 'ALL MISSIONS COMPLETED!';
      if (nameElem) nameElem.innerText = isBn ? 'গ্র্যান্ড মাস্টার সার্টিফিকেট আনলক!' : 'Grand Master Certificate Unlocked!';
      if (subElem) subElem.innerText = isBn ? 'সার্টিফিকেট দেখতে ক্লিক করো ➔' : 'Click to View Your Master Certificate ➔';
      if (distValElem) distValElem.innerText = '100%';
      return;
    }

    if (activeMission) {
      scanner.setActiveWaypoint(activeMission.id);
      const isCompleted = questManager.completedMissions.has(activeMission.id);
      if (iconElem) iconElem.innerText = activeMission.badge || '🚀';
      if (badgeElem) badgeElem.innerText = `${isBn ? 'মিশন' : 'MISSION'} ${activeMission.level} / ${totalMissions} ${isCompleted ? '✓' : ''}`;
      if (nameElem) nameElem.innerText = isBn ? activeMission.title_bn : activeMission.title_en;
      if (subElem) {
        subElem.innerText = isBn
          ? `নিশান: ${activeMission.shortTitle_bn} • গাড়ি চালিয়ে উজ্জ্বল নিশানের কাছে যাও`
          : `Drive vehicle toward the glowing beacon light pillar`;
      }

      if (distValElem) {
        const targetX = artifact ? artifact.coords.x : (activeMission.level * 4);
        const targetZ = artifact ? artifact.coords.z : (activeMission.level * 3);
        const dx = roverController.position.x - targetX;
        const dz = roverController.position.z - targetZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        distValElem.innerText = `${dist.toFixed(1)}m`;
      }
    }
  }

  // Update Transparent Radar Mini-Map
  function updateMinimap(stats) {
    const blip = document.getElementById('rover-minimap-blip');
    const coordsText = document.getElementById('minimap-coords-text');
    const waypointBlip = document.getElementById('waypoint-minimap-blip');

    if (blip) {
      // Map scale: 50m radius to percentage (50% is center)
      const radarSizeMeters = 60;
      const pctX = 50 + (stats.x / radarSizeMeters) * 45;
      const pctZ = 50 + (stats.z / radarSizeMeters) * 45;
      blip.style.left = `${Math.max(5, Math.min(95, pctX))}%`;
      blip.style.top = `${Math.max(5, Math.min(95, pctZ))}%`;

      const arrow = blip.querySelector('.rover-heading-arrow');
      if (arrow) {
        arrow.style.transform = `translate(-50%, -50%) rotate(${stats.headingDeg}deg)`;
      }
    }

    if (coordsText) {
      coordsText.innerText = `X: ${stats.x.toFixed(1)}m | Z: ${stats.z.toFixed(1)}m | ${stats.compassDir}`;
    }

    if (waypointBlip) {
      const activeMission = getActiveMission();
      const artifact = getActiveMissionArtifact(activeMission?.id);
      const targetX = artifact ? artifact.coords.x : 10;
      const targetZ = artifact ? artifact.coords.z : 10;

      const wpPctX = 50 + (targetX / 60) * 45;
      const wpPctZ = 50 + (targetZ / 60) * 45;
      waypointBlip.style.left = `${Math.max(5, Math.min(95, wpPctX))}%`;
      waypointBlip.style.top = `${Math.max(5, Math.min(95, wpPctZ))}%`;
    }
  }

  roverController.onTelemetryUpdate = (stats) => {
    if (coordsElem) {
      coordsElem.innerText = `LAT: ${stats.lat}° | LON: ${stats.lon}° | ${stats.compassDir} (${stats.speedKmH} km/h)`;
    }
    if (odometerElem) {
      const extraKm = (stats.distanceMeters / 1000).toFixed(2);
      const baseKm = currentPlanet === 'moon' ? 27.8 : 45.16;
      const totalKm = (baseKm + parseFloat(extraKm)).toFixed(2);
      odometerElem.innerText = `ODOMETER: ${totalKm} KM (+${stats.distanceMeters.toFixed(0)} M)`;
    }
    if (siteNameElem && stats.speedKmH > 0.1) {
      siteNameElem.innerText = currentPlanet === 'moon'
        ? `Mare Tranquillitatis (Driving: ${stats.slopeDeg}° Slope)`
        : `Perseverance Valley (Driving: ${stats.slopeDeg}° Slope)`;
    }

    updateMinimap(stats);

    // Driving on Moon quest hook (Moon Mission 4: The 1/6th Gravity Buggy Run)
    if (currentPlanet === 'moon' && stats.distanceMeters >= 20) {
      questManager.markMissionCompleted('moon_quest_lrv_buggy');
    }

    // Live distance calculation to active GPS waypoint
    const activeMission = getActiveMission();
    const artifact = getActiveMissionArtifact(activeMission?.id);
    if (artifact && !questManager.completedMissions.has(activeMission.id)) {
      const dx = roverController.position.x - artifact.coords.x;
      const dz = roverController.position.z - artifact.coords.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const distValElem = document.getElementById('waypoint-dist-val');
      if (distValElem) distValElem.innerText = `${dist.toFixed(1)}m`;

      if (dist <= 4.0) {
        activeRadarArtifact = artifact;
        if (radarHud) radarHud.style.display = 'flex';
        if (radarTitle) radarTitle.innerText = `📍 TARGET: ${artifact.title}`;
        if (radarSub) {
          radarSub.innerText = currentLanguage === 'bn'
            ? `লক্ষ্যে পৌঁছেছ! (${dist.toFixed(1)}m) • স্ক্যান করতে [E] চাপুন`
            : `Objective reached! (${dist.toFixed(1)}m) • Press [E] or Click to Scan`;
        }
      }
    }
  };

  roverController.onProximityAlert = (artifact, dist) => {
    if (dist <= 4.2 && artifact) {
      activeRadarArtifact = artifact;
      if (radarHud) radarHud.style.display = 'flex';
      if (radarTitle) radarTitle.innerText = `📍 ${artifact.title}`;
      if (radarSub) {
        radarSub.innerText = `${artifact.title} (${dist.toFixed(1)}m) • ${currentLanguage === 'bn' ? '[E] চাপুন বা স্ক্যান করুন' : 'Press [E] or Click to Scan'}`;
      }
    } else if (!activeRadarArtifact || dist > 4.8) {
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

  // Clicking Waypoint Tracker HUD opens Roadmap
  if (waypointHud) {
    waypointHud.addEventListener('click', () => {
      questManager.renderMissionsList();
      document.getElementById('missions-modal-backdrop')?.classList.add('active');
    });
  }

  updateWaypointHUD();

  // 7. State & Mode Manager
  let currentMode = 'archaeologist'; // 'archaeologist', 'sol5111', 'drive', 'pitch'
  let currentTau = 1.2;

  function updateAtmosphericOptics(tau) {
    currentTau = tau;
    if (currentPlanet === 'mars') {
      const opticalResult = marsAtmosphere.setAtmosphericTau(tau);
      marsRover.setDustAccumulation(tau);
      martianAudio.updateAtmosphereWind(tau);

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
        hudExtinction.innerText = `${opticalResult.extinctionPercent.toFixed(2)}% ${currentLanguage === 'bn' ? 'সূর্যালোক বিলীন' : 'Sunlight Extinguished'}`;
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

      if (tau >= 10.0) {
        questManager.markMissionCompleted('mission_storm');
      }

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
  }

  // 8. Sol 5111 Timeline Simulation Manager
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

  // 9. 120-Second Pitch Showcase Director
  const pitchDirector = new PitchShowcaseDirector(
    camera,
    { enabled: true },
    marsAtmosphere,
    activeRoverGroup,
    (tau) => updateAtmosphericOptics(tau),
    (pitchState) => {
      const overlay = document.getElementById('pitch-overlay');
      const actTag = document.getElementById('pitch-act-tag');
      const actTitle = document.getElementById('pitch-act-title');
      const timer = document.getElementById('pitch-timer');
      const narration = document.getElementById('pitch-narration-text');
      const bar = document.getElementById('pitch-progress-bar');
      const planetBadge = document.getElementById('pitch-planet-badge');

      if (overlay) overlay.style.display = 'block';
      if (planetBadge) {
        planetBadge.innerText = pitchState.planet === 'moon' ? '🌕 MOON SHOWCASE' : '🔴 MARS SHOWCASE';
      }
      if (actTag) actTag.innerText = `ACT ${pitchState.act.start < 21 ? 'I' : pitchState.act.start < 56 ? 'II' : pitchState.act.start < 89 ? 'III' : 'IV'}`;
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
  updateAtmosphericOptics(1.2);

  // Scanner Callback & Quest Progression Hooks
  scanner.onScanCallback = ({ type, data }) => {
    const scanId = data.id || '';

    // Mars Mission Progressions
    if (scanId === 'oppy_rover' || scanId === 'pancam' || scanId === 'mini_tes' || scanId === 'solar_array') {
      questManager.markMissionCompleted('mission_locate');
    } else if (scanId === 'hematite_blueberries') {
      questManager.markMissionCompleted('mission_blueberries');
    } else if (scanId === 'rat' || scanId === 'rat_grind_spot') {
      questManager.markMissionCompleted('mission_rat');
    } else if (scanId === 'mossbauer') {
      questManager.markMissionCompleted('mission_mossbauer');
    } else if (scanId === 'storm_station') {
      questManager.markMissionCompleted('mission_storm');
    } else if (scanId === 'blackbox_core') {
      questManager.markMissionCompleted('mission_blackbox');
    }

    // Moon Mission Progressions
    if (scanId === 'surveyor1' || scanId === 'artifact_surveyor1') {
      questManager.markMissionCompleted('moon_quest_pioneer');
    } else if (scanId === 'apollo_lm' || scanId === 'artifact_apollo_lm') {
      questManager.markMissionCompleted('moon_quest_apollo11');
    } else if (scanId === 'surveyor3' || scanId === 'artifact_surveyor3') {
      questManager.markMissionCompleted('moon_quest_surveyor3_retrieval');
    } else if (scanId === 'lrv_station' || scanId === 'lrv_camera' || scanId === 'lrv_antenna' || scanId === 'lrv_controller') {
      questManager.markMissionCompleted('moon_quest_lrv_buggy');
    } else if (scanId === 'lcross_ice' || scanId === 'artifact_lcross_ice') {
      questManager.markMissionCompleted('moon_quest_lcross_ice');
    } else if (scanId === 'artemis_beacon' || scanId === 'artifact_artemis_beacon') {
      questManager.markMissionCompleted('moon_quest_artemis_base');
    }

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
      ? (currentLanguage === 'bn' ? 'ঐতিহাসিক মহাকাশ স্মৃতিচিহ্ন' : 'HISTORIC SPACE ARTIFACT')
      : (currentLanguage === 'bn' ? 'সাবসিস্টেম ডায়াগনস্টিক স্ক্যান' : 'SUBSYSTEM DIAGNOSTIC SCAN');
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

  // Language Switcher Toggle
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      currentLanguage = currentLanguage === 'en' ? 'bn' : 'en';
      questManager.setLanguage(currentLanguage);
      newsManager.setLanguage(currentLanguage);
      calendarManager.setLanguage(currentLanguage);
      quizManager.setLanguage(currentLanguage);

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
    document.getElementById('top-project-title').innerText = isBn ? 'রিলিক্স অব দ্য কসমিক ডাস্ট' : 'RELICS OF THE COSMIC DUST';
    document.getElementById('top-project-sub').innerText = isBn ? 'নাসা চাঁদ ও মঙ্গল ঐতিহাসিক মিশন এক্সপ্লোরার' : 'EXPLORING HISTORIC NASA MISSIONS ACROSS MOON & MARS';
    document.getElementById('lbl-tab-archaeologist').innerText = isBn ? '৩D স্ক্যানার' : '3D Scanner';
    document.getElementById('lbl-tab-sol5111').innerText = isBn ? 'সল ৫১১১ ঝড়' : 'Sol 5111 Storm';
    document.getElementById('lbl-tab-drive').innerText = isBn ? 'গাড়ি ড্রাইভ' : 'Drive Vehicle';
    document.getElementById('lbl-tab-missions').innerHTML = `${isBn ? 'রোডম্যাপ' : 'Roadmap'} (<span id="top-badge-count">${questManager.completedMissions.size}/6</span>)`;
    document.getElementById('lbl-tab-pitch').innerText = isBn ? '১২০ সে. পিচ' : '120s Pitch';
    document.getElementById('lbl-quiz-btn').innerText = isBn ? 'কুইজ ও র‍্যাংক' : 'Quiz & Ranks';
    document.getElementById('lbl-pds-header').innerText = isBn ? 'নাসা লাইভ টেলিমেট্রি' : 'NASA LIVE TELEMETRY';
    document.getElementById('lbl-scanner-header').innerText = isBn ? 'আর্কিওলজিস্ট স্ক্যানার' : 'ARCHAEOLOGIST SCANNER';

    // Game Hub Bilingual Strings
    const heroTitle = document.getElementById('lbl-hero-title');
    const heroSub = document.getElementById('lbl-hero-sub');
    const heroMarsBtn = document.getElementById('lbl-hero-mars-btn');
    const heroMoonBtn = document.getElementById('lbl-hero-moon-btn');

    if (heroTitle) heroTitle.innerText = isBn ? 'রিলিক্স অব দ্য কসমিক ডাস্ট' : 'RELICS OF THE COSMIC DUST';
    if (heroSub) heroSub.innerText = isBn ? 'চাঁদ ও মঙ্গলের ঐতিহাসিক রোভার, ল্যান্ডার ও মিশন আবিষ্কার করো' : 'EXPLORE HISTORIC ROVERS, LANDERS & MISSIONS ON MOON & MARS';
    if (heroMarsBtn) heroMarsBtn.innerText = isBn ? 'মঙ্গল সিমুলেশনে প্রবেশ' : 'ENTER MARS SIMULATION';
    if (heroMoonBtn) heroMoonBtn.innerText = isBn ? 'চাঁদ মিশন শুরু করুন' : 'EXPLORE MOON MISSIONS';

    const hnavHome = document.getElementById('lbl-hnav-home');
    const hnavRoad = document.getElementById('lbl-hnav-road');
    const hnavArch = document.getElementById('lbl-hnav-arch');
    const hnavDrive = document.getElementById('lbl-hnav-drive');
    const hnavNews = document.getElementById('lbl-hnav-news');
    const hnavCal = document.getElementById('lbl-hnav-cal');
    const hnavPitch = document.getElementById('lbl-hnav-pitch');
    const hnavQuiz = document.getElementById('lbl-hnav-quiz');

    if (hnavHome) hnavHome.innerText = isBn ? 'হোম' : 'HOME';
    if (hnavRoad) hnavRoad.innerText = isBn ? 'রোডম্যাপ' : 'ROADMAP';
    if (hnavArch) hnavArch.innerText = isBn ? '৩D সিম' : '3D SIMULATOR';
    if (hnavDrive) hnavDrive.innerText = isBn ? 'ড্রাইভ' : 'DRIVE ROVER';
    if (hnavNews) hnavNews.innerText = isBn ? 'মিশন নিউজ' : 'NEWS ARCHIVE';
    if (hnavCal) hnavCal.innerText = isBn ? 'দিনপঞ্জি' : 'CALENDAR';
    if (hnavPitch) hnavPitch.innerText = isBn ? 'পিচ' : '120s PITCH';
    if (hnavQuiz) hnavQuiz.innerText = isBn ? 'কুইজ ও র‍্যাংক' : 'QUIZ & RANKS';

    const worldPill = document.getElementById('active-world-pill');
    if (worldPill) {
      worldPill.innerText = currentPlanet === 'moon'
        ? (isBn ? '🌕 চাঁদ: শান্তির সাগর' : '🌕 Moon: Tranquility Base')
        : (isBn ? '🔴 মঙ্গল: পারসিভেরেন্স ভ্যালি' : '🔴 Mars: Perseverance Valley');
    }
  }

  // Fullscreen HUD Panels Toggle
  let hudPanelsVisible = true;
  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
    hudPanelsVisible = !hudPanelsVisible;
    const leftPanel = document.getElementById('telemetry-panel');
    const rightPanel = document.getElementById('scanner-panel');
    const icon = document.getElementById('sidebar-toggle-icon');
    const btnLabel = document.getElementById('lbl-sidebar-btn');

    if (leftPanel) leftPanel.style.display = hudPanelsVisible ? 'flex' : 'none';
    if (rightPanel && currentMode === 'archaeologist') rightPanel.style.display = hudPanelsVisible ? 'flex' : 'none';
    if (icon) icon.innerText = hudPanelsVisible ? '🔲' : '🔳';
    if (btnLabel) btnLabel.innerText = hudPanelsVisible ? 'Panels: ON' : 'Fullscreen';
  });

  // Dropdown Listeners
  document.getElementById('select-celestial-body')?.addEventListener('change', (e) => {
    switchCelestialBody(e.target.value);
  });

  document.getElementById('select-rover-vehicle')?.addEventListener('change', (e) => {
    switchRoverVehicle(e.target.value);
  });

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
    }

    if (mode === 'archaeologist') {
      if (scannerPanel && hudPanelsVisible) scannerPanel.style.display = 'flex';
      if (solSlider) solSlider.style.display = 'flex';
      if (driveControls) driveControls.style.display = 'none';
      setCameraMode('orbit');
      updateAtmosphericOptics(1.2);
    } else if (mode === 'sol5111') {
      switchCelestialBody('mars');
      if (scannerPanel) scannerPanel.style.display = 'none';
      if (solSlider) solSlider.style.display = 'flex';
      if (driveControls) driveControls.style.display = 'none';
      setCameraMode('orbit');
      solTimelineManager.setSolByIndex(HISTORICAL_SOL_LOGS.length - 1);
    } else if (mode === 'drive') {
      if (scannerPanel) scannerPanel.style.display = 'none';
      if (solSlider) solSlider.style.display = 'none';
      if (driveControls) driveControls.style.display = 'flex';
      setCameraMode('orbit');
      setTarget(roverController.position.x, roverController.position.y + 0.6, roverController.position.z);
    } else if (mode === 'pitch') {
      if (scannerPanel) scannerPanel.style.display = 'none';
      if (solSlider) solSlider.style.display = 'none';
      if (driveControls) driveControls.style.display = 'none';
      pitchDirector.start(currentPlanet);
    }
  }

  // Pitch Switcher Buttons
  document.getElementById('btn-pitch-mars')?.addEventListener('click', () => {
    document.getElementById('btn-pitch-mars')?.classList.add('active');
    document.getElementById('btn-pitch-moon')?.classList.remove('active');
    switchCelestialBody('mars');
    pitchDirector.start('mars');
  });

  document.getElementById('btn-pitch-moon')?.addEventListener('click', () => {
    document.getElementById('btn-pitch-moon')?.classList.add('active');
    document.getElementById('btn-pitch-mars')?.classList.remove('active');
    switchCelestialBody('moon');
    pitchDirector.start('moon');
  });

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

  document.getElementById('tab-home-hub')?.addEventListener('click', () => openGameHub());

  // Hub Launch Actions
  document.getElementById('hub-hero-mars-btn')?.addEventListener('click', () => {
    closeGameHub();
    switchCelestialBody('mars');
    switchRoverVehicle('opportunity');
    setMode('archaeologist');
  });

  document.getElementById('hub-hero-moon-btn')?.addEventListener('click', () => {
    closeGameHub();
    switchCelestialBody('moon');
    switchRoverVehicle('lunar_rover');
    setMode('archaeologist');
  });

  // Hub Game Cards Handlers
  document.getElementById('hub-card-archaeology')?.addEventListener('click', () => {
    closeGameHub();
    switchCelestialBody('mars');
    setMode('archaeologist');
  });

  document.getElementById('hub-card-moon-arch')?.addEventListener('click', () => {
    closeGameHub();
    switchCelestialBody('moon');
    switchRoverVehicle('lunar_rover');
    setMode('archaeologist');
  });

  document.getElementById('hub-card-storm')?.addEventListener('click', () => {
    closeGameHub();
    switchCelestialBody('mars');
    setMode('sol5111');
  });

  document.getElementById('hub-card-roadmap')?.addEventListener('click', () => {
    questManager.renderMissionsList();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });

  document.getElementById('hub-card-drive-mode')?.addEventListener('click', () => {
    closeGameHub();
    setMode('drive');
  });

  // Hub Quick Left Action Buttons
  document.getElementById('hub-daily-log-btn')?.addEventListener('click', () => {
    calendarManager.render();
    document.getElementById('calendar-modal-backdrop')?.classList.add('active');
  });

  document.getElementById('hub-news-btn')?.addEventListener('click', () => {
    newsManager.render();
    document.getElementById('news-modal-backdrop')?.classList.add('active');
  });

  document.getElementById('hub-quiz-btn')?.addEventListener('click', () => {
    quizManager.render();
    document.getElementById('quiz-modal-backdrop')?.classList.add('active');
  });

  document.getElementById('hub-badges-btn')?.addEventListener('click', () => {
    questManager.renderBadgesShowcase();
    document.getElementById('badges-modal-backdrop')?.classList.add('active');
  });

  document.getElementById('hub-profile-click')?.addEventListener('click', () => {
    questManager.renderBadgesShowcase();
    document.getElementById('badges-modal-backdrop')?.classList.add('active');
  });

  // Hub Bottom Navigation Tabs
  document.getElementById('hub-tab-home')?.addEventListener('click', () => openGameHub());

  document.getElementById('hub-tab-roadmap')?.addEventListener('click', () => {
    questManager.renderMissionsList();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });

  document.getElementById('hub-tab-archaeology')?.addEventListener('click', () => {
    closeGameHub();
    setMode('archaeologist');
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
    quizManager.render();
    document.getElementById('quiz-modal-backdrop')?.classList.add('active');
  });

  // Hook up Roadmap Direct Action Callback
  questManager.onMissionActionCallback = (missionId) => {
    closeGameHub();
    document.getElementById('missions-modal-backdrop')?.classList.remove('active');

    // Check if it's a moon mission or mars mission
    const isMoonMission = KIDS_MISSIONS_MOON.some(m => m.id === missionId);
    if (isMoonMission) {
      switchCelestialBody('moon');
      switchRoverVehicle('lunar_rover');
    } else {
      switchCelestialBody('mars');
      switchRoverVehicle('opportunity');
    }

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
          : `Drive vehicle toward the glowing waypoint beacon for ${artifact.title}!`,
        true
      );
    }
  };

  questManager.onPlanetChangeCallback = (planet) => {
    switchCelestialBody(planet);
    switchRoverVehicle(planet === 'moon' ? 'lunar_rover' : 'opportunity');
  };

  // Navigation Click Handlers
  document.querySelectorAll('.nav-tab[data-mode]').forEach(tab => {
    tab.addEventListener('click', () => {
      setMode(tab.dataset.mode);
    });
  });

  // Modals Open/Close
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

  document.getElementById('open-quiz-btn')?.addEventListener('click', () => {
    quizManager.render();
    document.getElementById('quiz-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('quiz-close-btn')?.addEventListener('click', () => {
    document.getElementById('quiz-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('news-close-btn')?.addEventListener('click', () => {
    document.getElementById('news-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('news-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('news-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('calendar-close-btn')?.addEventListener('click', () => {
    document.getElementById('calendar-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('calendar-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('calendar-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('badges-close-btn')?.addEventListener('click', () => {
    document.getElementById('badges-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('badges-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('badges-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('disc-close-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('disc-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('cert-close-btn')?.addEventListener('click', () => {
    document.getElementById('certificate-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('cert-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('certificate-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('modal-close-btn')?.addEventListener('click', () => {
    document.getElementById('scan-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('modal-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('scan-modal-backdrop')?.classList.remove('active');
  });

  // Close modals on clicking backdrop outside modal card
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });

  document.getElementById('next-fact-btn')?.addEventListener('click', () => {
    questManager.nextFunFact();
  });

  document.getElementById('bot-avatar-btn')?.addEventListener('click', () => {
    const bubble = document.getElementById('bot-speech-bubble');
    if (bubble) bubble.classList.toggle('visible');
    martianAudio.playScannerBeep(false);
  });
  document.getElementById('bot-bubble-close')?.addEventListener('click', () => {
    document.getElementById('bot-speech-bubble')?.classList.remove('visible');
  });

  // Camera Buttons with FPP PUBG-style Eye Look
  document.getElementById('cam-orbit')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.target);
    setCameraMode('orbit');
    setTarget(roverController.position.x, roverController.position.y + 0.6, roverController.position.z);
    camera.position.set(roverController.position.x, roverController.position.y + 2.2, roverController.position.z + 5.5);
  });

  document.getElementById('cam-pancam')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.target);
    setCameraMode('pancam_fpp');
    fpp.eyePos.set(roverController.position.x, roverController.position.y + 1.4, roverController.position.z);
    fpp.yaw = roverController.heading;
    fpp.pitch = 0;
    sceneManager.updateCameraPosition();
  });

  document.getElementById('cam-top')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.target);
    setCameraMode('top');
    camera.position.set(roverController.position.x, roverController.position.y + 18, roverController.position.z);
    camera.lookAt(roverController.position.x, roverController.position.y, roverController.position.z);
  });

  document.getElementById('cam-surface')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.target);
    setCameraMode('surface');
    camera.position.set(roverController.position.x - 2.5, roverController.position.y + 0.5, roverController.position.z + 3.2);
    setTarget(roverController.position.x, roverController.position.y + 0.5, roverController.position.z);
  });

  function setActiveCamBtn(target) {
    document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
  }

  // Sol Timeline & Tau Sliders
  const solRangeInput = document.getElementById('sol-range-input');
  if (solRangeInput) {
    solRangeInput.addEventListener('input', (e) => {
      solTimelineManager.setSolByIndex(parseInt(e.target.value, 10));
    });
  }

  document.getElementById('play-sol-timeline')?.addEventListener('click', () => {
    if (solTimelineManager.isPlayingTimeline) {
      solTimelineManager.stopTimeline();
      document.getElementById('play-sol-timeline').innerText = currentLanguage === 'bn' ? '▶ ঝড় চালান' : '▶ Play Storm';
    } else {
      solTimelineManager.playTimeline();
      document.getElementById('play-sol-timeline').innerText = currentLanguage === 'bn' ? '⏸ বিরতি' : '⏸ Pause';
    }
  });

  const tauRangeInput = document.getElementById('tau-range-input');
  if (tauRangeInput) {
    tauRangeInput.addEventListener('input', (e) => {
      updateAtmosphericOptics(parseFloat(e.target.value));
    });
  }

  document.getElementById('reset-rover-pos')?.addEventListener('click', () => {
    roverController.position.set(0, 0, 0);
    roverController.heading = 0;
    roverController.velocity = 0;
    activeRoverGroup.position.set(0, activeGetTerrainHeight(0, 0), 0);
    activeRoverGroup.rotation.set(0, 0, 0);
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

      const hubAudioIcon = document.getElementById('hub-audio-icon');
      const hubAudioText = document.getElementById('hub-audio-text');
      if (hubAudioIcon) hubAudioIcon.innerText = isUnmuted ? '🔊' : '🔇';
      if (hubAudioText) hubAudioText.innerText = audioLabel;
    });
  }

  document.getElementById('hub-lang-toggle')?.addEventListener('click', () => {
    document.getElementById('lang-toggle-btn')?.click();
  });
  document.getElementById('hub-audio-toggle')?.addEventListener('click', () => {
    document.getElementById('audio-toggle-btn')?.click();
  });

  // Subsystem Quick Click
  document.querySelectorAll('.subsystem-item').forEach(item => {
    item.addEventListener('click', () => {
      const scanId = item.dataset.scan;
      const payload = SCIENTIFIC_PAYLOADS.find(p => p.id === scanId) ||
        ARCHAEOLOGICAL_ARTIFACTS.find(a => a.id === scanId);
      if (payload && scanner.onScanCallback) {
        scanner.onScanCallback({ type: 'payload', data: payload, point: activeRoverGroup.position });
      }
    });
  });

  // Drive Touch D-Pad
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

  // 10. Main Animation Render Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (activeAtmosphere) {
      activeAtmosphere.update(delta, currentTau);
    }
    scanner.update(elapsedTime);

    if (currentMode === 'drive' || currentMode === 'archaeologist') {
      roverController.update(delta);
    }

    if (currentMode === 'pitch') {
      pitchDirector.update(delta);
    }

    // Keep FPP eye positioned with moving rover
    if (sceneManager.isOrbitEnabled === false && document.getElementById('cam-pancam')?.classList.contains('active')) {
      fpp.eyePos.set(roverController.position.x, roverController.position.y + 1.4, roverController.position.z);
      sceneManager.updateCameraPosition();
    }

    renderer.render(scene, camera);
  }

  animate();
  console.log("🌟 NASA Moon & Mars Missions Explorer WebGL Engine Ready.");
});
