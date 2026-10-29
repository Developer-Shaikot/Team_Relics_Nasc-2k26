import * as THREE from 'three';
import { setupScene } from './renderer/scene.js';
import { createMartianTerrain } from './renderer/terrain.js';
import { createOpportunityRover } from './renderer/rover.js';
import { createMartianAtmosphere } from './renderer/atmosphere.js';
import { createLunarTerrain } from './renderer/moonTerrain.js';
import { createLunarRover } from './renderer/lunarRover.js';
import { createLunarAtmosphere } from './renderer/moonAtmosphere.js';
import { createDeepSpaceVoyager } from './renderer/deepSpaceVoyager.js';
import { PlanetaryScanner } from './systems/scanner.js';
import { RoverController } from './systems/roverControls.js';
import { Sol5111TimelineManager } from './systems/sol5111.js';
import { PitchShowcaseDirector } from './systems/pitchMode.js';
import { martianAudio } from './systems/audio.js';
import { MissionQuestManager } from './systems/quests.js';
import { CoinsManager } from './systems/coinsManager.js';
import { GuideBotEscort } from './systems/guideBotEscort.js';
import { SpaceshipHabManager } from './systems/spaceshipHab.js';
import { AstronautCommander } from './systems/astronautCommander.js';
import { MissionNewsCarouselManager } from './systems/missionNewsCarousel.js';
import { SpaceCalendarManager } from './systems/spaceCalendar.js';
import { QuizLeaderboardManager } from './systems/quizLeaderboard.js';
import { ActorAnimationDirector } from './systems/actorAnimations.js';
import { ScienceMiniGameManager } from './systems/minigames.js';
import {
  HISTORICAL_SOL_LOGS,
  SCIENTIFIC_PAYLOADS,
  ARCHAEOLOGICAL_ARTIFACTS as ALL_ARCHAEOLOGICAL_ARTIFACTS
} from './data/telemetryData.js';
import { KIDS_MISSIONS_MARS, KIDS_MISSIONS_MOON } from './data/kidsContent.js';

// Initialize WebGL Application
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('webgl-container');
  if (!container) return;

  // 1. Setup Three.js Scene, Camera & WebGL Renderer
  const sceneManager = setupScene(container);
  const { scene, camera, renderer, setTarget, setCameraMode, fpp } = sceneManager;

  // 2. Active Planetary Environments & 3D Models
  let currentPlanet = 'mars'; // 'mars', 'moon', or 'deepspace'
  let currentVehicle = 'opportunity'; // 'opportunity', 'lunar_rover', or 'voyager'

  // Mars Assets (includes Opportunity & InSight Lander Actor)
  const marsTerrain = createMartianTerrain();
  const marsRover = createOpportunityRover();
  const marsAtmosphere = createMartianAtmosphere(scene);

  // Moon Assets (includes Apollo 11 Two-Stage LM Actor & Surveyor 3)
  const moonTerrain = createLunarTerrain();
  const moonRover = createLunarRover();
  const moonAtmosphere = createLunarAtmosphere(scene);

  // Deep Space Assets (Voyager 1 Actor at 24.3 Billion km)
  const deepSpaceVoyager = createDeepSpaceVoyager();

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
  const roverController = new RoverController(
    activeRoverGroup,
    activeWheels,
    activeGetTerrainHeight,
    camera,
    sceneManager
  );

  // Setup Collectible Cosmic Coins on Terrain & Flying Guide Robot Escort
  const coinsManager = new CoinsManager(scene);
  const guideBotEscort = new GuideBotEscort(scene);
  const astronautCommander = new AstronautCommander(scene);

  // 5. Setup Mission Quest Manager (100% English)
  const currentLanguage = 'en';
  const questManager = new MissionQuestManager(() => {});
  questManager.setLanguage(currentLanguage);

  // 6. Setup Actor Animation Director (Asha & Leo + 3D Hardware Actors) & 4 JPL Science Labs
  const actorDirector = new ActorAnimationDirector();
  actorDirector.register3DActors({
    marsRover,
    moonRover,
    apolloLM: moonTerrain.lmActor,
    insightLander: marsTerrain.insightActor,
    voyager: deepSpaceVoyager
  });
  actorDirector.initCommsAvatars();
  actorDirector.initPrologueActors();

  const miniGameManager = new ScienceMiniGameManager(questManager, actorDirector);

  // 7. Setup Auxiliary Systems: News, Calendar, Quiz & Leaderboard
  const newsManager = new MissionNewsCarouselManager();
  const calendarManager = new SpaceCalendarManager();
  const quizManager = new QuizLeaderboardManager(questManager);

  newsManager.setLanguage(currentLanguage);
  calendarManager.setLanguage(currentLanguage);
  quizManager.setLanguage(currentLanguage);

  // Sync initial XP display
  questManager.updateXPDisplays();

  // Dynamic Right Panel Subsystem List per Celestial Body
  function renderSubsystemQuickList(planet) {
    const listContainer = document.getElementById('subsystem-quick-list');
    if (!listContainer) return;

    let items = [];
    if (planet === 'moon') {
      items = [
        { id: 'apollo_lm', label: 'Apollo 11 Eagle Descent Stage (Δv Lab)', highlight: true },
        { id: 'surveyor3', label: 'Surveyor 3 (Apollo 12 Retrieval)' },
        { id: 'lrv_camera', label: 'LRV Color TV Camera & Umbrella Dish' },
        { id: 'surveyor1', label: 'Surveyor 1 (First Lunar Soft Lander)' },
        { id: 'lcross_ice', label: 'LCROSS South Pole Water Ice Crater' },
        { id: 'artemis_beacon', label: 'Artemis III Lunar Gateway Beacon', highlight: true }
      ];
    } else if (planet === 'deepspace') {
      items = [
        { id: 'golden_record', label: '12-Inch Golden Record (55 Languages)', highlight: true },
        { id: 'voyager_rtg', label: 'Pu-238 RTG Nuclear Battery (-4W/yr)' },
        { id: 'voyager_hga', label: '3.7m High-Gain Dish (22h 34m Delay)' },
        { id: 'voyager_iss', label: 'ISS Camera ("Pale Blue Dot" Portrait)' },
        { id: 'voyager_mag', label: '13m Heliopause Magnetometer Boom' }
      ];
    } else {
      items = [
        { id: 'hematite_blueberries', label: 'Hematite Blueberries (APXS Lab)', highlight: true },
        { id: 'insight_lander', label: 'InSight SEIS Seismometer (Marsquake Lab)', highlight: true },
        { id: 'pancam', label: 'Pancam (Multispectral Stereo Camera)' },
        { id: 'rat', label: 'RAT (Diamond Rock Abrasion Grinder)' },
        { id: 'solar_array', label: 'Solar Array & Sol 5111 Dust Coating' },
        { id: 'blackbox_core', label: 'MER-B Blackbox Telemetry Core', highlight: true }
      ];
    }

    listContainer.innerHTML = items
      .map(
        (item) => `
        <div class="subsystem-item ${item.highlight ? 'highlight-cyan' : ''}" data-scan="${item.id}">
          <span class="sub-dot ${item.highlight ? 'cyan' : ''}"></span>
          <span class="sub-name">${item.label}</span>
        </div>
      `
      )
      .join('');

    listContainer.querySelectorAll('.subsystem-item').forEach((el) => {
      el.addEventListener('click', () => {
        const scanId = el.dataset.scan;
        const payload =
          SCIENTIFIC_PAYLOADS.find((p) => p.id === scanId) ||
          ALL_ARCHAEOLOGICAL_ARTIFACTS.find((a) => a.id === scanId || a.id === `artifact_${scanId}`);
        if (payload && scanner.onScanCallback) {
          scanner.onScanCallback({
            type: payload.missionId ? 'artifact' : 'payload',
            data: payload,
            point: activeRoverGroup.position
          });
        }
      });
    });
  }

  // Function to switch Celestial Body ('mars' | 'moon' | 'deepspace')
  function switchCelestialBody(planet) {
    if (!['mars', 'moon', 'deepspace'].includes(planet)) return;
    currentPlanet = planet;

    scene.remove(activeTerrainGroup);
    if (activeAtmosphere?.group) scene.remove(activeAtmosphere.group);
    scene.remove(activeRoverGroup);

    const tauCardLabel = document.getElementById('lbl-tau-card');
    const hudTau = document.getElementById('hud-tau');
    const hudTauUnit = document.getElementById('hud-tau-unit');
    const hudExtinction = document.getElementById('hud-extinction');
    const powerCardLabel = document.getElementById('lbl-power-card');
    const hudPower = document.getElementById('hud-power');
    const hudPowerUnit = document.getElementById('hud-power-unit');
    const hudPowerBaseline = document.getElementById('lbl-power-baseline');
    const voltCardLabel = document.getElementById('lbl-volt-card');
    const hudVoltage = document.getElementById('hud-voltage');
    const hudVoltUnit = document.getElementById('hud-volt-unit');
    const hudVoltSub = document.getElementById('lbl-volt-sub');
    const siteName = document.getElementById('hud-site-name');
    const coordsLine = document.getElementById('hud-coords-line');
    const odometerBadge = document.getElementById('hud-odometer-badge');
    const topBadgeText = document.getElementById('top-badge-text');

    if (planet === 'moon') {
      currentVehicle = 'lunar_rover';
      activeTerrainGroup = moonTerrain.group;
      activeAtmosphere = moonAtmosphere;
      activeRoverGroup = moonRover.rover;
      activeWheels = moonRover.wheels;
      activeGetTerrainHeight = moonTerrain.getTerrainHeight;
      scene.background = new THREE.Color(0x010204);

      if (tauCardLabel) tauCardLabel.innerText = 'LUNAR VACUUM & GRAVITY';
      if (hudTau) hudTau.innerText = '1.62';
      if (hudTauUnit) hudTauUnit.innerText = 'm/s² (1/6g)';
      if (hudExtinction) hudExtinction.innerText = 'Exosphere Vacuum • Target Δv: 1,870 m/s';
      if (powerCardLabel) powerCardLabel.innerText = 'APS / LRV BATTERY BUS';
      if (hudPower) hudPower.innerText = '100%';
      if (hudPowerUnit) hudPowerUnit.innerText = 'Ag-Zn';
      if (hudPowerBaseline) hudPowerBaseline.innerText = 'Apollo 11 Descent Stage: 2,150 kg Dry';
      if (voltCardLabel) voltCardLabel.innerText = 'S-BAND TELEMETRY LINK';
      if (hudVoltage) hudVoltage.innerText = '1.28';
      if (hudVoltUnit) hudVoltUnit.innerText = 'sec delay';
      if (hudVoltSub) hudVoltSub.innerText = 'Earth–Moon Distance: 384,400 km';
      if (siteName) siteName.innerText = 'Mare Tranquillitatis (Sea of Tranquility)';
      if (coordsLine) coordsLine.innerText = 'LAT: 0.6741° N | LON: 23.4730° E';
      if (odometerBadge) odometerBadge.innerText = 'APOLLO 11 • EAGLE LANDING SITE';
      if (topBadgeText) topBadgeText.innerText = 'MISSION 1 • MOON: APOLLO 11 STAGING SACRIFICE';
    } else if (planet === 'deepspace') {
      currentVehicle = 'voyager';
      activeTerrainGroup = deepSpaceVoyager.group;
      activeAtmosphere = null;
      activeRoverGroup = deepSpaceVoyager.rover;
      activeWheels = [];
      activeGetTerrainHeight = deepSpaceVoyager.getTerrainHeight;
      scene.background = new THREE.Color(0x010308);

      if (tauCardLabel) tauCardLabel.innerText = 'INTERSTELLAR MEDIUM';
      if (hudTau) hudTau.innerText = '24.3B';
      if (hudTauUnit) hudTauUnit.innerText = 'km from Earth';
      if (hudExtinction) hudExtinction.innerText = 'Beyond Heliopause (163 AU)';
      if (powerCardLabel) powerCardLabel.innerText = 'PU-238 RTG NUCLEAR OUTPUT';
      if (hudPower) hudPower.innerText = '249';
      if (hudPowerUnit) hudPowerUnit.innerText = 'Watts';
      if (hudPowerBaseline) hudPowerBaseline.innerText = 'Decay Rate: -4.0 W / Year (87.7-yr Half-Life)';
      if (voltCardLabel) voltCardLabel.innerText = 'ONE-WAY LIGHT DELAY';
      if (hudVoltage) hudVoltage.innerText = '22h 34m';
      if (hudVoltUnit) hudVoltUnit.innerText = 'at c';
      if (hudVoltSub) hudVoltSub.innerText = 'Round-Trip Handshake: 45 Hours 08 Mins';
      if (siteName) siteName.innerText = 'Interstellar Space (Constellation Ophiuchus)';
      if (coordsLine) coordsLine.innerText = 'VELOCITY: 17.0 KM/S | LAUNCHED: SEPT 5, 1977';
      if (odometerBadge) odometerBadge.innerText = 'GOLDEN RECORD: 55 LANGUAGES + MUSIC';
      if (topBadgeText) topBadgeText.innerText = 'MISSION 4 • DEEP SPACE: VOYAGER 1 & GOLDEN RECORD';
    } else {
      currentVehicle = 'opportunity';
      activeTerrainGroup = marsTerrain.group;
      activeAtmosphere = marsAtmosphere;
      activeRoverGroup = marsRover.rover;
      activeWheels = marsRover.wheels;
      activeGetTerrainHeight = marsTerrain.getTerrainHeight;
      scene.background = new THREE.Color(0xc87142);

      if (tauCardLabel) tauCardLabel.innerText = 'ATMOSPHERIC OPACITY (TAU)';
      if (hudTau) hudTau.innerText = currentTau.toFixed(1);
      if (hudTauUnit) hudTauUnit.innerText = 'τ';
      if (powerCardLabel) powerCardLabel.innerText = 'SOLAR POWER GENERATION';
      if (hudPowerUnit) hudPowerUnit.innerText = 'Wh / sol';
      if (hudPowerBaseline) hudPowerBaseline.innerText = 'Nominal clear-sky baseline: 900 Wh';
      if (voltCardLabel) voltCardLabel.innerText = 'BATTERY BUS VOLTAGE';
      if (hudVoltUnit) hudVoltUnit.innerText = 'V';
      if (hudVoltSub) hudVoltSub.innerText = 'Nominal Bus Range: 28-36 V';
      if (siteName) siteName.innerText = 'Perseverance Valley & Elysium Planitia';
      if (coordsLine) coordsLine.innerText = 'LAT: 14.5714° S | LON: 354.6734° E';
      if (odometerBadge) odometerBadge.innerText = 'OPPORTUNITY (MER-B) & INSIGHT LANDER';
      if (topBadgeText) topBadgeText.innerText = 'MISSIONS 2 & 3 • MARS: OPPORTUNITY & INSIGHT';
    }

    scene.add(activeTerrainGroup);
    if (activeAtmosphere?.group) scene.add(activeAtmosphere.group);

    if (planet === 'deepspace') {
      activeRoverGroup.position.set(0, 1.8, 0);
      setCameraMode('orbit');
      sceneManager.flyTo({
        target: { x: 0, y: 1.8, z: 0 },
        radius: 6.2,
        theta: 0.35,
        phi: Math.PI / 3.2,
        duration: 1.4
      });
    } else {
      activeRoverGroup.position.set(
        roverController.position.x,
        activeGetTerrainHeight(roverController.position.x, roverController.position.z),
        roverController.position.z
      );
      setCameraMode('orbit');
      sceneManager.flyTo({
        target: { x: roverController.position.x, y: roverController.position.y + 0.6, z: roverController.position.z },
        radius: planet === 'moon' ? 6.5 : 5.8,
        theta: planet === 'moon' ? 0.2 : 0.3,
        phi: Math.PI / 3,
        duration: 1.3
      });
    }
    scene.add(activeRoverGroup);

    scanner.setPlanet(planet);
    scanner.registerRoverSubsystems(activeRoverGroup);
    scanner.registerInteractiveTerrain(activeTerrainGroup);

    if (planet !== 'deepspace') {
      roverController.setPlanet(planet, activeGetTerrainHeight, activeRoverGroup, activeWheels);
      questManager.setPlanet(planet);
      coinsManager.spawnCoinsForPlanet(planet, activeGetTerrainHeight);
      guideBotEscort.setVisible(true);
      astronautCommander.setVisible(true);
    } else {
      coinsManager.clearCoins();
      guideBotEscort.setVisible(false);
      astronautCommander.setVisible(false);
    }

    // Update World Switcher Pills & Active World Pill
    document.querySelectorAll('.world-switch-pill').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.world === planet);
    });

    const worldPill = document.getElementById('active-world-pill');
    if (worldPill) {
      worldPill.innerText =
        planet === 'moon'
          ? '🌕 Moon: Sea of Tranquility'
          : planet === 'deepspace'
            ? '🌌 Deep Space: Voyager 1 (24.3B km)'
            : '🔴 Mars: Perseverance Valley & InSight';
    }

    renderSubsystemQuickList(planet);
    updateWaypointHUD();
    if (planet === 'mars') updateAtmosphericOptics(currentTau);
  }

  // Initial Subsystem Quick List
  renderSubsystemQuickList('mars');

  // World Switcher Pills in Bottom Dock
  document.querySelectorAll('.world-switch-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const world = btn.dataset.world;
      switchCelestialBody(world);
    });
  });

  // Telemetry & GPS Waypoint Tracker
  const odometerElem = document.getElementById('hud-odometer-badge');
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
    const selected = list.find((m) => m.id === questManager.selectedMissionId);
    if (selected) return selected;
    const firstUncompleted = list.find((m) => !questManager.completedMissions.has(m.id));
    return firstUncompleted || list[0];
  }

  function getActiveMissionArtifact(missionId) {
    return ALL_ARCHAEOLOGICAL_ARTIFACTS.find((a) => a.missionId === missionId);
  }

  function updateWaypointHUD() {
    const iconElem = document.getElementById('waypoint-icon');
    const badgeElem = document.getElementById('waypoint-badge');
    const nameElem = document.getElementById('waypoint-name');
    const subElem = document.getElementById('waypoint-sub');
    const distValElem = document.getElementById('waypoint-dist-val');

    if (currentPlanet === 'deepspace') {
      if (iconElem) iconElem.innerText = '💿';
      if (badgeElem) badgeElem.innerText = 'MISSION 4 • 24.3 BILLION KM';
      if (nameElem) nameElem.innerText = 'Voyager 1: The Dying Candle & Golden Record';
      if (subElem) subElem.innerText = 'Click Voyager 1 subsystems or open the JPL Science Lab!';
      if (distValElem) distValElem.innerText = '163 AU';
      return;
    }

    const activeMission = getActiveMission();
    const artifact = getActiveMissionArtifact(activeMission?.id);
    const totalMissions = questManager.activeMissionsList.length;
    const completedCount = questManager.activeMissionsList.filter((m) =>
      questManager.completedMissions.has(m.id)
    ).length;

    if (completedCount === totalMissions) {
      if (iconElem) iconElem.innerText = '🏆';
      if (badgeElem) badgeElem.innerText = 'ALL MISSIONS COMPLETED!';
      if (nameElem) nameElem.innerText = 'Grand Master Certificate Unlocked!';
      if (subElem) subElem.innerText = 'Click to View Your Master Certificate ➔';
      if (distValElem) distValElem.innerText = '100%';
      return;
    }

    if (activeMission) {
      scanner.setActiveWaypoint(activeMission.id);
      const isCompleted = questManager.completedMissions.has(activeMission.id);
      if (iconElem) iconElem.innerText = activeMission.badge || '🚀';
      if (badgeElem)
        badgeElem.innerText = `MISSION ${activeMission.level} / ${totalMissions} ${isCompleted ? '✓' : ''}`;
      if (nameElem) nameElem.innerText = activeMission.title_en;
      if (subElem) {
        subElem.innerText = `Target: ${activeMission.shortTitle_en} • Drive vehicle toward the glowing beacon or click JPL Science Labs`;
      }

      if (distValElem) {
        const targetX = artifact ? artifact.coords.x : activeMission.level * 4;
        const targetZ = artifact ? artifact.coords.z : activeMission.level * 3;
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
    if (currentPlanet === 'deepspace') return;

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
      siteNameElem.innerText =
        currentPlanet === 'moon'
          ? `Mare Tranquillitatis (Driving: ${stats.slopeDeg}° Slope)`
          : `Perseverance Valley (Driving: ${stats.slopeDeg}° Slope)`;
    }

    updateMinimap(stats);

    if (currentPlanet === 'moon' && stats.distanceMeters >= 20) {
      questManager.markMissionCompleted('moon_quest_lrv_buggy');
    }

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
          radarSub.innerText = `Objective reached! (${dist.toFixed(1)}m) • Press [E] or Click to Scan`;
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
        radarSub.innerText = `${artifact.title} (${dist.toFixed(1)}m) • Press [E] or Click to Scan`;
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

  window.addEventListener('keydown', (e) => {
    if (['KeyE', 'e', 'E'].includes(e.code) && activeRadarArtifact) {
      scanner.triggerManualScan(activeRadarArtifact.id);
    }
  });

  if (waypointHud) {
    waypointHud.addEventListener('click', () => {
      if (currentPlanet === 'deepspace') {
        miniGameManager.open('voyager1');
      } else {
        questManager.renderMissionsList();
        document.getElementById('missions-modal-backdrop')?.classList.add('active');
      }
    });
  }

  updateWaypointHUD();

  // 8. State & Mode Manager
  let currentMode = 'archaeologist';
  let currentTau = 1.2;

  function updateAtmosphericOptics(tau) {
    currentTau = tau;
    if (currentPlanet === 'mars') {
      const opticalResult = marsAtmosphere.setAtmosphericTau(tau);
      marsRover.setDustAccumulation(tau);

      if (tau >= 8.5 && !isRoverCrashedInStorm && currentMode === 'sol5111') {
        triggerStormCrash();
      }
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
        hudExtinction.innerText = `${opticalResult.extinctionPercent.toFixed(2)}% Sunlight Extinguished`;
      }
      if (tauSlider) tauSlider.value = tau;
      if (tauValDisplay) {
        const statusStr =
          tau > 8.0 ? '(Record Storm)' : tau > 3.0 ? '(Dust Storm)' : '(Nominal Clear)';
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
      if (actTag)
        actTag.innerText = `ACT ${
          pitchState.act.start < 21
            ? 'I'
            : pitchState.act.start < 56
              ? 'II'
              : pitchState.act.start < 89
                ? 'III'
                : 'IV'
        }`;
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

  updateAtmosphericOptics(1.2);

  // Helper to resolve which JPL Science Workbench corresponds to a scanned relic/subsystem
  let pendingScanLabKey = null;

  function resolveLabKeyForScan(scanId) {
    if (['apollo_lm', 'artifact_apollo_lm', 'surveyor3', 'artifact_surveyor3'].includes(scanId)) {
      return 'apollo11';
    }
    if (['hematite_blueberries', 'oppy_rover', 'pancam', 'mini_tes', 'rat', 'rat_grind_spot'].includes(scanId)) {
      return 'opportunity';
    }
    if (['insight_lander', 'artifact_insight_lander', 'mossbauer'].includes(scanId)) {
      return 'insight';
    }
    if (
      [
        'voyager1',
        'artifact_voyager1',
        'golden_record',
        'voyager_rtg',
        'voyager_hga',
        'voyager_iss',
        'voyager_mag',
        'blackbox_core'
      ].includes(scanId)
    ) {
      return 'voyager1';
    }
    return null;
  }

  const openLabFromModalBtn = document.getElementById('modal-open-lab-btn');
  if (openLabFromModalBtn) {
    openLabFromModalBtn.addEventListener('click', () => {
      document.getElementById('modal-backdrop')?.classList.remove('active');
      document.getElementById('scan-modal-backdrop')?.classList.remove('active');
      if (pendingScanLabKey) {
        miniGameManager.open(pendingScanLabKey);
      }
    });
  }

  // Scanner Callback & Quest + Mini-Game Progression Hooks
  scanner.onScanCallback = ({ type, data }) => {
    const scanId = data.id || '';

    // Mars Mission Progressions
    if (scanId === 'oppy_rover' || scanId === 'pancam' || scanId === 'mini_tes' || scanId === 'solar_array') {
      questManager.markMissionCompleted('mission_locate');
    } else if (scanId === 'hematite_blueberries') {
      questManager.markMissionCompleted('mission_blueberries');
      marsRover.triggerAPXSScanAnimation?.();
    } else if (scanId === 'rat' || scanId === 'rat_grind_spot') {
      questManager.markMissionCompleted('mission_rat');
    } else if (scanId === 'mossbauer' || scanId === 'insight_lander' || scanId === 'artifact_insight_lander') {
      questManager.markMissionCompleted('mission_mossbauer');
      marsTerrain.insightActor?.triggerMarsquake3D?.();
    } else if (scanId === 'storm_station') {
      questManager.markMissionCompleted('mission_storm');
    } else if (
      scanId === 'blackbox_core' ||
      scanId === 'voyager1' ||
      scanId === 'artifact_voyager1' ||
      scanId === 'golden_record'
    ) {
      questManager.markMissionCompleted('mission_blackbox');
      deepSpaceVoyager.triggerHandshakeWave?.();
    }

    // Moon Mission Progressions
    if (scanId === 'surveyor1' || scanId === 'artifact_surveyor1') {
      questManager.markMissionCompleted('moon_quest_pioneer');
    } else if (scanId === 'apollo_lm' || scanId === 'artifact_apollo_lm') {
      questManager.markMissionCompleted('moon_quest_apollo11');
    } else if (scanId === 'surveyor3' || scanId === 'artifact_surveyor3') {
      questManager.markMissionCompleted('moon_quest_surveyor3_retrieval');
    } else if (
      scanId === 'lrv_station' ||
      scanId === 'lrv_camera' ||
      scanId === 'lrv_antenna' ||
      scanId === 'lrv_controller'
    ) {
      questManager.markMissionCompleted('moon_quest_lrv_buggy');
    } else if (scanId === 'lcross_ice' || scanId === 'artifact_lcross_ice') {
      questManager.markMissionCompleted('moon_quest_lcross_ice');
    } else if (scanId === 'artemis_beacon' || scanId === 'artifact_artemis_beacon') {
      questManager.markMissionCompleted('moon_quest_artemis_base');
    }

    // Check if this scan links to one of the 4 Flagship JPL Science Workbenches
    pendingScanLabKey = resolveLabKeyForScan(scanId);
    if (openLabFromModalBtn) {
      openLabFromModalBtn.style.display = pendingScanLabKey ? 'inline-flex' : 'none';
    }

    // Trigger Asha & Leo Comms Dialogue with quick workbench launcher
    if (pendingScanLabKey === 'apollo11') {
      actorDirector.triggerCommsDialogue(
        'asha',
        'Asha (Dhaka) asks: "Why did Neil Armstrong leave the golden Descent Stage behind?" Click Open Science Workbench to test the Rocket Equation!',
        'APOLLO 11 ΔV LAB READY',
        () => miniGameManager.open('apollo11')
      );
    } else if (pendingScanLabKey === 'opportunity') {
      actorDirector.triggerCommsDialogue(
        'leo',
        'Leo (Florida): "Oppy deployed its Curium-244 APXS spectrometer on those blueberries! Let\'s align the Fe Kα and Kβ X-ray peaks!"',
        'APXS SPECTRUM LAB READY',
        () => miniGameManager.open('opportunity')
      );
    } else if (pendingScanLabKey === 'insight') {
      actorDirector.triggerCommsDialogue(
        'asha',
        'Asha (Dhaka): "Put on your headphones! InSight\'s SEIS dome just felt a meteoroid strike Mars—let\'s align the P-wave and S-wave arrivals!"',
        'SEISMOLOGY LAB READY',
        () => miniGameManager.open('insight')
      );
    } else if (pendingScanLabKey === 'voyager1') {
      actorDirector.triggerCommsDialogue(
        'leo',
        'Leo (Florida): "24.3 billion km away! Let\'s balance Voyager 1\'s decaying Pu-238 RTG power and play the Golden Record!"',
        'VOYAGER 1 LAB READY',
        () => miniGameManager.open('voyager1')
      );
    }

    const modal = document.getElementById('modal-backdrop') || document.getElementById('scan-modal-backdrop');
    const badge = document.getElementById('modal-type-badge');
    const title = document.getElementById('modal-title');
    const abbrev = document.getElementById('modal-abbrev');
    const discoveries = document.getElementById('modal-discoveries');
    const wavelengths = document.getElementById('modal-wavelengths');
    const resolution = document.getElementById('modal-resolution');
    const significance = document.getElementById('modal-significance');
    const blackboxBox = document.getElementById('blackbox-audio-box');

    if (badge)
      badge.innerText =
        type === 'artifact' ? 'HISTORIC SPACE MONUMENT' : 'SUBSYSTEM DIAGNOSTIC SCAN';
    if (title) title.innerText = data.name || data.title;
    if (abbrev) abbrev.innerText = data.abbreviation || 'JPL TELEMETRY ARCHIVE';
    if (discoveries) discoveries.innerText = data.discoveries || data.description;
    if (wavelengths) wavelengths.innerText = data.wavelengths || 'S-Band / X-Band Telemetry';
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

    // =========================================================================
  // IMMERSIVE FULLSCREEN MODE & GUIDER BRIEFING SYSTEM
  // =========================================================================
  let isFullscreenActive = false;

  function setFullscreenMode(active, triggerGuiderModal = true) {
    isFullscreenActive = active;
    document.body.classList.toggle('fullscreen-mode-active', active);

    const icon = document.getElementById('sidebar-toggle-icon');
    const btnLabel = document.getElementById('lbl-sidebar-btn');
    if (icon) icon.innerText = active ? '🔲' : '⛶';
    if (btnLabel) btnLabel.innerText = active ? 'Exit Full' : 'Fullscreen';

    if (active) {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      audioManager?.playUiSwitch();
      if (triggerGuiderModal) {
        showGuiderBriefingModal();
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      audioManager?.playUiSwitch();
    }
  }

  function showGuiderBriefingModal() {
    const modal = document.getElementById('guider-briefing-modal');
    if (!modal) return;

    const botBadge = document.getElementById('guider-modal-bot-badge');
    const botTitle = document.getElementById('guider-modal-title');
    const botSpeech = document.getElementById('guider-briefing-speech');
    const curCmdr = typeof selectedCommander !== 'undefined' ? selectedCommander : (localStorage.getItem('jdsn_selected_commander') || 'asha');
    const commanderTitle = curCmdr === 'asha' ? 'Asha (Dhaka)' : 'Leo (Florida)';
    const robotName = (typeof savedRobotConfig !== 'undefined' && savedRobotConfig?.name) ? savedRobotConfig.name : 'ASTRO-BOT';

    if (botBadge) botBadge.innerText = `${robotName} GUIDANCE PROTOCOL`;
    if (botTitle) botTitle.innerText = `Commander ${commanderTitle}! Immersive Exploration Engaged`;
    if (botSpeech) {
      botSpeech.innerHTML = `"Commander ${commanderTitle}! Fullscreen Immersive Mode is now <strong>ACTIVE</strong>. All distracting telemetry consoles have retracted into the hull. Follow my guidance directives below to pilot your rover, collect cosmic coins, scan relics, and complete the expedition!"`;
    }

    modal.classList.add('active');
    audioManager?.playUiAlert();
  }

  // Toggle button in header
  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
    setFullscreenMode(!isFullscreenActive, true);
  });

  // Floating exit button in fullscreen mode
  document.getElementById('btn-exit-fullscreen-floating')?.addEventListener('click', () => {
    setFullscreenMode(false);
  });

  // Close Guider Modal buttons
  document.getElementById('guider-briefing-close-btn')?.addEventListener('click', () => {
    document.getElementById('guider-briefing-modal')?.classList.remove('active');
    audioManager?.playUiClick();
  });

  document.getElementById('btn-guider-lets-go')?.addEventListener('click', () => {
    document.getElementById('guider-briefing-modal')?.classList.remove('active');
    audioManager?.playUiConfirm();
    setMode('drive');
  });

  document.getElementById('btn-guider-view-roadmap')?.addEventListener('click', () => {
    document.getElementById('guider-briefing-modal')?.classList.remove('active');
    audioManager?.playUiClick();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });

  // Keyboard shortcut: Press 'F' to toggle Fullscreen
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      setFullscreenMode(!isFullscreenActive, true);
    }
  });

  // Detect when user exits browser fullscreen via ESC
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isFullscreenActive) {
      setFullscreenMode(false, false);
    }
  });

  // UI Mode Setting
  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.nav-tab[data-mode]').forEach((tab) => {
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
      if (solSlider) solSlider.style.display = currentPlanet === 'mars' ? 'flex' : 'none';
      if (driveControls) driveControls.style.display = 'none';
      setCameraMode('orbit');
      if (currentPlanet === 'mars') updateAtmosphericOptics(1.2);
    } else if (mode === 'sol5111') {
      switchCelestialBody('mars');
      if (scannerPanel) scannerPanel.style.display = 'none';
      if (solSlider) solSlider.style.display = 'flex';
      if (driveControls) driveControls.style.display = 'none';
      setCameraMode('orbit');
      solTimelineManager.setSolByIndex(HISTORICAL_SOL_LOGS.length - 1);
    } else if (mode === 'drive') {
      if (currentPlanet === 'deepspace') switchCelestialBody('mars');
      if (scannerPanel) scannerPanel.style.display = 'none';
      if (solSlider) solSlider.style.display = 'none';
      if (driveControls) driveControls.style.display = 'flex';
      setCameraMode('orbit');
      setTarget(roverController.position.x, roverController.position.y + 0.6, roverController.position.z);
    } else if (mode === 'pitch') {
      if (currentPlanet === 'deepspace') switchCelestialBody('mars');
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
    document.querySelectorAll('.hub-nav-item').forEach((item) => item.classList.remove('active'));
    document.getElementById('hub-tab-home')?.classList.add('active');
  }

  function closeGameHub() {
    if (gameHubScreen) gameHubScreen.classList.remove('active');
  }

  document.getElementById('tab-home-hub')?.addEventListener('click', () => openGameHub());

  // =========================================================================
  // HERO STAGING DECK: CHARACTER SELECTION, GUIDE ROBOT & START MISSION
  // =========================================================================
  
  // 1. Initialize Hero Character SVG Rigs
  actorDirector.initHeroCharacterRigs();

  // 2. Commander Selection State (Asha vs Leo)
  let selectedCommander = localStorage.getItem('jdsn_selected_commander') || 'asha';
  let selectedDestination = 'mars';

  const charCardAsha = document.getElementById('char-card-asha');
  const charCardLeo = document.getElementById('char-card-leo');
  const startMissionBtn = document.getElementById('hero-start-mission-btn');
  const startCommanderName = document.getElementById('lbl-start-commander-name');
  const startDestSub = document.getElementById('lbl-start-dest-sub');
  const hubUserName = document.getElementById('lbl-hub-user-name');

  function updateCommanderUI() {
    if (charCardAsha) charCardAsha.classList.toggle('selected', selectedCommander === 'asha');
    if (charCardLeo) charCardLeo.classList.toggle('selected', selectedCommander === 'leo');

    if (startCommanderName) {
      startCommanderName.innerText = selectedCommander === 'asha' ? 'ASHA' : 'LEO';
    }

    if (startMissionBtn) {
      startMissionBtn.classList.toggle('leo-active', selectedCommander === 'leo');
    }

    if (hubUserName) {
      hubUserName.innerText = selectedCommander === 'asha' 
        ? 'ASHA (DHAKA) • JDSN COMMANDER' 
        : 'LEO (FLORIDA) • JDSN COMMANDER';
    }

    actorDirector.activeSpeaker = selectedCommander;
  }

  charCardAsha?.addEventListener('click', () => {
    selectedCommander = 'asha';
    localStorage.setItem('jdsn_selected_commander', 'asha');
    updateCommanderUI();
    martianAudio.playUiSwitch();
    martianAudio.playVoiceCadence('asha');
  });

  charCardLeo?.addEventListener('click', () => {
    selectedCommander = 'leo';
    localStorage.setItem('jdsn_selected_commander', 'leo');
    updateCommanderUI();
    martianAudio.playUiSwitch();
    martianAudio.playVoiceCadence('leo');
  });

  updateCommanderUI();

  // 3. Destination Selector Pills
  const destPills = {
    mars: document.getElementById('dest-pill-mars'),
    moon: document.getElementById('dest-pill-moon'),
    deepspace: document.getElementById('dest-pill-deepspace')
  };

  const destSubLabels = {
    mars: 'TO MARS: PERSEVERANCE VALLEY ➔',
    moon: 'TO MOON: TRANQUILITY BASE ➔',
    deepspace: 'TO DEEP SPACE: VOYAGER 1 ➔'
  };

  function setDestination(dest) {
    if (!destPills[dest]) return;
    selectedDestination = dest;
    Object.keys(destPills).forEach(k => {
      destPills[k]?.classList.toggle('active', k === dest);
    });
    if (startDestSub) {
      startDestSub.innerText = destSubLabels[dest] || 'LAUNCH ➔';
    }
    martianAudio.playUiSwitch();
  }

  destPills.mars?.addEventListener('click', () => setDestination('mars'));
  destPills.moon?.addEventListener('click', () => setDestination('moon'));
  destPills.deepspace?.addEventListener('click', () => setDestination('deepspace'));

  // Interactive Background Celestial Body Clicks
  document.getElementById('hero-celestial-mars')?.addEventListener('click', () => {
    setDestination('mars');
    martianAudio.playScannerBeep(true);
  });
  document.getElementById('hero-celestial-moon')?.addEventListener('click', () => {
    setDestination('moon');
    martianAudio.playScannerBeep(true);
  });
  document.getElementById('hero-celestial-voyager')?.addEventListener('click', () => {
    setDestination('deepspace');
    martianAudio.playScannerBeep(true);
  });

  // 4. Guide Robot Customizer State & Modal Logic
  let savedRobotConfig = {
    name: 'ASTRO-BOT',
    color: '#00e5ff',
    protocol: 'science'
  };
  try {
    const stored = localStorage.getItem('jdsn_guide_robot');
    if (stored) savedRobotConfig = Object.assign(savedRobotConfig, JSON.parse(stored));
  } catch (e) {}

  const robotBackdrop = document.getElementById('robot-customizer-backdrop');
  const robotPreviewPod = document.getElementById('robot-preview-pod');
  const robotNameInput = document.getElementById('robot-name-input');
  const robotDisplayName = document.getElementById('robot-display-name');
  const robotDisplayMode = document.getElementById('robot-display-mode');
  const miniBotName = document.getElementById('mini-bot-name-label');
  const miniBotDot = document.getElementById('mini-bot-color-dot');

  function renderRobotPreview() {
    if (robotPreviewPod) {
      robotPreviewPod.innerHTML = actorDirector.getRobotRigSVG('modal', savedRobotConfig.color);
    }
    if (robotDisplayName) robotDisplayName.innerText = savedRobotConfig.name;
    if (miniBotName) miniBotName.innerText = savedRobotConfig.name;
    if (miniBotDot) {
      miniBotDot.style.background = savedRobotConfig.color;
      miniBotDot.style.boxShadow = `0 0 8px ${savedRobotConfig.color}`;
    }
    if (robotDisplayMode) {
      const modeNames = {
        science: '🔬 SCIENCE GUIDE MODE',
        radar: '📡 LIDAR RADAR SCANNER',
        story: '📖 STORY CHRONICLER'
      };
      robotDisplayMode.innerText = modeNames[savedRobotConfig.protocol] || 'COMPANION AI';
    }
  }

  renderRobotPreview();

  // Open / Close Robot Customizer
  document.getElementById('btn-open-robot-customizer')?.addEventListener('click', () => {
    if (robotBackdrop) robotBackdrop.classList.add('active');
    if (robotNameInput) robotNameInput.value = savedRobotConfig.name;
    renderRobotPreview();
    martianAudio.playUiSwitch();
  });

  document.getElementById('robot-customizer-close')?.addEventListener('click', () => {
    if (robotBackdrop) robotBackdrop.classList.remove('active');
  });

  robotBackdrop?.addEventListener('click', (e) => {
    if (e.target.id === 'robot-customizer-backdrop') {
      robotBackdrop.classList.remove('active');
    }
  });

  // Color Palette Selection
  document.querySelectorAll('.color-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      savedRobotConfig.color = chip.dataset.color;
      renderRobotPreview();
      martianAudio.playClick();
    });
  });

  // Protocol Selection
  document.querySelectorAll('.protocol-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.protocol-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      savedRobotConfig.protocol = card.dataset.protocol;
      renderRobotPreview();
      martianAudio.playClick();
    });
  });

  // Name Input Live Update
  robotNameInput?.addEventListener('input', (e) => {
    savedRobotConfig.name = e.target.value.trim().toUpperCase() || 'ASTRO-BOT';
    if (robotDisplayName) robotDisplayName.innerText = savedRobotConfig.name;
  });

  // Save Robot Configuration
  document.getElementById('btn-save-robot-config')?.addEventListener('click', () => {
    if (robotNameInput) {
      savedRobotConfig.name = robotNameInput.value.trim().toUpperCase() || 'ASTRO-BOT';
    }
    localStorage.setItem('jdsn_guide_robot', JSON.stringify(savedRobotConfig));
    renderRobotPreview();
    if (robotBackdrop) robotBackdrop.classList.remove('active');
    martianAudio.playScannerBeep(true);
  });

  // 5. Spaceship Habitation Ready Room & Start Mission Flow
  const spaceshipHab = new SpaceshipHabManager((destination, commander) => {
    selectedDestination = destination;
    selectedCommander = commander;
    switchCelestialBody(destination);
    setMode('drive');

    guideBotEscort.setColor(savedRobotConfig.color);
    guideBotEscort.setVisible(true);
    astronautCommander.setCommander(commander);
    astronautCommander.setVisible(true);
    astronautCommander.setCrashState(false);

    // Open the Mission Levels Roadmap modal for this planet first!
    questManager.openRoadmapForPlanet(destination);

    const greeting = commander === 'asha'
      ? `Asha (Dhaka): "Welcome to ${destination === 'moon' ? 'the Moon' : 'Mars'}! Your mission levels roadmap is ready—pick Level 1 to begin!"`
      : `Leo (Florida): "Commander Leo at ${destination === 'moon' ? 'Lunar' : 'Martian'} console! Expedition levels loaded. Click Level 1 to start!"`;

    const missionBadge = destination === 'moon' ? 'MOON EXPEDITION' : 'MARS EXPEDITION';

    setTimeout(() => {
      actorDirector.triggerCommsDialogue(
        commander,
        greeting,
        missionBadge
      );
    }, 400);
  });

  // START MISSION ACTION -> Enters Abandoned Spaceship Hab!
  startMissionBtn?.addEventListener('click', () => {
    martianAudio.playUiSwitch();
    closeGameHub();
    spaceshipHab.setCommander(selectedCommander, savedRobotConfig);
    spaceshipHab.open();
  });

  // Sol 5111 Rover Crash & Coin Repair System
  let isRoverCrashedInStorm = false;

  function triggerStormCrash() {
    if (isRoverCrashedInStorm) return;
    isRoverCrashedInStorm = true;

    if (roverController?.rover) {
      roverController.velocity = 0;
      roverController.rover.rotation.z = Math.PI * 0.58;
      roverController.rover.rotation.x = 0.35;
      roverController.rover.position.y += 0.35;
      astronautCommander.setCrashState(true, roverController.position);
    }

    martianAudio.playMarsquakeWave();

    const repairWidget = document.getElementById('storm-crash-repair-widget');
    if (repairWidget) repairWidget.style.display = 'block';
  }

  function repairRoverFromStorm() {
    const success = coinsManager.spendCoins(100);
    if (!success) {
      coinsManager.showFloatingPickupText('⚠️ Need 100 Cosmic Coins! Drive & collect coins on the terrain 🪙');
      return;
    }

    isRoverCrashedInStorm = false;
    if (roverController?.rover) {
      roverController.rover.rotation.z = 0;
      roverController.rover.rotation.x = 0;
      roverController.rover.position.y = activeGetTerrainHeight ? activeGetTerrainHeight(roverController.position.x, roverController.position.z) : 0;
      astronautCommander.setCrashState(false);
    }

    const repairWidget = document.getElementById('storm-crash-repair-widget');
    if (repairWidget) repairWidget.style.display = 'none';

    martianAudio.playScannerBeep(true);
    coinsManager.showFloatingPickupText('⚡ ROVER REPAIRED & REBOOTED! 100% HEALTH ⚡');
  }

  document.getElementById('btn-repair-rover')?.addEventListener('click', repairRoverFromStorm);

  // Discovery / Level Complete Modal Actions
  document.getElementById('disc-roadmap-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    questManager.openRoadmapForPlanet(currentPlanet);
    martianAudio.playUiSwitch?.();
  });

  document.getElementById('disc-next-level-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    questManager.playNextLevel();
    martianAudio.playUiSwitch?.();
  });

  document.getElementById('disc-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    questManager.playNextLevel();
  });

  // Story Prologue Triggers
  const openPrologueHandler = () => {
    actorDirector.openPrologue(() => {
      closeGameHub();
      switchCelestialBody('moon');
      setMode('archaeologist');
    });
  };

  document.getElementById('hub-prologue-btn')?.addEventListener('click', openPrologueHandler);
  document.getElementById('hub-quick-prologue-btn')?.addEventListener('click', openPrologueHandler);
  document.getElementById('hub-card-prologue')?.addEventListener('click', openPrologueHandler);
  document.getElementById('hub-tab-prologue')?.addEventListener('click', openPrologueHandler);
  document.getElementById('btn-open-prologue')?.addEventListener('click', openPrologueHandler);

  // 4 JPL Science Labs Triggers
  miniGameManager.onTabSwitchCallback = (mgKey) => {
    if (mgKey === 'apollo11') switchCelestialBody('moon');
    else if (mgKey === 'voyager1') switchCelestialBody('deepspace');
    else switchCelestialBody('mars');
  };

  const openLabsHandler = (defaultLab = 'apollo11') => {
    miniGameManager.open(defaultLab);
  };

  document.getElementById('hub-minigames-btn')?.addEventListener('click', () => openLabsHandler('apollo11'));
  document.getElementById('hub-tab-minigames')?.addEventListener('click', () => openLabsHandler('apollo11'));
  document.getElementById('open-minigames-tab-btn')?.addEventListener('click', () => {
    const defaultForWorld =
      currentPlanet === 'moon'
        ? 'apollo11'
        : currentPlanet === 'deepspace'
          ? 'voyager1'
          : 'opportunity';
    openLabsHandler(defaultForWorld);
  });

  // Right Scanner Quick Lab Buttons
  document.querySelectorAll('.flq-btn[data-open-mg]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mgKey = btn.dataset.openMg;
      if (mgKey === 'apollo11') switchCelestialBody('moon');
      else if (mgKey === 'voyager1') switchCelestialBody('deepspace');
      else switchCelestialBody('mars');
      miniGameManager.open(mgKey);
    });
  });

  // Hub Game Cards Handlers for the 4 Flagship Missions
  document.getElementById('hub-card-apollo11')?.addEventListener('click', () => {
    closeGameHub();
    switchCelestialBody('moon');
    setMode('archaeologist');
    miniGameManager.open('apollo11');
  });

  document.getElementById('hub-card-archaeology')?.addEventListener('click', () => {
    closeGameHub();
    switchCelestialBody('mars');
    setMode('archaeologist');
    miniGameManager.open('opportunity');
  });

  document.getElementById('hub-card-insight')?.addEventListener('click', () => {
    closeGameHub();
    switchCelestialBody('mars');
    setMode('archaeologist');
    miniGameManager.open('insight');
  });

  document.getElementById('hub-card-voyager')?.addEventListener('click', () => {
    closeGameHub();
    switchCelestialBody('deepspace');
    setMode('archaeologist');
    miniGameManager.open('voyager1');
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
    if (currentPlanet === 'deepspace') switchCelestialBody('mars');
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
    if (currentPlanet === 'deepspace') switchCelestialBody('mars');
    setMode('drive');
  });

  document.getElementById('hub-tab-pitch')?.addEventListener('click', () => {
    closeGameHub();
    if (currentPlanet === 'deepspace') switchCelestialBody('mars');
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

    const isMoonMission = KIDS_MISSIONS_MOON.some((m) => m.id === missionId);
    if (isMoonMission) {
      switchCelestialBody('moon');
    } else if (missionId === 'mission_blackbox') {
      switchCelestialBody('deepspace');
      miniGameManager.open('voyager1');
      return;
    } else {
      switchCelestialBody('mars');
    }

    questManager.setSelectedMission(missionId);
    updateWaypointHUD();

    // Open corresponding JPL Science Lab directly for the 4 flagship quests
    if (missionId === 'moon_quest_apollo11') {
      miniGameManager.open('apollo11');
      return;
    }
    if (missionId === 'mission_blueberries') {
      miniGameManager.open('opportunity');
      return;
    }
    if (missionId === 'mission_mossbauer') {
      miniGameManager.open('insight');
      return;
    }

    setMode('drive');
    const artifact = getActiveMissionArtifact(missionId);
    if (artifact) {
      scanner.setActiveWaypoint(missionId);
      actorDirector.triggerCommsDialogue(
        'asha',
        `Drive toward the glowing beacon for ${artifact.title}, or click its subsystem in the scanner panel!`,
        'WAYPOINT LOCKED'
      );
    }
  };

  questManager.onPlanetChangeCallback = (planet) => {
    switchCelestialBody(planet);
  };

  // Navigation Click Handlers
  document.querySelectorAll('.nav-tab[data-mode]').forEach((tab) => {
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

  document.getElementById('lang-toggle-btn')?.addEventListener('click', () => {
    const lang = questManager.toggleLanguage();
    quizManager.setLanguage(lang);
    newsManager.setLanguage(lang);
    calendarManager.setLanguage(lang);
    martianAudio.playClick();
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

  document.getElementById('celebration-close-btn')?.addEventListener('click', () => {
    document.getElementById('celebration-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('celebration-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('celebration-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('cert-close-btn')?.addEventListener('click', () => {
    document.getElementById('celebration-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('cert-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('celebration-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('modal-close-btn')?.addEventListener('click', () => {
    document.getElementById('modal-backdrop')?.classList.remove('active');
    document.getElementById('scan-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('modal-action-btn')?.addEventListener('click', () => {
    document.getElementById('modal-backdrop')?.classList.remove('active');
    document.getElementById('scan-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('modal-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('modal-backdrop')?.classList.remove('active');
    document.getElementById('scan-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('rubric-btn')?.addEventListener('click', () => {
    document.getElementById('rubric-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('rubric-close-btn')?.addEventListener('click', () => {
    document.getElementById('rubric-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('rubric-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('rubric-modal-backdrop')?.classList.remove('active');
  });

  document.getElementById('dust-info-btn')?.addEventListener('click', () => {
    document.getElementById('dust-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('dust-close-btn')?.addEventListener('click', () => {
    document.getElementById('dust-modal-backdrop')?.classList.remove('active');
  });
  document.getElementById('dust-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('dust-modal-backdrop')?.classList.remove('active');
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
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

  // Camera Buttons
  document.getElementById('cam-orbit')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.currentTarget);
    setCameraMode('orbit');
    if (currentPlanet === 'deepspace') {
      setTarget(0, 1.8, 0);
      camera.position.set(0, 3.2, 6.2);
    } else {
      setTarget(roverController.position.x, roverController.position.y + 0.6, roverController.position.z);
      camera.position.set(
        roverController.position.x,
        roverController.position.y + 2.2,
        roverController.position.z + 5.5
      );
    }
  });

  document.getElementById('cam-pancam')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.currentTarget);
    setCameraMode('pancam_fpp');
    fpp.eyePos.set(roverController.position.x, roverController.position.y + 1.4, roverController.position.z);
    fpp.yaw = roverController.heading;
    fpp.pitch = 0;
    sceneManager.updateCameraPosition();
  });

  document.getElementById('cam-top')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.currentTarget);
    setCameraMode('top');
    camera.position.set(roverController.position.x, roverController.position.y + 18, roverController.position.z);
    camera.lookAt(roverController.position.x, roverController.position.y, roverController.position.z);
  });

  document.getElementById('cam-surface')?.addEventListener('click', (e) => {
    setActiveCamBtn(e.currentTarget);
    setCameraMode('surface');
    camera.position.set(
      roverController.position.x - 2.5,
      roverController.position.y + 0.5,
      roverController.position.z + 3.2
    );
    setTarget(roverController.position.x, roverController.position.y + 0.5, roverController.position.z);
  });

  function setActiveCamBtn(target) {
    document.querySelectorAll('.cam-btn').forEach((b) => b.classList.remove('active'));
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
      document.getElementById('play-sol-timeline').innerText = '▶ Play Storm';
    } else {
      solTimelineManager.playTimeline();
      document.getElementById('play-sol-timeline').innerText = '⏸ Pause';
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
      const audioLabel = isUnmuted ? 'Audio: ON' : 'Audio: OFF';
      document.getElementById('lbl-audio-btn').innerText = audioLabel;

      const hubAudioIcon = document.getElementById('hub-audio-icon');
      const hubAudioText = document.getElementById('hub-audio-text');
      if (hubAudioIcon) hubAudioIcon.innerText = isUnmuted ? '🔊' : '🔇';
      if (hubAudioText) hubAudioText.innerText = audioLabel;
    });
  }

  document.getElementById('hub-audio-toggle')?.addEventListener('click', () => {
    document.getElementById('audio-toggle-btn')?.click();
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

  // 11. Main Animation Render Loop
  const clock = new THREE.Clock();

  // Spaceflight Cockpit HUD Real-Time Telemetry Updater
  let flightHudActive = true;
  const flightHudOverlay = document.getElementById('spaceflight-hud-overlay');
  const flightHudToggleBtn = document.getElementById('flight-hud-toggle-btn');
  const compassTape = document.getElementById('flight-compass-tape');
  const compassReadout = document.getElementById('flight-compass-readout');
  const pitchLadder = document.getElementById('attitude-pitch-ladder');
  const flightSpeedVal = document.getElementById('flight-speed-val');
  const flightSpeedBar = document.getElementById('flight-speed-bar');
  const flightGVal = document.getElementById('flight-g-val');
  const flightAltVal = document.getElementById('flight-alt-val');
  const flightTargetVal = document.getElementById('flight-target-val');
  const flightTargetDist = document.getElementById('flight-target-dist');
  const flightStatusText = document.getElementById('flight-status-text');

  if (flightHudToggleBtn) {
    flightHudToggleBtn.addEventListener('click', () => {
      flightHudActive = !flightHudActive;
      martianAudio.playUiSwitch();
      if (flightHudOverlay) {
        flightHudOverlay.style.opacity = flightHudActive ? '1' : '0';
        flightHudOverlay.style.pointerEvents = flightHudActive ? 'none' : 'none';
      }
      flightHudToggleBtn.innerHTML = flightHudActive ? '<span>🛩️ HUD: ACTIVE</span>' : '<span>🛩️ HUD: OFF</span>';
    });
  }

  function updateSpaceflightHUD() {
    if (!flightHudOverlay || !flightHudActive) return;

    const attitude = sceneManager.getCameraAttitude();
    const heading = attitude.headingDeg;

    // 1. Heading Compass Tape
    if (compassTape) {
      // Offset tape smoothly between 0% and -50%
      const offsetPercent = ((heading % 360) / 360) * 50;
      compassTape.style.transform = `translateX(-${offsetPercent}%)`;
    }

    if (compassReadout) {
      let card = 'N';
      if (heading >= 337.5 || heading < 22.5) card = 'N';
      else if (heading < 67.5) card = 'NE';
      else if (heading < 112.5) card = 'E';
      else if (heading < 157.5) card = 'SE';
      else if (heading < 202.5) card = 'S';
      else if (heading < 247.5) card = 'SW';
      else if (heading < 292.5) card = 'W';
      else if (heading < 337.5) card = 'NW';
      compassReadout.innerText = `HDG: ${Math.round(heading).toString().padStart(3, '0')}° ${card}`;
    }

    // 2. Artificial Horizon Pitch & Roll
    if (pitchLadder) {
      const pitchDeg = currentMode === 'drive' ? (roverController.currentSlopeDeg || attitude.pitchDeg) : attitude.pitchDeg;
      const rollDeg = currentMode === 'drive' ? (roverController.rover ? -roverController.rover.rotation.z * (180 / Math.PI) : 0) : 0;
      const pitchOffset = Math.max(-60, Math.min(60, pitchDeg * 1.8));
      pitchLadder.style.transform = `translateY(${pitchOffset}px) rotate(${rollDeg.toFixed(1)}deg)`;
    }

    // 3. Speed, G-Force & Altitude
    const speed = currentPlanet === 'deepspace' ? 17000 : Math.abs(roverController?.velocity || 0);
    const speedDisplay = currentPlanet === 'deepspace' ? '17.0 km/s' : `${speed.toFixed(1)} m/s`;
    if (flightSpeedVal) flightSpeedVal.innerHTML = `${speedDisplay}`;
    if (flightSpeedBar) {
      const pct = currentPlanet === 'deepspace' ? 100 : Math.min(100, (speed / (roverController?.maxSpeed || 2.4)) * 100);
      flightSpeedBar.style.width = `${pct}%`;
    }

    if (flightGVal) {
      flightGVal.innerHTML = currentPlanet === 'moon' ? '0.16 <small>G</small>' : currentPlanet === 'deepspace' ? '0.00 <small>G</small>' : '0.38 <small>G</small>';
    }

    if (flightAltVal) {
      const alt = currentPlanet === 'deepspace' ? '163 AU' : `${attitude.altitudeM} m`;
      flightAltVal.innerHTML = `${alt}`;
    }

    // 4. Target Relic & Distance
    if (flightTargetVal && flightTargetDist) {
      if (currentPlanet === 'moon') {
        flightTargetVal.innerText = 'APOLLO 11 (LM EAGLE)';
        flightTargetDist.innerText = 'TRANQUILITY BASE • HISTORIC SITE';
      } else if (currentPlanet === 'deepspace') {
        flightTargetVal.innerText = 'VOYAGER 1 & GOLDEN RECORD';
        flightTargetDist.innerText = 'HELIOPAUSE • 24.3 BILLION KM';
      } else {
        flightTargetVal.innerText = 'OPPORTUNITY (MER-B)';
        flightTargetDist.innerText = 'PERSEVERANCE VALLEY • CRATER RIM';
      }
    }
  }

  // Global Micro-Interaction Audio Synthesizer Triggers
  document.addEventListener('pointerenter', (e) => {
    const el = e.target.closest?.('button, .hub-quick-btn, .hub-game-card, .nav-tab, .mg-tab-pill');
    if (el) {
      martianAudio.playUiHover();
    }
  }, true);

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Smooth Camera Damping & Cosmic Stardust Particles
    sceneManager.update(delta, elapsedTime);

    if (activeAtmosphere) {
      activeAtmosphere.update(delta, currentTau);
    }
    scanner.update(elapsedTime);

    // Update all 3D Hardware Actors (Opportunity, LRV, Apollo 11 LM, InSight Lander, Voyager 1)
    actorDirector.update(delta, elapsedTime, currentPlanet, currentTau);

    if ((currentMode === 'drive' || currentMode === 'archaeologist') && currentPlanet !== 'deepspace') {
      if (!isRoverCrashedInStorm) {
        roverController.update(delta);
      }
      coinsManager.update(delta, elapsedTime, roverController.position);
      guideBotEscort.update(delta, elapsedTime, roverController.position, roverController.heading);
      astronautCommander.update(roverController.position, roverController.heading, currentPlanet);
    }

    if (currentMode === 'pitch') {
      pitchDirector.update(delta);
    }

    // Keep FPP eye positioned with moving rover
    if (
      sceneManager.isOrbitEnabled === false &&
      document.getElementById('cam-pancam')?.classList.contains('active')
    ) {
      fpp.eyePos.set(roverController.position.x, roverController.position.y + 1.4, roverController.position.z);
      sceneManager.updateCameraPosition();
    }

    // 2. Real-Time Spaceflight Avionics & Cockpit HUD Update
    updateSpaceflightHUD();

    renderer.render(scene, camera);
  }

  animate();
  console.log('🌟 Relics of the Cosmic Dust: The Last Handshake — WebGL & JPL Science Engine Ready.');
});
