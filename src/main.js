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
import { installHoverStabilizer } from './systems/hoverStabilizer.js';
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
import { HeroInteractionsManager } from './systems/heroInteractions.js';
import { Hero3DOrrery } from './systems/hero3DOrrery.js';
import { KittyCompanionManager } from './systems/kittyCompanionManager.js';
import { profileManager } from './systems/profileManager.js';
import { MISSION_STORY_ARTICLES } from './data/storyArticles.js';
import {
  HISTORICAL_SOL_LOGS,
  SCIENTIFIC_PAYLOADS,
  ARCHAEOLOGICAL_ARTIFACTS as ALL_ARCHAEOLOGICAL_ARTIFACTS
} from './data/telemetryData.js';
import { KIDS_MISSIONS_MARS, KIDS_MISSIONS_MOON } from './data/kidsContent.js';

// Initialize WebGL Application
function initApplication() {
  // Must run first: stops lift-on-hover flicker site-wide and provides hoverstart/hoverend
  installHoverStabilizer();
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
  astronautCommander.setVisible(false); // Unmanned rover as per NASA archaeology specs

  const kittyCompanion = new KittyCompanionManager({
    scene,
    onCompanionChanged: (kitty) => {
      guideBotEscort.setColor(kitty.color);
      const drawerBotLabel = document.getElementById('drawer-kitty-name-label');
      const drawerBotDot = document.getElementById('drawer-kitty-dot');
      if (drawerBotLabel) drawerBotLabel.innerText = kitty.name.toUpperCase();
      if (drawerBotDot) drawerBotDot.style.background = kitty.color;
    }
  });

  // App Lifecycle States
  let isFullscreenActive = false;
  let isHubActive = true;
  let isSplashActive = true;
  window.__isSplashActive = true;

  // 5. Setup Mission Quest Manager (100% English)
  const currentLanguage = 'en';
  const questManager = new MissionQuestManager(() => {});
  questManager.setLanguage(currentLanguage);

  // Connect Cadet Multi-Profile & Reload State Manager
  profileManager.attachGameManagers({
    questManager,
    coinsManager,
    kittyCompanion,
    onStateRestore: (screen, params) => {
      profileManager.restoreScreen(screen, params);
    }
  });

  // 6. Setup Actor Animation Director (Asha & Leo + 3D Hardware Actors) & 4 JPL Science Labs
  const actorDirector = new ActorAnimationDirector();
  actorDirector.register3DActors({
    marsRover,
    moonRover,
    apolloLM: moonTerrain.lmActor,
    insightLander: marsTerrain.insightActor,
    stormStation: marsTerrain.stormStationActor,
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
  function switchCelestialBody(planet, triggerFlyTo = true) {
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
      if (triggerFlyTo) {
        sceneManager.flyTo({
          target: { x: roverController.position.x, y: roverController.position.y + 0.6, z: roverController.position.z },
          radius: planet === 'moon' ? 6.5 : 5.8,
          theta: roverController.heading !== undefined ? roverController.heading : (planet === 'moon' ? 0.2 : 0.3),
          phi: 1.15,
          duration: 1.3
        });
      }
    }
    scene.add(activeRoverGroup);

    scanner.setTerrainHeightFn?.(activeGetTerrainHeight);
    scanner.setPlanet(planet);
    scanner.registerRoverSubsystems(activeRoverGroup);
    scanner.registerInteractiveTerrain(activeTerrainGroup);

    if (planet !== 'deepspace') {
      roverController.setPlanet(planet, activeGetTerrainHeight, activeRoverGroup, activeWheels);
      questManager.setPlanet(planet);
      coinsManager.spawnCoinsForPlanet(planet, activeGetTerrainHeight);
      guideBotEscort.setVisible(false); // Single chosen kittyCompanion only
      kittyCompanion?.setVisible(true);
      astronautCommander.setVisible(false); // Clean unmanned rover
    } else {
      coinsManager.clearCoins();
      guideBotEscort.setVisible(false);
      kittyCompanion?.setVisible(false);
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
      const isDone = questManager.completedMissions.has('mission_blackbox');
      if (isDone) {
        if (iconElem) iconElem.innerText = '🏅';
        if (badgeElem) badgeElem.innerText = 'COMMUNICATION LINK VERIFIED ✓';
        if (nameElem) nameElem.innerText = 'Earth-Voyager Telemetry Handshake Established!';
        if (subElem) subElem.innerText = 'Golden Record Unlocked! Click to View Interstellar Master Certificate ➔';
        if (distValElem) distValElem.innerText = '100% LINK';
      } else {
        if (iconElem) iconElem.innerText = '📡';
        if (badgeElem) badgeElem.innerText = 'DEEP SPACE COMM CENTER • 24.3 BILLION KM';
        if (nameElem) nameElem.innerText = 'Voyager 1: How Interstellar Telemetry Reaches Earth';
        if (subElem) subElem.innerText = 'Orient Antenna [W/S/A/D] • Press [E] or Click to Open Science Workbench & Golden Record!';
        if (distValElem) distValElem.innerText = '22h 34m delay';
      }
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

    if (isHubActive || isSplashActive || window.__isSplashActive) {
      return;
    }

    const activeMission = getActiveMission();
    const artifact = getActiveMissionArtifact(activeMission?.id);
    if (artifact && artifact.coords) {
      const dx = roverController.position.x - artifact.coords.x;
      const dz = roverController.position.z - artifact.coords.z;
      const dist = Math.hypot(dx, dz);
      const distValElem = document.getElementById('waypoint-dist-val');
      if (distValElem) distValElem.innerText = `${dist.toFixed(1)}m`;

      // Approaching within 12 meters -> Billboard removed per user request: "remove this page"
      // (Scan interaction handles relic detection without blocking modal)

      if (dist <= 4.5) {
        activeRadarArtifact = artifact;
        if (radarHud) radarHud.style.display = 'flex';
        if (radarTitle) radarTitle.innerText = `📍 TARGET: ${artifact.title}`;
        if (radarSub) {
          radarSub.innerText = `${artifact.title} (${dist.toFixed(1)}m) • Press [E] or Click to Scan`;
        }
        if (radarScanBtn) {
          radarScanBtn.style.display = 'block';
          radarScanBtn.innerText = 'SCAN ➔';
        }
        const trackerHud = document.getElementById('waypoint-tracker-hud');
        if (trackerHud) trackerHud.classList.add('in-scan-range');
      } else {
        const trackerHud = document.getElementById('waypoint-tracker-hud');
        if (trackerHud) trackerHud.classList.remove('in-scan-range');
      }
    }
  };

  // Relic History Stories dictionary for Holographic Billboard (English & Bengali)
  function getRelicHistoryStory(artifact, isBn = false) {
    const key = artifact?.id || artifact?.missionId || '';
    const stories = {
      surveyor1: {
        en: "On June 2, 1966, Surveyor 1 touched down on Oceanus Procellarum, marking the first successful American soft landing on the Moon. Before this historic landing, many astrophysicists feared that the Moon was blanketed by a deep sea of powdery dust that would swallow any heavy vehicle whole! Surveyor's tripod footpads and telemetry proved the basalt regolith was solid and firm, paving the way for Apollo 11's Neil Armstrong and Buzz Aldrin to safely step onto the lunar surface three years later.",
        bn: "১৯৬৬ সালের ২ জুন, সার্ভেয়ার ১ ওশেনাস প্রোসেলোরামে নেমে মানবজাতির প্রথম মৃদু চন্দ্রাবতরণ সম্পন্ন করে। এই অভিযানের আগে বহু বিজ্ঞানী আশঙ্কা করেছিলেন যে চাঁদের মাটি এক গভীর ধূলিসমুদ্র, যাতে যেকোনো মহাকাশযান ডুবে যাবে! কিন্তু সার্ভেয়ার ১-এর ট্রাইপড পদচিহ্ন ও টেলিমেট্রি প্রমাণ করে যে চাঁদের মাটি শক্ত ও নিরাপদ, যা ৩ বছর পর অ্যাপোলো ১১ নভোচারীদের নিরাপদে অবতরণের পথ সুগম করে।"
      },
      moon_quest_pioneer: {
        en: "On June 2, 1966, Surveyor 1 touched down on Oceanus Procellarum, marking the first successful American soft landing on the Moon. Before this historic landing, many astrophysicists feared that the Moon was blanketed by a deep sea of powdery dust that would swallow any heavy vehicle whole! Surveyor's tripod footpads and telemetry proved the basalt regolith was solid and firm, paving the way for Apollo 11's Neil Armstrong and Buzz Aldrin to safely step onto the lunar surface three years later.",
        bn: "১৯৬৬ সালের ২ জুন, সার্ভেয়ার ১ ওশেনাস প্রোসেলোরামে নেমে মানবজাতির প্রথম মৃদু চন্দ্রাবতরণ সম্পন্ন করে। এই অভিযানের আগে বহু বিজ্ঞানী আশঙ্কা করেছিলেন যে চাঁদের মাটি এক গভীর ধূলিসমুদ্র, যাতে যেকোনো মহাকাশযান ডুবে যাবে! কিন্তু সার্ভেয়ার ১-এর ট্রাইপড পদচিহ্ন ও টেলিমেট্রি প্রমাণ করে যে চাঁদের মাটি শক্ত ও নিরাপদ, যা ৩ বছর পর অ্যাপোলো ১১ নভোচারীদের নিরাপদে অবতরণের পথ সুগম করে।"
      },
      apollo_lm: {
        en: "On July 20, 1969, Apollo 11's Lunar Module 'Eagle' touched down at Mare Tranquillitatis: 'The Eagle has landed.' To conserve precious Delta-V propellant according to Tsiolkovsky's Rocket Equation, Neil Armstrong and Buzz Aldrin deliberately sacrificed the heavy golden Descent Stage, leaving it on the Moon forever as an eternal monument while the lightweight Ascent Stage blasted off to carry humanity's pioneers home.",
        bn: "১৯৬৯ সালের ২০ জুলাই, অ্যাপোলো ১১-এর লুনার মডিউল 'ঈগল' প্রশান্তি সাগরে অবতরণ করে। রকেট সমীকরণ অনুযায়ী ডেল্টা-ভি সঞ্চয় করতে নীল আর্মস্ট্রং ও বাজ অলড্রিন ভারী গোল্ডেন ডিসেন্ট স্টেজটিকে চাঁদের বুকে স্থায়ী স্মৃতিস্তম্ভ হিসেবে রেখে আসেন, যাতে হালকা অ্যাসেন্ট স্টেজটি নিরাপদে পৃথিবীতে ফিরে যেতে পারে।"
      },
      moon_quest_apollo11: {
        en: "On July 20, 1969, Apollo 11's Lunar Module 'Eagle' touched down at Mare Tranquillitatis: 'The Eagle has landed.' To conserve precious Delta-V propellant according to Tsiolkovsky's Rocket Equation, Neil Armstrong and Buzz Aldrin deliberately sacrificed the heavy golden Descent Stage, leaving it on the Moon forever as an eternal monument while the lightweight Ascent Stage blasted off to carry humanity's pioneers home.",
        bn: "১৯৬৯ সালের ২০ জুলাই, অ্যাপোলো ১১-এর লুনার মডিউল 'ঈগল' প্রশান্তি সাগরে অবতরণ করে। রকেট সমীকরণ অনুযায়ী ডেল্টা-ভি সঞ্চয় করতে নীল আর্মস্ট্রং ও বাজ অলড্রিন ভারী গোল্ডেন ডিসেন্ট স্টেজটিকে চাঁদের বুকে স্থায়ী স্মৃতিস্তম্ভ হিসেবে রেখে আসেন, যাতে হালকা অ্যাসেন্ট স্টেজটি নিরাপদে পৃথিবীতে ফিরে যেতে পারে।"
      },
      surveyor3: {
        en: "Surveyor 3 landed on the Moon in April 1967 inside a 200-meter crater. In November 1969, Apollo 12 astronauts Pete Conrad and Alan Bean executed a precision pinpoint landing just 180 meters away and walked over to Surveyor 3! They unbolted its optical television camera and sampling scoop to return them to Earth, creating the first and only extraterrestrial archaeological recovery in human history.",
        bn: "১৯৬৭ সালের এপ্রিলে সার্ভেয়ার ৩ চাঁদের বুকে নামে। ১৯৬৯ সালের নভেম্বরে অ্যাপোলো ১২-এর নভোচারীরা মাত্র ১৮০ মিটার দূরে নিখুঁত অবতরণ করে হেঁটে সার্ভেয়ার ৩-এর কাছে পৌঁছান! তারা এর টিভি ক্যামেরা ও স্যাম্পলিং স্কুপ খুলে পৃথিবীতে ফিরিয়ে আনেন, যা মানব ইতিহাসের একমাত্র বহির্বিশ্ব প্রত্নতাত্ত্বিক পুনরুদ্ধার অভিযান।"
      },
      moon_quest_surveyor3_retrieval: {
        en: "Surveyor 3 landed on the Moon in April 1967 inside a 200-meter crater. In November 1969, Apollo 12 astronauts Pete Conrad and Alan Bean executed a precision pinpoint landing just 180 meters away and walked over to Surveyor 3! They unbolted its optical television camera and sampling scoop to return them to Earth, creating the first and only extraterrestrial archaeological recovery in human history.",
        bn: "১৯৬৭ সালের এপ্রিলে সার্ভেয়ার ৩ চাঁদের বুকে নামে। ১৯৬৯ সালের নভেম্বরে অ্যাপোলো ১২-এর নভোচারীরা মাত্র ১৮০ মিটার দূরে নিখুঁত অবতরণ করে হেঁটে সার্ভেয়ার ৩-এর কাছে পৌঁছান! তারা এর টিভি ক্যামেরা ও স্যাম্পলিং স্কুপ খুলে পৃথিবীতে ফিরিয়ে আনেন, যা মানব ইতিহাসের একমাত্র বহির্বিশ্ব প্রত্নতাত্ত্বিক পুনরুদ্ধার অভিযান।"
      },
      lrv_station: {
        en: "During Apollo 15 in 1971, astronauts David Scott and James Irwin drove the first Lunar Roving Vehicle (LRV)—an electric buggy with wire-mesh tires and a T-handle fly-by-wire controller built by Boeing and GM. The buggy traversed over 27.8 kilometers through the Apennine mountains, allowing astronauts to collect pristine 4-billion-year-old volcanic samples that revolutionized planetary geology.",
        bn: "১৯৭১ সালের অ্যাপোলো ১৫ মিশনে নভোচারীরা প্রথমবারের মতো লুনার রোভিং ভেহিকল (LRV) মুন বাগি ড্রাইভ করেন। বোয়িং ও জিএম-এর তৈরি এই ইলেকট্রিক বাগি চড়ে নভোচারীরা অ্যাপেনাইন পাহাড়ি অঞ্চলে ২৭.৮ কিলোমিটার পথ পাড়ি দেন এবং চাঁদের ৪ বিলিয়ন বছরের প্রাচীন আগ্নেয় শিলা নমুনা সংগ্রহ করেন।"
      },
      moon_quest_lrv_buggy: {
        en: "During Apollo 15 in 1971, astronauts David Scott and James Irwin drove the first Lunar Roving Vehicle (LRV)—an electric buggy with wire-mesh tires and a T-handle fly-by-wire controller built by Boeing and GM. The buggy traversed over 27.8 kilometers through the Apennine mountains, allowing astronauts to collect pristine 4-billion-year-old volcanic samples that revolutionized planetary geology.",
        bn: "১৯৭১ সালের অ্যাপোলো ১৫ মিশনে নভোচারীরা প্রথমবারের মতো লুনার রোভিং ভেহিকল (LRV) মুন বাগি ড্রাইভ করেন। বোয়িং ও জিএম-এর তৈরি এই ইলেকট্রিক বাগি চড়ে নভোচারীরা অ্যাপেনাইন পাহাড়ি অঞ্চলে ২৭.৮ কিলোমিটার পথ পাড়ি দেন এবং চাঁদের ৪ বিলিয়ন বছরের প্রাচীন আগ্নেয় শিলা নমুনা সংগ্রহ করেন।"
      },
      lcross_ice: {
        en: "In 2009, NASA's LCROSS kinetic impactor slammed into the permanently shadowed Cabeus crater near the lunar South Pole at 9,000 km/h. Instruments detected 155 kg of water ice and vapor billowing into space, proving that billions of kilograms of ancient water ice remain preserved in the Moon's polar cold traps to fuel humanity's permanent off-world future.",
        bn: "২০০৯ সালে নাসার এলক্রস মহাকাশযান চাঁদের দক্ষিণ মেরুর অন্ধকার ক্যাবিয়াস গহ্বরে ৯,০০০ কিমি/ঘণ্টা বেগে আছড়ে পড়ে। পর্যবেক্ষণে ১৫৫ কেজি জলীয় বরফের বাষ্প মেঘ শনাক্ত হয়, যা প্রমাণ করে চাঁদের মেরু অঞ্চলে বিলিয়ন কেজি পানি জমা আছে যা ভবিষ্যতের মহাকাশ অভিযাত্রীদের জ্বালানি ও অক্সিজেন জোগাবে।"
      },
      moon_quest_lcross_ice: {
        en: "In 2009, NASA's LCROSS kinetic impactor slammed into the permanently shadowed Cabeus crater near the lunar South Pole at 9,000 km/h. Instruments detected 155 kg of water ice and vapor billowing into space, proving that billions of kilograms of ancient water ice remain preserved in the Moon's polar cold traps to fuel humanity's permanent off-world future.",
        bn: "২০০৯ সালে নাসার এলক্রস মহাকাশযান চাঁদের দক্ষিণ মেরুর অন্ধকার ক্যাবিয়াস গহ্বরে ৯,০০০ কিমি/ঘণ্টা বেগে আছড়ে পড়ে। পর্যবেক্ষণে ১৫৫ কেজি জলীয় বরফের বাষ্প মেঘ শনাক্ত হয়, যা প্রমাণ করে চাঁদের মেরু অঞ্চলে বিলিয়ন কেজি পানি জমা আছে যা ভবিষ্যতের মহাকাশ অভিযাত্রীদের জ্বালানি ও অক্সিজেন জোগাবে।"
      },
      artemis_beacon: {
        en: "The Artemis Base Camp establishes humanity's permanent habitat at the lunar South Pole. Powered by polar solar towers and interconnected with optical laser relays, Artemis acts as the vital gateway where astronauts and rovers live, research lunar science, and prepare for the long journey to Mars.",
        bn: "আর্টেমিস বেস ক্যাম্প চাঁদের দক্ষিণ মেরুতে মানবজাতির প্রথম স্থায়ী বসতি স্থাপন করছে। সৌর টাওয়ার ও অপটিক্যাল লেজার যোগাযোগে সমৃদ্ধ এই ঘাঁটি থেকে নভোচারী ও রোভার দল বিজ্ঞানের নতুন দিগন্ত উন্মোচন করবে এবং মঙ্গলে মানুষের যাত্রার প্রস্তুতি গ্রহণ করবে।"
      },
      moon_quest_artemis_base: {
        en: "The Artemis Base Camp establishes humanity's permanent habitat at the lunar South Pole. Powered by polar solar towers and interconnected with optical laser relays, Artemis acts as the vital gateway where astronauts and rovers live, research lunar science, and prepare for the long journey to Mars.",
        bn: "আর্টেমিস বেস ক্যাম্প চাঁদের দক্ষিণ মেরুতে মানবজাতির প্রথম স্থায়ী বসতি স্থাপন করছে। সৌর টাওয়ার ও অপটিক্যাল লেজার যোগাযোগে সমৃদ্ধ এই ঘাঁটি থেকে নভোচারী ও রোভার দল বিজ্ঞানের নতুন দিগন্ত উন্মোচন করবে এবং মঙ্গলে মানুষের যাত্রার প্রস্তুতি গ্রহণ করবে।"
      },
      oppy_rover: {
        en: "In January 2004, Opportunity (MER-B) landed inside Eagle Crater on Meridiani Planum on a planned 90-sol mission. Defying all odds, the resilient rover operated for 5,111 sols (over 14 years), traveling an interplanetary marathon of 45.16 kilometers across the Martian dunes until resting at Perseverance Valley.",
        bn: "২০০৪ সালের জানুয়ারিতে অপরচুনিটি রোভার মঙ্গলের ঈগল গহ্বরে মাত্র ৯০ সলের একটি মিশনে নামে। সমস্ত প্রতিকূলতা জয় করে রোভারটি টানা ৫,১১১ সল (১৪ বছরের বেশি) সচল থাকে এবং লাল গ্রহের বুকে ৪৫.১৬ কিলোমিটার পথ পাড়ি দিয়ে পারসিভেরেন্স ভ্যালিতে নিজের চিরস্থায়ী বিশ্রামস্থল খুঁজে নেয়।"
      },
      mission_locate: {
        en: "In January 2004, Opportunity (MER-B) landed inside Eagle Crater on Meridiani Planum on a planned 90-sol mission. Defying all odds, the resilient rover operated for 5,111 sols (over 14 years), traveling an interplanetary marathon of 45.16 kilometers across the Martian dunes until resting at Perseverance Valley.",
        bn: "২০০৪ সালের জানুয়ারিতে অপরচুনিটি রোভার মঙ্গলের ঈগল গহ্বরে মাত্র ৯০ সলের একটি মিশনে নামে। সমস্ত প্রতিকূলতা জয় করে রোভারটি টানা ৫,১১১ সল (১৪ বছরের বেশি) সচল থাকে এবং লাল গ্রহের বুকে ৪৫.১৬ কিলোমিটার পথ পাড়ি দিয়ে পারসিভেরেন্স ভ্যালিতে নিজের চিরস্থায়ী বিশ্রামস্থল খুঁজে নেয়।"
      },
      hematite_blueberries: {
        en: "Using its microscopic imager and Alpha Particle X-Ray Spectrometer (APXS), Opportunity discovered millions of tiny iron-rich spherules nicknamed 'Blueberries'. Spectral analysis proved they were crystalline hematite—minerals that only form in liquid water—providing undeniable proof that liquid rivers once flowed on Mars!",
        bn: "মাইক্রোস্কোপিক ক্যামেরা ও এপিএক্সএস স্পেকট্রোমিটার দিয়ে অপরচুনিটি কোটি কোটি ক্ষুদ্র গোলক আবিষ্কার করে যার নাম দেওয়া হয় 'ব্লুবেরি'। পরীক্ষায় প্রমাণিত হয় এগুলো ক্রিস্টালাইন হেমাটাইট, যা কেবল পানির প্রবাহে গঠিত হতে পারে—অর্থাৎ প্রাচীন মঙ্গলে তরল পানির নদী ও হ্রদ ছিল!"
      },
      mission_blueberries: {
        en: "Using its microscopic imager and Alpha Particle X-Ray Spectrometer (APXS), Opportunity discovered millions of tiny iron-rich spherules nicknamed 'Blueberries'. Spectral analysis proved they were crystalline hematite—minerals that only form in liquid water—providing undeniable proof that liquid rivers once flowed on Mars!",
        bn: "মাইক্রোস্কোপিক ক্যামেরা ও এপিএক্সএস স্পেকট্রোমিটার দিয়ে অপরচুনিটি কোটি কোটি ক্ষুদ্র গোলক আবিষ্কার করে যার নাম দেওয়া হয় 'ব্লুবেরি'। পরীক্ষায় প্রমাণিত হয় এগুলো ক্রিস্টালাইন হেমাটাইট, যা কেবল পানির প্রবাহে গঠিত হতে পারে—অর্থাৎ প্রাচীন মঙ্গলে তরল পানির নদী ও হ্রদ ছিল!"
      },
      rat_grind_spot: {
        en: "Opportunity carried the Rock Abrasion Tool (RAT)—a diamond-resin grinding wheel spinning at 3,000 RPM. On rocks like 'Esperance', RAT shaved away weathered iron oxide to reveal unweathered bedrock rich in clay minerals, proving that ancient Martian water was neutral-pH, clean, and potentially habitable for microbial life.",
        bn: "অপরচুনিটি রোভারে ছিল রক অ্যাব্রেশন টুল (র‌্যাট)—হীরকখচিত গ্রাইন্ডিং হুইল যা ৩,০০০ আরপিএম গতিতে ঘোরে। 'এস্পেরেন্স' শিলা কেটে রোভারটি ভেতরের অবিকৃত শিলা পরীক্ষা করে এবং মাটির খনিজ আবিষ্কার করে, যা প্রমাণ করে প্রাচীন মঙ্গলের পানি ছিল বিশুদ্ধ এবং প্রাণের উপযোগী।"
      },
      mission_rat: {
        en: "Opportunity carried the Rock Abrasion Tool (RAT)—a diamond-resin grinding wheel spinning at 3,000 RPM. On rocks like 'Esperance', RAT shaved away weathered iron oxide to reveal unweathered bedrock rich in clay minerals, proving that ancient Martian water was neutral-pH, clean, and potentially habitable for microbial life.",
        bn: "অপরচুনিটি রোভারে ছিল রক অ্যাব্রেশন টুল (র‌্যাট)—হীরকখচিত গ্রাইন্ডিং হুইল যা ৩,০০০ আরপিএম গতিতে ঘোরে। 'এস্পেরেন্স' শিলা কেটে রোভারটি ভেতরের অবিকৃত শিলা পরীক্ষা করে এবং মাটির খনিজ আবিষ্কার করে, যা প্রমাণ করে প্রাচীন মঙ্গলের পানি ছিল বিশুদ্ধ এবং প্রাণের উপযোগী।"
      },
      mossbauer: {
        en: "InSight touched down in 2018 equipped with the SEIS seismometer dome. Listening deep into the Martian mantle through 1,319 Marsquakes, InSight mapped the crustal layers and discovered that Mars has a molten, liquid metallic core—unraveling the deep geological secrets of the Red Planet.",
        bn: "২০১৮ সালে ইনসাইট ল্যান্ডার মঙ্গলে নেমে সিসমোমিটার এসইআইএস চালু করে। গ্রহের অভ্যন্তরে ১,৩১৯টি মার্সকোয়েক (মঙ্গলকম্পন) পর্যবেক্ষণ করে ইনসাইট প্রমাণ করে যে মঙ্গলের কেন্দ্রে তরল ধাতব কোর বা কেন্দ্র রয়েছে।"
      },
      mission_mossbauer: {
        en: "InSight touched down in 2018 equipped with the SEIS seismometer dome. Listening deep into the Martian mantle through 1,319 Marsquakes, InSight mapped the crustal layers and discovered that Mars has a molten, liquid metallic core—unraveling the deep geological secrets of the Red Planet.",
        bn: "২০১৮ সালে ইনসাইট ল্যান্ডার মঙ্গলে নেমে সিসমোমিটার এসইআইএস চালু করে। গ্রহের অভ্যন্তরে ১,৩১৯টি মার্সকোয়েক (মঙ্গলকম্পন) পর্যবেক্ষণ করে ইনসাইট প্রমাণ করে যে মঙ্গলের কেন্দ্রে তরল ধাতব কোর বা কেন্দ্র রয়েছে।"
      },
      storm_station: {
        en: "In June 2018, an enormous planet-encircling dust storm swallowed Mars. Atmospheric optical depth Tau surged to 10.8, extinguishing 99.998% of sunlight. Solar generation collapsed to only 22 Wh, and Opportunity sent its final poetic telemetry: 'My battery is low and it is getting dark.'",
        bn: "২০১৮ সালের জুনে এক ভয়াবহ বিশ্বব্যাপী ধূলিঝড় মঙ্গলকে ঢেকে ফেলে। বায়ুমণ্ডলের অপটিক্যাল টাউ ১০.৮-এ পৌঁছায় এবং ৯৯.৯৯৮% সূর্যালোক ঢেকে যায়। সোলার প্যানেলের শক্তি মাত্র ২২ ওয়াটে নেমে আসে এবং অপরচুনিটি তার বিদায়ী বার্তা পাঠায়: 'আমার ব্যাটারি কমে গেছে এবং চারপাশ অন্ধকার হয়ে আসছে।'"
      },
      mission_storm: {
        en: "In June 2018, an enormous planet-encircling dust storm swallowed Mars. Atmospheric optical depth Tau surged to 10.8, extinguishing 99.998% of sunlight. Solar generation collapsed to only 22 Wh, and Opportunity sent its final poetic telemetry: 'My battery is low and it is getting dark.'",
        bn: "২০১৮ সালের জুনে এক ভয়াবহ বিশ্বব্যাপী ধূলিঝড় মঙ্গলকে ঢেকে ফেলে। বায়ুমণ্ডলের অপটিক্যাল টাউ ১০.৮-এ পৌঁছায় এবং ৯৯.৯৯৮% সূর্যালোক ঢেকে যায়। সোলার প্যানেলের শক্তি মাত্র ২২ ওয়াটে নেমে আসে এবং অপরচুনিটি তার বিদায়ী বার্তা পাঠায়: 'আমার ব্যাটারি কমে গেছে এবং চারপাশ অন্ধকার হয়ে আসছে।'"
      },
      blackbox_core: {
        en: "Launched in 1977, Voyager 1 is cruising through interstellar space over 24.3 billion kilometers away. Onboard is the Golden Record—a gold-plated copper disc holding Earth's sounds, music, and spoken greetings in 55 languages including Bengali ('নমস্কার! বিশ্বে শান্তি হোক'), voyaging into eternity as humanity's eternal love letter to the stars.",
        bn: "১৯৭৭ সালে উৎক্ষেপিত ভয়েজার ১ এখন পৃথিবী থেকে ২৪.৩ বিলিয়ন কিলোমিটার দূরে আন্তঃনাক্ষত্রিক মহাকাশে ছুটে চলেছে। এতে সংরক্ষিত আছে গোল্ডেন রেকর্ড—যার মধ্যে রয়েছে পৃথিবীর সুর, শব্দ এবং বাংলাসহ ৫৫টি ভাষায় শুভেচ্ছা বার্তা ('নমস্কার! বিশ্বে শান্তি হোক')।"
      },
      mission_blackbox: {
        en: "Launched in 1977, Voyager 1 is cruising through interstellar space over 24.3 billion kilometers away. Onboard is the Golden Record—a gold-plated copper disc holding Earth's sounds, music, and spoken greetings in 55 languages including Bengali ('নমস্কার! বিশ্বে শান্তি হোক'), voyaging into eternity as humanity's eternal love letter to the stars.",
        bn: "১৯৭৭ সালে উৎক্ষেপিত ভয়েজার ১ এখন পৃথিবী থেকে ২৪.৩ বিলিয়ন কিলোমিটার দূরে আন্তঃনাক্ষত্রিক মহাকাশে ছুটে চলেছে। এতে সংরক্ষিত আছে গোল্ডেন রেকর্ড—যার মধ্যে রয়েছে পৃথিবীর সুর, শব্দ এবং বাংলাসহ ৫৫টি ভাষায় শুভেচ্ছা বার্তা ('নমস্কার! বিশ্বে শান্তি হোক')।"
      }
    };

    const entry = stories[key] || stories[artifact?.id] || stories[artifact?.missionId];
    if (entry) {
      return isBn ? entry.bn : entry.en;
    }
    return isBn ? (artifact?.description || 'প্রত্নতাত্ত্বিক নিদর্শন ঐতিহাসিক নথিপত্র পর্যালোচনা সম্পন্ন।') : (artifact?.description || 'Historical NASA archaeological survey record logged.');
  }

  function resolveMissionIdFromScan(scanId) {
    if (['oppy_rover', 'pancam', 'mini_tes', 'solar_array'].includes(scanId)) return 'mission_locate';
    if (scanId === 'hematite_blueberries') return 'mission_blueberries';
    if (['rat', 'rat_grind_spot'].includes(scanId)) return 'mission_rat';
    if (['mossbauer', 'insight_lander', 'artifact_insight_lander'].includes(scanId)) return 'mission_mossbauer';
    if (scanId === 'storm_station') return 'mission_storm';
    if (['blackbox_core', 'voyager1', 'artifact_voyager1', 'golden_record'].includes(scanId)) return 'mission_blackbox';

    if (['surveyor1', 'artifact_surveyor1'].includes(scanId)) return 'moon_quest_pioneer';
    if (['apollo_lm', 'artifact_apollo_lm'].includes(scanId)) return 'moon_quest_apollo11';
    if (['surveyor3', 'artifact_surveyor3'].includes(scanId)) return 'moon_quest_surveyor3_retrieval';
    if (['lrv_station', 'lrv_camera', 'lrv_antenna', 'lrv_controller'].includes(scanId)) return 'moon_quest_lrv_buggy';
    if (['lcross_ice', 'artifact_lcross_ice'].includes(scanId)) return 'moon_quest_lcross_ice';
    if (['artemis_beacon', 'artifact_artemis_beacon'].includes(scanId)) return 'moon_quest_artemis_base';

    const found = ALL_ARCHAEOLOGICAL_ARTIFACTS.find(a => a.id === scanId || a.id === `artifact_${scanId}`);
    return found?.missionId || null;
  }

  let activeBillboardArtifact = null;
  let billboardTypewriterInterval = null;
  const hasShownBillboardForMission = new Set();

  function showRelicBillboard(artifact) {
    // Holographic History Billboard overlay completely removed per user request: "remove this page"
    return;

    const isBn = questManager.currentLanguage === 'bn';
    const mission = [...KIDS_MISSIONS_MARS, ...KIDS_MISSIONS_MOON].find(m => m.id === missionId);

    const titleElem = document.getElementById('billboard-relic-title');
    const yearElem = document.getElementById('billboard-relic-year');
    const coordsElem = document.getElementById('billboard-coords-tag');
    const iconElem = document.getElementById('billboard-relic-icon');
    const typewriterElem = document.getElementById('billboard-typewriter-text');
    const statusMsg = document.getElementById('billboard-status-msg');
    const scanBtn = document.getElementById('btn-billboard-scan');

    if (titleElem) titleElem.innerText = isBn ? (mission?.title_bn || artifact.title) : artifact.title;
    if (yearElem) yearElem.innerText = mission?.stationYear ? `MISSION ARCHIVE • YEAR ${mission.stationYear}` : 'NASA HISTORICAL ARCHIVE';
    if (coordsElem && artifact.coords) coordsElem.innerText = `LOC: X: ${artifact.coords.x.toFixed(1)}m | Z: ${artifact.coords.z.toFixed(1)}m`;
    if (iconElem) iconElem.innerText = mission?.icon || '🛰️';
    if (statusMsg) statusMsg.innerText = isBn ? 'ঐতিহাসিক প্রত্নতাত্ত্বিক লক্ষ্যস্থল শনাক্ত • স্ক্যানের জন্য প্রস্তুত' : 'ARCHAEOLOGICAL RELIC TARGET LOCKED • READY FOR SCAN';
    if (scanBtn) {
      scanBtn.innerHTML = `<span>🔍 ${isBn ? 'রিলিক স্ক্যান ও মিশন সম্পন্ন করো ➔' : 'SCAN RELIC & COMPLETE MISSION ➔'}</span>`;
    }

    const storyText = getRelicHistoryStory(artifact, isBn);
    if (typewriterElem) typewriterElem.innerText = '';

    overlay.style.display = 'flex';
    martianAudio.playUiAlert?.();

    // Word-by-word sentence typewriter animation
    if (billboardTypewriterInterval) clearInterval(billboardTypewriterInterval);
    const words = storyText.split(' ');
    let wordIdx = 0;
    billboardTypewriterInterval = setInterval(() => {
      if (wordIdx < words.length) {
        if (typewriterElem) {
          typewriterElem.innerText += (wordIdx === 0 ? '' : ' ') + words[wordIdx];
        }
        if (wordIdx % 2 === 0) {
          martianAudio.playScannerBeep?.(false);
        }
        wordIdx++;
      } else {
        clearInterval(billboardTypewriterInterval);
        billboardTypewriterInterval = null;
      }
    }, 45);
  }

  function hideRelicBillboard() {
    window.__isBillboardActive = false;
    if (billboardTypewriterInterval) {
      clearInterval(billboardTypewriterInterval);
      billboardTypewriterInterval = null;
    }
    const overlay = document.getElementById('mission-billboard-overlay');
    if (overlay) overlay.style.display = 'none';
    activeBillboardArtifact = null;
  }
  // Guarantee billboard starts completely hidden
  hideRelicBillboard();

  let isAdvancingMission = false;
  function advanceMissionWithRocketProgression(currentMissionId) {
    if (!currentMissionId || isAdvancingMission) return;
    isAdvancingMission = true;

    hideRelicBillboard();
    // Complete mission and show the Discovery Modal so children can understand and celebrate what they found!
    questManager.markMissionCompleted(currentMissionId, true);

    try {
      localStorage.setItem('nasa_completed_missions', JSON.stringify([...questManager.completedMissions]));
    } catch(e) {}

    const missions = questManager.activeMissionsList;
    const currentIdx = missions.findIndex(m => m.id === currentMissionId);
    const nextMission = (currentIdx !== -1 && currentIdx + 1 < missions.length) ? missions[currentIdx + 1] : null;

    if (nextMission) {
      questManager.selectedMissionId = nextMission.id;
    } else {
      questManager.selectedMissionId = 'node_finish';
    }

    questManager.renderMissionsList();
    questManager.renderBadgesShowcase();

    // Check if all missions on this planet are complete
    const allPlanetCompleted = missions.every(m => questManager.completedMissions.has(m.id));
    if (allPlanetCompleted) {
      setTimeout(() => {
        document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
        questManager.showCertificateModal();
      }, 3500);
    }
    isAdvancingMission = false;
  }

    function spawnRoverForMission(missionId, forcedPlanet = null) {
    if (forcedPlanet && questManager.currentPlanet !== forcedPlanet) {
      questManager.setPlanet(forcedPlanet);
    }

    if (!missionId || missionId === 'node_start' || missionId === 'node_finish') {
      const activeMissions = questManager.activeMissionsList;
      const firstUncompleted = activeMissions.find(m => !questManager.completedMissions.has(m.id));
      missionId = firstUncompleted ? firstUncompleted.id : activeMissions[0].id;
    }

    closeGameHub();
    setFullscreenMode(true, false);
    // Explicitly guarantee roadmap modal is closed during active gameplay
    document.getElementById('missions-modal-backdrop')?.classList.remove('active');
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');

    const isMoonMission = forcedPlanet === 'moon'
      || KIDS_MISSIONS_MOON.some((m) => m.id === missionId)
      || (typeof missionId === 'string' && (missionId.startsWith('moon_') || missionId === 'apollo11'));
    const isDeepSpace = forcedPlanet === 'deepspace'
      || missionId === 'mission_blackbox'
      || missionId === 'voyager1';
    const targetPlanet = isDeepSpace ? 'deepspace' : (isMoonMission ? 'moon' : 'mars');

    if (currentPlanet !== targetPlanet) {
      switchCelestialBody(targetPlanet, false);
    }

    // Cancel any active transitions so camera stays firmly in front view
    sceneManager.cancelTransition?.();

    questManager.setSelectedMission(missionId);
    updateWaypointHUD();

    if (targetPlanet === 'deepspace') {
      setCameraMode('orbit');
      return;
    }

    const artifact = getActiveMissionArtifact(missionId);
    let targetX = 0;
    let targetZ = 0;
    if (artifact && artifact.coords) {
      targetX = artifact.coords.x;
      targetZ = artifact.coords.z;
    } else {
      targetX = targetPlanet === 'moon' ? 0.0 : 0.0;
      targetZ = targetPlanet === 'moon' ? -3.0 : 0.0;
    }

    // Spawn clean 32 meters away towards map center so rover faces directly at target beacon
    const spawnDist = 32.0;
    let dirToCenter = Math.atan2(-targetZ, -targetX);
    if (Math.hypot(targetX, targetZ) < 5.0) {
      dirToCenter = Math.PI * 0.75;
    }
    const spawnX = targetX + Math.cos(dirToCenter) * spawnDist;
    const spawnZ = targetZ + Math.sin(dirToCenter) * spawnDist;
    const spawnY = activeGetTerrainHeight ? activeGetTerrainHeight(spawnX, spawnZ) : 0;

    // Heading towards target relic so driving forward moves straight to the beacon
    const headingToTarget = Math.atan2(spawnX - targetX, spawnZ - targetZ);

    roverController.position.set(spawnX, spawnY, spawnZ);
    roverController.heading = headingToTarget;
    roverController.velocity = 0;
    if (roverController.rover) {
      roverController.rover.position.set(spawnX, spawnY, spawnZ);
      roverController.rover.rotation.y = headingToTarget + Math.PI;
    }

    // Set camera directly behind rover looking forward at the beacon (Front Mode)
    sceneManager.spherical.theta = headingToTarget;
    sceneManager.spherical.phi = 1.15;
    sceneManager.spherical.radius = 7.0;
    sceneManager.spherical.target.set(spawnX, spawnY + 0.6, spawnZ);

    if (sceneManager.targetState) {
      sceneManager.targetState.theta = headingToTarget;
      sceneManager.targetState.phi = 1.15;
      sceneManager.targetState.radius = 7.0;
      sceneManager.targetState.lookAt.set(spawnX, spawnY + 0.6, spawnZ);
    }
    sceneManager.setTarget(spawnX, spawnY + 0.6, spawnZ);
    sceneManager.updateCameraPosition();

    // Disable unwanted idle orbit drift so camera stays firmly behind rover
    sceneManager.setIdleDrift?.(false);
    setCameraMode('orbit');
    setMode('drive');

    // ONLY one chosen companion guider is visible!
    guideBotEscort.setVisible(false);
    kittyCompanion?.setVisible(true);
    kittyCompanion?.setTargetWaypoint(targetX, spawnY + 1.0, targetZ);

    // Set active waypoint beacon on scanner
    scanner.setActiveWaypoint(missionId);

    // Update waypoint HUD instruction: "GO THERE TO COMPLETE MISSION"
    const trackerHud = document.getElementById('waypoint-tracker-hud');
    const badgeElem = document.getElementById('waypoint-badge');
    const nameElem = document.getElementById('waypoint-name');
    const subElem = document.getElementById('waypoint-sub');
    const distElem = document.getElementById('waypoint-dist-val');
    const mission = [...KIDS_MISSIONS_MARS, ...KIDS_MISSIONS_MOON].find(m => m.id === missionId);
    const isBn = questManager.currentLanguage === 'bn';

    if (trackerHud) trackerHud.style.display = 'flex';
    if (badgeElem && mission) {
      badgeElem.innerText = isBn ? `লেভেল ${mission.level}` : `LEVEL ${mission.level}`;
    }
    if (nameElem && mission) {
      nameElem.innerText = isBn ? mission.title_bn : mission.title_en;
    }
    if (subElem) {
      subElem.innerText = isBn
        ? `👉 সেখানে যাও মিশন সম্পন্ন করতে • নির্দেশিত বিকনের দিকে ড্রাইভ করো`
        : `👉 GO THERE TO COMPLETE MISSION • DRIVE TOWARDS THE GLOWING BEACON`;
    }
    if (distElem) {
      distElem.innerText = `${spawnDist.toFixed(1)}m`;
    }

    martianAudio.playTelemetryTransmission?.();
    const botMsg = isBn
      ? `কমান্ডার! সামনের আলোকময় বিকনটির দিকে রোভার ড্রাইভ করো (~৩২ মিটার দূরে)। সেখানে পৌঁছে ঐতিহাসিক তথ্য ও স্ক্যান আনলক করো!`
      : `Commander! Drive your rover towards the glowing beacon ahead (~32m). Reach the site to reveal the historic Intel Billboard and complete the scan!`;

    // Expedition dispatch widget removed per user request
  }

  // Wire Billboard Buttons
  document.getElementById('btn-billboard-scan')?.addEventListener('click', () => {
    if (!activeBillboardArtifact) return;
    const artifact = activeBillboardArtifact;
    const currentMissionId = artifact.missionId;

    hideRelicBillboard();
    scanner.triggerManualScan(artifact.id);
    coinsManager.addCoins(150);
    advanceMissionWithRocketProgression(currentMissionId);
  });

  document.getElementById('billboard-close-btn')?.addEventListener('click', () => {
    hideRelicBillboard();
  });

  roverController.onProximityAlert = (artifact, dist) => {
    if (dist <= 4.5 && artifact) {
      activeRadarArtifact = artifact;
      if (radarHud) radarHud.style.display = 'flex';
      const isAlreadyLogged = artifact.missionId && questManager.completedMissions.has(artifact.missionId);

      if (isAlreadyLogged) {
        if (radarTitle) radarTitle.innerHTML = `<span style="color:#10b981;">✓ HISTORIC RELIC LOGGED:</span> ${artifact.title}`;
        if (radarSub) {
          radarSub.innerText = `${artifact.title} (${dist.toFixed(1)}m) • Press [E] or Click to Scan Again`;
        }
        if (radarScanBtn) {
          radarScanBtn.style.display = 'block';
          radarScanBtn.innerText = 'RESCAN ➔';
        }
      } else {
        if (radarTitle) radarTitle.innerText = `📍 TARGET: ${artifact.title}`;
        if (radarSub) {
          radarSub.innerText = `${artifact.title} (${dist.toFixed(1)}m) • Press [E] or Click to Scan`;
        }
        if (radarScanBtn) {
          radarScanBtn.style.display = 'block';
          radarScanBtn.innerText = 'SCAN ➔';
        }
      }
    } else if (!activeRadarArtifact || dist > 5.0) {
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
    if (['KeyE', 'e', 'E'].includes(e.code)) {
      if (activeRadarArtifact) {
        scanner.triggerManualScan(activeRadarArtifact.id);
      } else if (currentPlanet === 'deepspace') {
        miniGameManager.open('voyager1');
      }
    }

    // Interstellar Attitude Control (AACS Hydrazine Thrusters) for Voyager 1 with WASD
    if (currentPlanet === 'deepspace' && deepSpaceVoyager?.rover) {
      if (['KeyW', 'ArrowUp', 'w', 'W'].includes(e.code)) {
        deepSpaceVoyager.rover.rotation.x -= 0.05;
        martianAudio.playThrusterPuff?.();
      } else if (['KeyS', 'ArrowDown', 's', 'S'].includes(e.code)) {
        deepSpaceVoyager.rover.rotation.x += 0.05;
        martianAudio.playThrusterPuff?.();
      } else if (['KeyA', 'ArrowLeft', 'a', 'A'].includes(e.code)) {
        deepSpaceVoyager.rover.rotation.y -= 0.06;
        martianAudio.playThrusterPuff?.();
      } else if (['KeyD', 'ArrowRight', 'd', 'D'].includes(e.code)) {
        deepSpaceVoyager.rover.rotation.y += 0.06;
        martianAudio.playThrusterPuff?.();
      }
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
    const scannedMissionId = resolveMissionIdFromScan(scanId);

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
      scanId === 'golden_record' ||
      scanId === 'voyager_rtg' ||
      scanId === 'voyager_hga' ||
      scanId === 'voyager_iss' ||
      scanId === 'voyager_mag'
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

    if (scannedMissionId && !activeBillboardArtifact) {
      advanceMissionWithRocketProgression(scannedMissionId);
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
    } else if (pendingScanLabKey === 'voyager1' || currentPlanet === 'deepspace') {
      const isBn = questManager?.currentLanguage === 'bn';
      let scanDispatch = '';
      let badgeTitle = isBn ? 'ডিপ স্পেস টেলিমেট্রি' : 'DEEP SPACE TELEMETRY';

      if (scanId === 'voyager_hga') {
        badgeTitle = isBn ? 'হাই-গেইন ডিশ • ২২ ঘণ্টা ৩৪ মিনিট বিলম্ব' : '3.7M HIGH-GAIN DISH • 22H 34M DELAY';
        scanDispatch = selectedCommander === 'asha'
          ? (isBn
              ? 'কমান্ডার আশা: "এই ৩.৭ মিটার সাদা ডিশটি পৃথিবীমুখী তাক করা। আলোর গতিতে চলা রেডিও সিগন্যালও এখান থেকে নাসার ডিপ স্পেস নেটওয়ার্কে পৌঁছাতে ২২ ঘণ্টা ৩৪ মিনিট সময় নেয়!"'
              : 'Commander Asha: "This 3.7m parabolic dish focuses radio waves straight at Earth. Even traveling at light speed (300,000 km/s), it takes 22h 34m for each bit of telemetry to reach NASA\'s 70-meter dishes!"')
          : (isBn
              ? 'কমান্ডার লিও: "২৪.৩ বিলিয়ন কিমি দূর থেকে ভয়েজার ১ প্রতি সেকেন্ডে মাত্র ১৬০ বিট ডেটা পৃথিবীতে পাঠায়! পৃথিবী থেকে কোনো কমান্ড পাঠালে ফিরতি উত্তর পেতে ৪৫ ঘণ্টারও বেশি সময় লাগে!"'
              : 'Commander Leo: "Voyager 1 beams a whisper-thin 160 bits/sec radio signal across 24.3 billion km. A round-trip communication handshake takes over 45 hours!"');
      } else if (scanId === 'voyager_rtg') {
        badgeTitle = isBn ? 'পিউ-২৩৮ নিউক্লিয়ার ব্যাটারি (RTG)' : 'PU-238 NUCLEAR BATTERY (RTG)';
        scanDispatch = selectedCommander === 'asha'
          ? (isBn
              ? 'কমান্ডার আশা: "গভীর মহাশূন্যে সূর্যের আলো নেই, তাই সোলার প্যানেল কাজ করে না! প্লুটোনিয়াম-২৩৮-এর তেজস্ক্রিয় ক্ষয় তাপ বিদ্যুৎ উৎপাদন করে। প্রতি বছর ৪ ওয়াট ক্ষয় হয়ে এখন মাত্র ২৪৯ ওয়াট বাকি!"'
              : 'Commander Asha: "Solar panels produce 0 Watts in deep space! Three RTGs convert Plutonium-238 radioactive decay heat into electricity. Power drops 4W each year, down to just 249 Watts today!"')
          : (isBn
              ? 'কমান্ডার লিও: "নিউক্লিয়ার ব্যাটারিই ভয়েজার ১-এর জীবনরেখা! ২৪৯ ওয়াট শক্তি বাঁচাতে আমাদের অপ্রয়োজনীয় হিটার ও ক্যামেরা বন্ধ রাখতে হয় যাতে রেডিও ট্রান্সমিটার চলতে পারে!"'
              : 'Commander Leo: "Nuclear power keeps Voyager alive! With only 249 Watts left, we have to power down cameras and heaters so the radio transmitter has enough electricity to talk to Earth."');
      } else if (scanId === 'golden_record') {
        badgeTitle = isBn ? '১২-ইঞ্চি গোল্ডেন রেকর্ড' : '12-INCH GOLDEN RECORD';
        scanDispatch = selectedCommander === 'asha'
          ? (isBn
              ? 'কমান্ডার আশা: "এতে ৫৫টি ভাষার শুভেচ্ছা, পৃথিবীর বিভিন্ন শব্দ ও সুর রয়েছে—যার মধ্যে বাংলা শুভেচ্ছা ও বাঁশির সুর অন্তর্ভুক্ত। কোটি বছর ধরে এটি মহাশূন্যে ভেসে থাকবে!"'
              : 'Commander Asha: "Humanity\'s golden time capsule! Carrying greetings in 55 languages—including Bengali—sounds of Earth, and music like our bamboo flute, drifting eternally among the stars!"')
          : (isBn
              ? 'কমান্ডার লিও: "১৯৭৭ সালে কার্ল সেগানের দল এই গোল্ডেন রেকর্ডটি তৈরি করেন। কোনো বুদ্ধিমান ভিনগ্রহের প্রাণী এটি খুঁজে পেলে তারা পৃথিবীর মানুষের কণ্ঠ ও সঙ্গীত শুনতে পাবে!"'
              : 'Commander Leo: "Created in 1977 by Carl Sagan\'s team, the Golden Record holds the sounds and greetings of Earth for any extraterrestrial civilization that might discover it!"');
      } else if (scanId === 'voyager_iss') {
        badgeTitle = isBn ? 'আইএসএস ক্যামেরা • পেল ব্লু ডট' : 'ISS CAMERAS • PALE BLUE DOT';
        scanDispatch = selectedCommander === 'asha'
          ? (isBn
              ? 'কমান্ডার আশা: "১৯৯০ সালে ভয়েজার ১ ৬ বিলিয়ন কিমি দূর থেকে পৃথিবীর \'পেল ব্লু ডট\' ছবি তোলে। এরপর ব্যাটারি বাঁচাতে ক্যামেরা স্থায়ীভাবে বন্ধ করে দেওয়া হয়!"'
              : 'Commander Asha: "In 1990, Voyager 1 captured the famous \'Pale Blue Dot\' photo of Earth from 6 billion km away, then powered down its cameras forever to save 28 Watts for science instruments!"')
          : (isBn
              ? 'কমান্ডার লিও: "একটি নীল আলোকবিন্দু হিসেবে পৃথিবীকে দেখা যায় সেই ঐতিহাসিক ছবিতে। বর্তমানে পিচ-কালো মহাশূন্যে ক্যামেরার দরকার নেই, তাই এর ২৮ ওয়াট বিদ্যুৎ রেডিওতে দেওয়া হয়েছে!"'
              : 'Commander Leo: "Earth appears as a solitary blue pixel in that historic photo. Since space is pitch black here, the cameras were shut down to save 28 Watts for our radio telemetry!"');
      } else if (scanId === 'voyager_mag') {
        badgeTitle = isBn ? 'ম্যাগনেটোমিটার বুম (১৩ মিটার)' : '13M MAGNETOMETER BOOM';
        scanDispatch = selectedCommander === 'asha'
          ? (isBn
              ? 'কমান্ডার আশা: "১৩ মিটার দীর্ঘ এই বুমটি ২০১২ সালে নিশ্চিত করেছিল যে ভয়েজার ১ সৌরজগতের সীমানা (হেলিওপজ) পার হয়ে খোলা ইন্টারস্টেলার স্পেসে পৌঁছেছে!"'
              : 'Commander Asha: "This 13-meter boom proved in 2012 that Voyager 1 officially crossed the Heliopause (121 AU) and became humanity\'s first spacecraft to enter interstellar space!"')
          : (isBn
              ? 'কমান্ডার লিও: "এটি সৌর বায়ুর বাইরে নক্ষত্রের মধ্যবর্তী প্লাজমা ও চৌম্বক ক্ষেত্রের ঘনত্ব মেপে পৃথিবীতে রিয়েল-টাইম ডেটা পাঠাচ্ছে!"'
              : 'Commander Leo: "The Magnetometer measures cosmic magnetic fields beyond the solar wind, streaming interstellar plasma density data back to scientists on Earth!"');
      } else {
        badgeTitle = isBn ? 'ভয়েজার ১ কমিউনিকেশন সেন্টার' : 'VOYAGER 1 COMM CENTER';
        scanDispatch = selectedCommander === 'asha'
          ? (isBn
              ? 'কমান্ডার আশা (ঢাকা অ্যান্টেনা): "২৪.৩ বিলিয়ন কিমি দূর থেকে ভয়েজার ১ আমাদের ডেটা পাঠাচ্ছে! চলো সায়েন্স ল্যাবে গিয়ে পিউ-২৩৮ ব্যাটারি ব্যালেন্স করি এবং ২২ ঘণ্টার রেডিও হ্যান্ডশেক সম্পন্ন করি!"'
              : 'Commander Asha: "Signal locked across 24.3 billion km! Let\'s open the Science Lab to balance the Pu-238 RTG battery and broadcast the Golden Record!"')
          : (isBn
              ? 'কমান্ডার লিও (ফ্লোরিডা কনসোল): "২৪.৩ বিলিয়ন কিমি দূর থেকে ভয়েজার ১ ডেটা পাঠাচ্ছে! সায়েন্স ল্যাব ওপেন করে নিউক্লিয়ার পাওয়ার বাজেট ঠিক করো ও রেডিও হ্যান্ডশেক সম্পন্ন করো!"'
              : 'Commander Leo: "24.3 billion km away! Let\'s open the Science Lab to balance Voyager 1\'s decaying Pu-238 RTG power and play the Golden Record!"');
      }

      actorDirector.triggerCommsDialogue(
        selectedCommander,
        scanDispatch,
        badgeTitle,
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
  isFullscreenActive = false;

  function setFullscreenMode(active, triggerGuiderModal = false) {
    isFullscreenActive = active;
    document.body.classList.toggle('fullscreen-mode-active', active);

    const icon = document.getElementById('sidebar-toggle-icon');
    const btnLabel = document.getElementById('lbl-sidebar-btn');
    if (icon) icon.innerText = active ? '🔲' : '⛶';
    if (btnLabel) btnLabel.innerText = active ? 'Exit Full' : 'Fullscreen';

    if (active) {
      if (!document.fullscreenElement && document.documentElement?.requestFullscreen) {
        try {
          document.documentElement.requestFullscreen().catch(() => {});
        } catch (e) {}
      }
      martianAudio.playUiSwitch?.();
      if (triggerGuiderModal) {
        showGuiderBriefingModal();
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          document.exitFullscreen().catch(() => {});
        } catch (e) {}
      }
      martianAudio.playUiSwitch?.();
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
      botSpeech.innerHTML = `"Commander ${commanderTitle}! Fullscreen Immersive Mode is now <strong>ACTIVE</strong>. All telemetry consoles and rover controls are at your fingertips. Follow my guidance directives to pilot your rover, collect cosmic coins, scan relics, and complete the expedition!"`;
    }

    modal.classList.add('active');
    martianAudio.playUiAlert?.();
  }

  // Toggle button in header
  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFullscreenMode(!isFullscreenActive, false);
  });

  // Floating exit button in fullscreen mode
  document.getElementById('btn-exit-fullscreen-floating')?.addEventListener('click', () => {
    setFullscreenMode(false, false);
  });

  // Close Guider Modal buttons
  document.getElementById('guider-briefing-close-btn')?.addEventListener('click', () => {
    document.getElementById('guider-briefing-modal')?.classList.remove('active');
    martianAudio.playUiClick?.();
  });

  document.getElementById('btn-guider-lets-go')?.addEventListener('click', () => {
    document.getElementById('guider-briefing-modal')?.classList.remove('active');
    martianAudio.playUiConfirm?.();
    setMode('drive');
  });

  document.getElementById('btn-guider-view-roadmap')?.addEventListener('click', () => {
    document.getElementById('guider-briefing-modal')?.classList.remove('active');
    martianAudio.playUiClick?.();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });

  // Keyboard shortcut: Press 'F' to toggle Fullscreen
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      setFullscreenMode(!isFullscreenActive, false);
    }
  });

  // Detect when user exits browser fullscreen via ESC
  document.addEventListener('fullscreenchange', () => {
    isFullscreenActive = !!document.fullscreenElement;
    document.body.classList.toggle('fullscreen-mode-active', isFullscreenActive);
    const icon = document.getElementById('sidebar-toggle-icon');
    const btnLabel = document.getElementById('lbl-sidebar-btn');
    if (icon) icon.innerText = isFullscreenActive ? '🔲' : '⛶';
    if (btnLabel) btnLabel.innerText = isFullscreenActive ? 'Exit Full' : 'Fullscreen';
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
      if (scannerPanel) scannerPanel.style.display = 'flex';
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
      if (currentPlanet === 'deepspace') {
        if (scannerPanel) scannerPanel.style.display = 'flex';
        if (solSlider) solSlider.style.display = 'none';
        if (driveControls) driveControls.style.display = 'none';
        setCameraMode('orbit');
        setTarget(0, 1.8, 0);
      } else {
        if (scannerPanel) scannerPanel.style.display = 'none';
        if (solSlider) solSlider.style.display = 'none';
        if (driveControls) driveControls.style.display = 'flex';
        setCameraMode('orbit');
        setTarget(roverController.position.x, roverController.position.y + 0.6, roverController.position.z);
      }
    } else if (mode === 'pitch') {
      if (scannerPanel) scannerPanel.style.display = 'none';
      if (solSlider) solSlider.style.display = 'none';
      if (driveControls) driveControls.style.display = 'none';
      pitchDirector.start(currentPlanet === 'moon' ? 'moon' : 'mars');
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
  isHubActive = true;
  let heroInteractions = null;
  let hero3DOrrery = null;

  function openGameHub() {
    isHubActive = true;

    // 1. Sync cadet profile from onboarding input if present
    try {
      const nameInput = document.getElementById('aqua-cadet-name-input');
      const val = (nameInput && nameInput.value.trim()) || 'Cadet Explorer';
      const curAge = parseInt(localStorage.getItem('nasa_player_age'), 10) || 10;
      const chosenBot = localStorage.getItem('nasa_selected_bot') || window.__selectedBotId || 'echo';

      if (window.__isRegisteringNewCadet || !profileManager.getActiveProfile()) {
        profileManager.createProfile({
          name: val,
          age: curAge,
          botId: chosenBot
        });
        window.__isRegisteringNewCadet = false;
      } else {
        profileManager.updateActiveProfile({
          name: val,
          age: curAge,
          botId: chosenBot
        });
      }
      localStorage.removeItem('nasa_user_logged_out');
      window.setGameCompanion?.(chosenBot);
    } catch (err) {
      console.warn('Error syncing profile in openGameHub:', err);
    }

    // 2. Explicitly hide wizard modal & splash screen
    const modal = document.getElementById('aqua-guided-modal-backdrop');
    if (modal) {
      modal.classList.remove('active');
      modal.style.setProperty('display', 'none', 'important');
    }
    const splash = document.getElementById('aqua-splash-screen');
    if (splash) {
      splash.classList.remove('active');
      splash.classList.add('fading-out');
      splash.style.setProperty('display', 'none', 'important');
      splash.style.pointerEvents = 'none';
    }
    window.__isSplashActive = false;
    isSplashActive = false;

    document.querySelectorAll('.modal-backdrop.active').forEach((m) => {
      m.classList.remove('active');
      m.style.display = 'none';
    });

    // 3. Open Game Hub Screen
    if (gameHubScreen) {
      gameHubScreen.style.setProperty('display', 'grid', 'important');
      gameHubScreen.classList.add('active');
    }
    document.querySelectorAll('.hub-nav-item').forEach((item) => item.classList.remove('active'));
    document.getElementById('hub-tab-home')?.classList.add('active');
    const hubHeroBg = document.getElementById('hub-hero-bg');
    if (hubHeroBg) {
      hubHeroBg.classList.remove('nasa-eyes-active');
      hubHeroBg.classList.add('procedural-3d-active');
    }
    hero3DOrrery?.setActive(true);
    hero3DOrrery?.onResize?.();
    hero3DOrrery?.focusPlanet(selectedDestination || 'mars');
    martianAudio.playUiSwitch?.();

    profileManager.recordScreen('game-hub', { tab: 'home' });
    const inGameBack = document.getElementById('btn-in-game-back-to-hub');
    if (inGameBack) inGameBack.style.display = 'none';
  }

  function closeGameHub() {
    isHubActive = false;
    if (gameHubScreen) {
      gameHubScreen.classList.remove('active');
      gameHubScreen.style.display = 'none';
    }
    hero3DOrrery?.setActive(false);

    const inGameBack = document.getElementById('btn-in-game-back-to-hub');
    if (inGameBack) inGameBack.style.display = 'inline-flex';
    profileManager.recordScreen('game-3d', { planet: currentPlanet, mode: currentMode });
  }

  window.openGameHub = openGameHub;
  window.closeGameHub = closeGameHub;

  document.getElementById('tab-home-hub')?.addEventListener('click', (e) => {
    e.preventDefault();
    openGameHub();
  });

  function handleCloseCertificateAndReturnToHub() {
    martianAudio.playUiSwitch?.();
    const certModal = document.getElementById('certificate-modal-backdrop');
    if (certModal) certModal.classList.remove('active');

    // Also close any overlay modals, celebration, roadmap, discovery or scanner backdrops
    document.getElementById('celebration-modal-backdrop')?.classList.remove('active');
    document.getElementById('missions-modal-backdrop')?.classList.remove('active');
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    document.getElementById('modal-backdrop')?.classList.remove('active');
    document.getElementById('scan-modal-backdrop')?.classList.remove('active');
    hideRelicBillboard();

    // Cleanly exit fullscreen back to standard view
    setFullscreenMode(false, false);

    // Return to Home Hub unconditionally
    openGameHub();
  }

  if (questManager) {
    questManager.onCloseCertificate = handleCloseCertificateAndReturnToHub;
  }

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
  const hubCmdCardAsha = document.getElementById('hub-cmd-card-asha');
  const hubCmdCardLeo = document.getElementById('hub-cmd-card-leo');
  const badgeStatusAsha = document.getElementById('badge-status-asha');
  const badgeStatusLeo = document.getElementById('badge-status-leo');
  const ashaPointsVal = document.getElementById('asha-points-val');
  const leoPointsVal = document.getElementById('leo-points-val');
  const ashaRankVal = document.getElementById('asha-rank-val');
  const leoRankVal = document.getElementById('leo-rank-val');

  const startMissionBtn = document.getElementById('hero-start-mission-btn');
  const startCommanderName = document.getElementById('lbl-start-commander-name');
  const startDestSub = document.getElementById('lbl-start-dest-sub');
  const hubUserName = document.getElementById('lbl-hub-user-name');

  function updateCommanderUI() {
    const isAsha = selectedCommander === 'asha';

    // 1. Update First Page Commander Deck Cards
    if (hubCmdCardAsha) hubCmdCardAsha.classList.toggle('active', isAsha);
    if (hubCmdCardLeo) hubCmdCardLeo.classList.toggle('active', !isAsha);

    if (badgeStatusAsha) {
      badgeStatusAsha.className = `cmd-card-status-badge ${isAsha ? 'active-lead' : ''}`;
      badgeStatusAsha.innerText = isAsha ? '✓ ACTIVE LEAD' : 'SELECT LEAD';
    }
    if (badgeStatusLeo) {
      badgeStatusLeo.className = `cmd-card-status-badge ${!isAsha ? 'active-lead' : ''}`;
      badgeStatusLeo.innerText = !isAsha ? '✓ ACTIVE LEAD' : 'SELECT LEAD';
    }

    // 2. Update Live Points and Ranks
    const ashaPts = parseInt(localStorage.getItem('jdsn_asha_points') || '3250', 10);
    const leoPts = parseInt(localStorage.getItem('jdsn_leo_points') || '3410', 10);

    if (ashaPointsVal) ashaPointsVal.innerText = ashaPts.toLocaleString();
    if (leoPointsVal) leoPointsVal.innerText = leoPts.toLocaleString();

    if (ashaRankVal && leoRankVal) {
      if (ashaPts >= leoPts) {
        ashaRankVal.innerText = '#1';
        leoRankVal.innerText = '#2';
      } else {
        leoRankVal.innerText = '#1';
        ashaRankVal.innerText = '#2';
      }
    }

    if (charCardAsha) charCardAsha.classList.toggle('selected', isAsha);
    if (charCardLeo) charCardLeo.classList.toggle('selected', !isAsha);

    const drawerCmdAshaEl = document.getElementById('drawer-cmd-asha');
    const drawerCmdLeoEl = document.getElementById('drawer-cmd-leo');
    if (drawerCmdAshaEl) drawerCmdAshaEl.classList.toggle('active', isAsha);
    if (drawerCmdLeoEl) drawerCmdLeoEl.classList.toggle('active', !isAsha);

    if (startCommanderName) {
      startCommanderName.innerText = isAsha ? 'ASHA' : 'LEO';
    }

    if (startMissionBtn) {
      startMissionBtn.classList.toggle('leo-active', !isAsha);
    }

    if (hubUserName) {
      const callSign = localStorage.getItem('nasa_player_callsign') || 'CADET EXPLORER';
      hubUserName.innerText = `${callSign} • JDSN (${selectedCommander.toUpperCase()})`;
    }

    actorDirector.activeSpeaker = selectedCommander;
  }

  // Player Call Sign & Custom Identity
  const RANDOM_CALLSIGNS = [
    "CADET SHAIKOT", "ASTRO VOYAGER", "STELLAR NOVA", "ORBITAL ACE",
    "CYBER EAGLE", "NEBULA HUNTER", "SOLAR ROVER", "COSMIC SLEUTH",
    "RED PLANET ACE", "LUNAR DISCOVERER", "PULSAR SCOUT", "ZENITH PILOT"
  ];

  let playerCallSign = localStorage.getItem('nasa_player_callsign') || 'CADET EXPLORER';
  const callsignInput = document.getElementById('player-callsign-input');
  const drawerCallsignInput = document.getElementById('drawer-callsign-input');
  const randomCallsignBtn = document.getElementById('btn-random-callsign');
  const drawerRandomBtn = document.getElementById('btn-drawer-random-callsign');
  const drawerCadetName = document.getElementById('drawer-cadet-name-display');
  const certPlayerName = document.getElementById('cert-player-name');

  function updateCallSign(name) {
    playerCallSign = (name || 'CADET EXPLORER').trim().toUpperCase();
    localStorage.setItem('nasa_player_callsign', playerCallSign);
    if (callsignInput) callsignInput.value = playerCallSign;
    if (drawerCallsignInput) drawerCallsignInput.value = playerCallSign;
    if (hubUserName) hubUserName.innerText = `${playerCallSign} • JDSN (${selectedCommander.toUpperCase()})`;
    if (drawerCadetName) drawerCadetName.innerText = playerCallSign;
    if (startCommanderName) startCommanderName.innerText = playerCallSign;
    if (certPlayerName) certPlayerName.innerText = `${playerCallSign} • MASTER EXPLORER`;
  }

  callsignInput?.addEventListener('input', (e) => updateCallSign(e.target.value));
  drawerCallsignInput?.addEventListener('input', (e) => updateCallSign(e.target.value));

  const handleRandomCallsign = () => {
    const randomName = RANDOM_CALLSIGNS[Math.floor(Math.random() * RANDOM_CALLSIGNS.length)];
    updateCallSign(randomName);
    martianAudio.playClick();
  };

  randomCallsignBtn?.addEventListener('click', handleRandomCallsign);
  drawerRandomBtn?.addEventListener('click', handleRandomCallsign);

  updateCallSign(playerCallSign);

  // Drawer Commander Buttons
  const drawerCmdAsha = document.getElementById('drawer-cmd-asha');
  const drawerCmdLeo = document.getElementById('drawer-cmd-leo');

  function syncCommanderButtons() {
    charCardAsha?.classList.toggle('selected', selectedCommander === 'asha');
    charCardLeo?.classList.toggle('selected', selectedCommander === 'leo');
    drawerCmdAsha?.classList.toggle('active', selectedCommander === 'asha');
    drawerCmdLeo?.classList.toggle('active', selectedCommander === 'leo');
  }

  drawerCmdAsha?.addEventListener('click', () => {
    selectedCommander = 'asha';
    localStorage.setItem('jdsn_selected_commander', 'asha');
    updateCommanderUI();
    syncCommanderButtons();
    martianAudio.playUiSwitch();
    martianAudio.playVoiceCadence('asha');
  });

  drawerCmdLeo?.addEventListener('click', () => {
    selectedCommander = 'leo';
    localStorage.setItem('jdsn_selected_commander', 'leo');
    updateCommanderUI();
    syncCommanderButtons();
    martianAudio.playUiSwitch();
    martianAudio.playVoiceCadence('leo');
  });

  document.getElementById('btn-drawer-open-kitty')?.addEventListener('click', () => {
    kittyCompanion?.openModal();
  });

  const handleSelectAsha = () => {
    selectedCommander = 'asha';
    localStorage.setItem('jdsn_selected_commander', 'asha');
    updateCommanderUI();
    martianAudio.playUiSwitch?.();
    martianAudio.playVoiceCadence?.('asha');
  };

  const handleSelectLeo = () => {
    selectedCommander = 'leo';
    localStorage.setItem('jdsn_selected_commander', 'leo');
    updateCommanderUI();
    martianAudio.playUiSwitch?.();
    martianAudio.playVoiceCadence?.('leo');
  };

  hubCmdCardAsha?.addEventListener('click', handleSelectAsha);
  hubCmdCardLeo?.addEventListener('click', handleSelectLeo);
  charCardAsha?.addEventListener('click', handleSelectAsha);
  charCardLeo?.addEventListener('click', handleSelectLeo);

  hubCmdCardAsha?.addEventListener('hoverstart', () => {
    martianAudio.playUiHover?.();
    martianAudio.playVoiceCadence?.('asha');
  });
  hubCmdCardLeo?.addEventListener('hoverstart', () => {
    martianAudio.playUiHover?.();
    martianAudio.playVoiceCadence?.('leo');
  });

  window.addEventListener('commanderPointsUpdated', () => {
    updateCommanderUI();
  });

  updateCommanderUI();

  // 3. Destination Selector & Planetary Gateways
  const destSubLabels = {
    mars: 'TO MARS: PERSEVERANCE VALLEY ➔',
    moon: 'TO MOON: TRANQUILITY BASE ➔',
    deepspace: 'TO DEEP SPACE: VOYAGER 1 ➔'
  };

  function setDestination(dest, sync3D = false) {
    if (!['mars', 'moon', 'deepspace'].includes(dest)) return;
    selectedDestination = dest;

    // Sync Dual Primary Exploration Portals
    const portalMoon = document.getElementById('portal-explore-moon');
    const portalMars = document.getElementById('portal-explore-mars');
    const portalVoyager = document.getElementById('portal-explore-voyager');

    if (portalMoon) portalMoon.classList.toggle('active', dest === 'moon');
    if (portalMars) portalMars.classList.toggle('active', dest === 'mars');
    if (portalVoyager) portalVoyager.classList.toggle('active', dest === 'deepspace');

    // Sync Arcade Status Pill Text
    const statusText = document.getElementById('arcade-status-text');
    if (statusText) {
      if (dest === 'moon') {
        statusText.innerText = 'MOON EXPEDITION STAGING • 100% READY';
      } else if (dest === 'deepspace') {
        statusText.innerText = 'VOYAGER 1 DEEP SPACE • 100% READY';
      } else {
        statusText.innerText = 'MARS EXPEDITION STAGING • 100% READY';
      }
    }

    // Sync 3D planet target chips
    document.querySelectorAll('.target-planet-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.dest === dest);
    });

    if (startDestSub) {
      startDestSub.innerText = destSubLabels[dest] || 'LAUNCH ➔';
    }

    const heroSection = document.querySelector('.hub-hero-section');
    if (heroSection) {
      heroSection.classList.remove('mars-mode', 'moon-mode', 'deepspace-mode');
      heroSection.classList.add(`${dest}-mode`);
    }

    if (sync3D && hero3DOrrery) {
      hero3DOrrery.select3DPlanet(dest, window.innerWidth / 2, window.innerHeight / 2, { notify: false });
    }
    if (typeof updateNasaEyesLocation === 'function') {
      updateNasaEyesLocation(dest === 'deepspace' ? 'voyager' : dest);
    }

    martianAudio.playUiSwitch?.();
  }

  // Interactive 3D Target Planet Chips
  document.getElementById('chip-target-mars')?.addEventListener('click', () => {
    setDestination('mars', true);
  });
  document.getElementById('chip-target-moon')?.addEventListener('click', () => {
    setDestination('moon', true);
  });
  document.getElementById('chip-target-deepspace')?.addEventListener('click', () => {
    setDestination('deepspace', true);
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
      robotDisplayMode.innerText = modeNames[savedRobotConfig.protocol] || 'MISSION BUDDY';
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
    heroInteractions?.updateMascotColor(savedRobotConfig.color);
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
    guideBotEscort.setVisible(false); // Only single chosen kittyCompanion is visible
    kittyCompanion?.setVisible(true);
    astronautCommander.setCommander(commander);
    astronautCommander.setVisible(false); // Unmanned robotic exploration
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

  // Setup Real 3D WebGL Three.js Celestial Orrery (Rotating 3D Mars, Moon, Voyager 1, Crystals & Drag-to-Orbit)
  hero3DOrrery = new Hero3DOrrery(
    'hero-3d-webgl-container',
    coinsManager,
    (dest) => setDestination(dest, false)
  );

  // Setup Interactive Mascot (Astro-Bot), Celestial Tooltips, 3D Card Tilt & Rocket Blastoff
  heroInteractions = new HeroInteractionsManager({
    coinsManager,
    actorDirector,
    setDestinationFn: (dest) => setDestination(dest),
    onStartMissionFn: () => {
      launchExpedition(selectedDestination);
    }
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
  window.handleDiscoveryHomeClick = () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    openGameHub();
  };
  // disc-home-btn: wired by its inline onclick (was also bound here -> ran twice)
  document.getElementById('disc-roadmap-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    questManager.openRoadmapForPlanet(currentPlanet);
    martianAudio.playUiSwitch?.();
  });

  document.getElementById('disc-next-level-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    const missions = questManager.activeMissionsList;
    const nextUncompleted = missions.find((m) => !questManager.completedMissions.has(m.id));
    if (nextUncompleted) {
      spawnRoverForMission(nextUncompleted.id);
    } else {
      questManager.openRoadmapForPlanet(currentPlanet);
    }
    martianAudio.playUiSwitch?.();
  });

  document.getElementById('disc-quiz-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    quizManager.render();
    document.getElementById('quiz-modal-backdrop')?.classList.add('active');
    martianAudio.playUiSwitch?.();
  });

  document.getElementById('disc-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    questManager.playNextLevel();
  });

  // Collapsible Left Drawer Sidebar Controller
  const drawerSidebar = document.getElementById('hub-drawer-sidebar');
  const drawerBackdrop = document.getElementById('hub-drawer-backdrop');
  const btnToggleSidebar = document.getElementById('btn-toggle-hub-sidebar');
  const btnCloseSidebar = document.getElementById('btn-close-hub-sidebar');

  function openDrawerSidebar() {
    drawerSidebar?.classList.add('active');
    drawerBackdrop?.classList.add('active');
    martianAudio.playUiSwitch?.();
  }

  function closeDrawerSidebar() {
    drawerSidebar?.classList.remove('active');
    drawerBackdrop?.classList.remove('active');
  }
  // Used by the drawer's inline "Log Out" onclick (was undefined -> drawer stayed open)
  window.closeDrawerSidebar = closeDrawerSidebar;

  // Unified Planetary Mission Launch Blastoff Flow
  function launchExpedition(targetDest) {
    const dest = targetDest || selectedDestination || 'mars';
    selectedDestination = dest;
    setDestination(dest, false);

    // Blastoff ignition audio & particle plume
    martianAudio.playRocketIgnition?.(2.5);

    try {
      confetti({
        particleCount: 55,
        spread: 85,
        origin: { y: 0.75 },
        colors: dest === 'moon' ? ['#00e5ff', '#38bdf8', '#ffffff'] : ['#ff5e28', '#ffb700', '#ffffff']
      });
    } catch (err) {}

    const playBtn = document.getElementById('btn-arcade-play');
    if (playBtn) playBtn.classList.add('igniting');

    setTimeout(() => {
      if (playBtn) playBtn.classList.remove('igniting');
      closeGameHub();
      setFullscreenMode(true, false);
      switchCelestialBody(dest);
      setMode(dest === 'deepspace' ? 'archaeologist' : 'drive');

      guideBotEscort.setColor(savedRobotConfig.color);
      guideBotEscort.setVisible(false); // Only single chosen kittyCompanion is visible
      kittyCompanion?.setVisible(dest !== 'deepspace');
      astronautCommander.setVisible(false); // Clean robotic rover
      astronautCommander.setCrashState(false);

      const isBn = questManager?.currentLanguage === 'bn';

      if (dest === 'deepspace') {
        switchCelestialBody('deepspace', false);
        setMode('archaeologist');
        setCameraMode('orbit');
        guideBotEscort.setVisible(false);
        kittyCompanion?.setVisible(false);
        astronautCommander.setVisible(false);

        // Center orbit camera directly on Voyager 1
        sceneManager.setTarget(0, 0, 0);
        sceneManager.spherical.radius = 7.5;
        sceneManager.updateCameraPosition();

        // Close any lingering modal popups
        document.getElementById('missions-modal-backdrop')?.classList.remove('active');
        document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
        document.getElementById('modal-backdrop')?.classList.remove('active');

        // Setup Waypoint HUD for Voyager 1
        const waypointBadge = document.getElementById('waypoint-badge');
        const waypointName = document.getElementById('waypoint-name');
        const waypointSub = document.getElementById('waypoint-sub');
        const waypointDist = document.getElementById('waypoint-dist-val');

        if (waypointBadge) waypointBadge.innerText = isBn ? 'ইন্টারস্টেলার মিশন' : 'INTERSTELLAR (24.3B KM)';
        if (waypointName) waypointName.innerText = isBn ? 'ভয়েজার ১ এবং গোল্ডেন রেকর্ড' : 'Voyager 1 & The Golden Record';
        if (waypointSub) waypointSub.innerText = isBn
          ? 'W, A, S, D দিয়ে মহাকাশযান ঘোরান। গোল্ডেন রেকর্ড ও অ্যান্টেনা ক্লিক করে পরীক্ষা করুন!'
          : 'Rotate with W/A/S/D or Mouse Drag. Click Golden Record & Antenna to inspect!';
        if (waypointDist) waypointDist.innerText = '24.3B km';

        // Interactive HUD action pill for Voyager 1 Science Lab (Manual player click, never automated!)
        const commsPillEl = document.getElementById('hud-comms-alert-pill');
        const commsCallerEl = document.getElementById('comms-alert-caller');
        const commsMsgEl = document.getElementById('comms-alert-msg');
        const btnCommsOpenEl = document.getElementById('btn-comms-open-action');
        if (commsPillEl && commsCallerEl && commsMsgEl && btnCommsOpenEl) {
          commsCallerEl.innerText = selectedCommander === 'asha' ? 'COMM. ASHA (DHAKA)' : 'COMM. LEO (FLORIDA)';
          commsMsgEl.innerText = isBn ? '🔬 ভয়েজার ১ সায়েন্স ল্যাব ও রেডিও হ্যান্ডশেক ➔' : '🔬 VOYAGER 1 SCIENCE LAB & RADIO HANDSHAKE ➔';
          btnCommsOpenEl.onclick = () => miniGameManager.open('voyager1');
          commsPillEl.classList.add('visible');
        }

        kittyCompanion?.speak(isBn
          ? 'স্বাগতম ডিপ স্পেস সেন্টারে! W, A, S, D দিয়ে মহাকাশযানটি ঘোরান এবং গোল্ডেন রেকর্ড ও যন্ত্রাংশ ক্লিক করে পরীক্ষা করুন!'
          : 'Welcome to Deep Space! Use W, A, S, D to rotate Voyager 1 and click the Golden Record to explore!');

        updateWaypointHUD();
        return;
      }

      // Moon & Mars: Directly spawn the rover on the surface ready to drive! (No auto-blocking popups!)
      const targetPlanet = dest === 'moon' ? 'moon' : 'mars';
      spawnRoverForMission(null, targetPlanet);

      const worldName = targetPlanet === 'moon' ? (isBn ? 'চাঁদ' : 'the Moon') : (isBn ? 'মঙ্গলগ্রহ' : 'Mars');
      const targetRelic = targetPlanet === 'moon' ? (isBn ? 'সার্ভেয়ার ১' : 'Surveyor 1') : (isBn ? 'অপরচুনিটি রোভার' : 'Opportunity Rover');
      kittyCompanion?.speak(isBn
        ? `কমান্ডার, ${worldName}-এ স্বাগতম! W, A, S, D দিয়ে সামনের আলোকময় বিকনের (${targetRelic}) দিকে ড্রাইভ করো!`
        : `Welcome to ${worldName}, Commander! Use W, A, S, D to drive towards the glowing beacon (${targetRelic}) ahead!`);
    }, 450);
  }

  // 3 Arcade Action Buttons (PLAY, LEVEL, MENU)
  document.getElementById('btn-arcade-play')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAquaGuidedModal(1);
  });

  document.getElementById('btn-arcade-level')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAquaGuidedModal(3);
  });

  document.getElementById('btn-arcade-menu')?.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawerSidebar();
  });

  // =========================================================================
  // AQUA EXPLORER TITLE & SPLASH SCREEN CONTROLLER (FIRST ENTRY SCREEN)
  // =========================================================================
  const aquaSplashScreen = document.getElementById('aqua-splash-screen');
  const btnAquaSplashStart = document.getElementById('btn-aqua-splash-start');

  function dismissAquaSplash() {
    if (!aquaSplashScreen) return;
    martianAudio.ensureActive?.();
    martianAudio.playUiSwitch?.();

    aquaSplashScreen.classList.add('fading-out');
    aquaSplashScreen.classList.remove('active');
    aquaSplashScreen.style.pointerEvents = 'none';
    aquaSplashScreen.style.display = 'none';
    isSplashActive = false;
    window.__isSplashActive = false;

    // Launch Aqua Explorer Guided Game Wizard at Step 1 (Mission Story)
    openAquaGuidedModal(1);
  }

  // Expose on window for direct inline onclick execution
  window.dismissAquaSplash = dismissAquaSplash;
  window.startGame = dismissAquaSplash;
  window.handleStartGameClick = dismissAquaSplash;
  window.openAquaGuidedModal = openAquaGuidedModal;

  function showAquaSplash() {
    if (!aquaSplashScreen) return;
    isSplashActive = true;
    window.__isSplashActive = true;
    aquaSplashScreen.style.display = 'flex';
    requestAnimationFrame(() => {
      aquaSplashScreen.classList.remove('fading-out');
      aquaSplashScreen.classList.add('active');
    });
  }

  // NOTE: the Start button is wired by their inline onclick in the HTML partials (works even
  // before this bundle loads). Adding listeners here too made every click run twice.

  // =========================================================================
  // AQUA EXPLORER GUIDED GAME CONTROLLER (STORY ➔ CADET ➔ LEVELS)
  // =========================================================================
  const aquaModal = document.getElementById('aqua-guided-modal-backdrop');
  let currentAquaStep = 1;

    function updateAquaStars() {
    const starConfigs = [
      { elId: 'aqua-stars-lvl-1', missionId: 'moon_quest_apollo11' },
      { elId: 'aqua-stars-lvl-2', missionId: 'mission_blueberries' },
      { elId: 'aqua-stars-lvl-3', missionId: 'mission_mossbauer' },
      { elId: 'aqua-stars-lvl-4', missionId: 'mission_blackbox' }
    ];

    starConfigs.forEach(({ elId, missionId }) => {
      const el = document.getElementById(elId);
      if (!el) return;
      const isCompleted = questManager?.completedMissions.has(missionId);
      el.innerHTML = isCompleted ? '⭐⭐⭐' : '⭐⭐☆';
      el.style.opacity = isCompleted ? '1' : '0.8';
    });
  }

  function syncAquaCommanderCards() {
    const isAsha = selectedCommander === 'asha';
    const cardAsha = document.getElementById('aqua-char-card-asha');
    const cardLeo = document.getElementById('aqua-char-card-leo');
    const statusAsha = document.getElementById('aqua-asha-select-status');
    const statusLeo = document.getElementById('aqua-leo-select-status');

    if (cardAsha) cardAsha.classList.toggle('active', isAsha);
    if (cardLeo) cardLeo.classList.toggle('active', !isAsha);
    if (statusAsha) statusAsha.innerText = isAsha ? '✓ SELECTED' : 'SELECT';
    if (statusLeo) statusLeo.innerText = !isAsha ? '✓ SELECTED' : 'SELECT';

    const ashaPts = localStorage.getItem('jdsn_asha_points') || '4,850';
    const leoPts = localStorage.getItem('jdsn_leo_points') || '3,410';
    const ashaPtsEl = document.getElementById('aqua-asha-pts');
    const leoPtsEl = document.getElementById('aqua-leo-pts');
    if (ashaPtsEl) ashaPtsEl.innerText = ashaPts;
    if (leoPtsEl) leoPtsEl.innerText = leoPts;
  }

  function setAquaStep(step) {
    currentAquaStep = Math.max(1, Math.min(5, step));

    // Update Step Indicators (1 through 5)
    for (let i = 1; i <= 5; i++) {
      const node = document.getElementById(`aqua-step-indicator-${i}`);
      const panel = document.getElementById(`aqua-step-${i}-panel`);
      if (node) {
        node.classList.toggle('active', i === currentAquaStep);
        node.classList.toggle('completed', i < currentAquaStep);
      }
      if (panel) {
        panel.classList.toggle('active', i === currentAquaStep);
      }
    }

    for (let c = 1; c <= 4; c++) {
      const conn = document.getElementById(`aqua-step-conn-${c}`);
      if (conn) conn.classList.toggle('filled', currentAquaStep > c);
    }

    if (currentAquaStep === 1) {
      const nameInput = document.getElementById('aqua-cadet-name-input');
      const savedCall = localStorage.getItem('nasa_player_callsign') || 'Cadet Explorer';
      if (nameInput) nameInput.value = savedCall;
      const curAge = parseInt(localStorage.getItem('nasa_player_age'), 10) || 10;
      window.setCadetAge?.(curAge);
    } else if (currentAquaStep === 3) {
      window.startVideoPlayback?.();
    } else if (currentAquaStep === 4) {
      const curBot = localStorage.getItem('nasa_selected_bot') || 'echo';
      window.selectWizardBot?.(curBot);
    } else if (currentAquaStep === 5) {
      updateAquaStars();
    }

    martianAudio.playUiSwitch?.();
  }

  function openAquaGuidedModal(step = 1) {
    if (!aquaModal) return;
    setAquaStep(step);
    aquaModal.style.display = 'flex';
    aquaModal.classList.add('active');
    martianAudio.playUiAlert?.();
  }

  function closeAquaGuidedModal() {
    if (!aquaModal) return;
    aquaModal.classList.remove('active');
    aquaModal.style.display = 'none';
    martianAudio.playUiSwitch?.();
  }

  // Export to window for immediate inline onclick access
  window.setAquaStep = setAquaStep;
  window.closeAquaGuidedModal = closeAquaGuidedModal;
  window.openAquaGuidedModal = openAquaGuidedModal;
  // User dismissed the wizard (✕ / Escape): go back to the Game Hub instead of revealing the 3D game behind it.
  // closeAquaGuidedModal() stays a plain hide for the mission-launch paths.
  window.dismissAquaGuidedModal = () => openGameHub();

  window.setGameCompanion = (botId) => {
    if (!kittyCompanion) return;
    if (botId === 'echo') {
      kittyCompanion.selectCompanion(0);
    } else if (botId === 'nova') {
      kittyCompanion.selectCompanion(2);
    } else if (botId === 'orion') {
      kittyCompanion.selectCompanion(3);
    }
  };

  window.setGlobalGameLanguage = (lang) => {
    questManager.setLanguage(lang);
    quizManager.setLanguage(lang);
    newsManager.setLanguage(lang);
    calendarManager.setLanguage(lang);
    window.applyWizardLanguage && window.applyWizardLanguage(lang);
  };

  window.launchFirstMission = () => {
    try {
      const nameInput = document.getElementById('aqua-cadet-name-input');
      const val = (nameInput && nameInput.value.trim()) || 'Cadet Explorer';
      const curAge = parseInt(localStorage.getItem('nasa_player_age'), 10) || 10;
      const chosenBot = localStorage.getItem('nasa_selected_bot') || window.__selectedBotId || 'echo';

      // Only create a new profile if registering a new cadet or no profile exists
      if (window.__isRegisteringNewCadet || !profileManager.getActiveProfile()) {
        profileManager.createProfile({
          name: val,
          age: curAge,
          botId: chosenBot
        });
        window.__isRegisteringNewCadet = false;
      } else {
        // Otherwise, simply update/rename the active profile (never create duplicate)
        profileManager.updateActiveProfile({
          name: val,
          age: curAge,
          botId: chosenBot
        });
      }

      window.setGameCompanion?.(chosenBot);
    } catch (err) {
      console.warn('Error saving cadet profile:', err);
    }

    // Direct transition to Game Hub per user specification
    localStorage.removeItem('nasa_user_logged_out');
    openGameHub();
  };

  window.launchMissionDirect = (dest, missionId) => {
    closeAquaGuidedModal();
    closeGameHub();
    setFullscreenMode(true, false);
    if (dest === 'deepspace' || missionId === 'voyager1' || missionId === 'mission_blackbox') {
      launchExpedition('deepspace');
    } else if (missionId) {
      spawnRoverForMission(missionId, dest);
    } else {
      launchExpedition(dest);
    }
  };
  window.launchExpeditionDirect = window.launchMissionDirect;

  // Aqua Modal Controls Wire-up
  // NOTE: the wizard close, stepper and step navigation buttons are wired by their inline onclick in the HTML partials (works even
  // before this bundle loads). Adding listeners here too made every click run twice.

  // Cadet Name Input Sync
  const aquaNameInput = document.getElementById('aqua-cadet-name-input');
  if (aquaNameInput) {
    aquaNameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim() || 'Cadet Explorer';
      localStorage.setItem('nasa_player_callsign', val);
      if (hubUserName) {
        hubUserName.innerText = `${val} • JDSN (${selectedCommander.toUpperCase()})`;
      }
    });
  }

  // Bot Card Selection in Modal
  ['echo', 'nova', 'orion'].forEach((botId) => {
    document.getElementById(`aqua-bot-card-${botId}`)?.addEventListener('click', () => {
      window.selectWizardBot?.(botId);
    });
  });

  // Level Card Launch Buttons in Step 5
  document.querySelectorAll('.aqua-lvl-launch-btn, .aqua-level-card').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = el.classList.contains('aqua-level-card') ? el : el.closest('.aqua-level-card');
      const dest = card?.dataset.dest || (card?.dataset.missionId?.startsWith('moon_') ? 'moon' : 'mars');
      const missionId = card?.dataset.missionId;

      closeAquaGuidedModal();

      if (dest === 'deepspace' || missionId === 'voyager1' || missionId === 'mission_blackbox') {
        launchExpedition('deepspace');
      } else if (missionId) {
        spawnRoverForMission(missionId, dest);
      } else {
        launchExpedition(dest);
      }
    });
  });

  // Top Bar Utilities
  document.getElementById('hub-fullscreen-toggle')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  });

  document.getElementById('hub-brand-home-link')?.addEventListener('click', () => {
    openGameHub();
  });

  // Switch Cadet Profile / Log Out & In-Game Back Button Handlers
  // NOTE: Switch Cadet, drawer Log Out and in-game Back to Hub are wired by their inline onclick in the HTML partials (works even
  // before this bundle loads). Adding listeners here too made every click run twice.

  btnToggleSidebar?.addEventListener('click', () => {
    if (drawerSidebar?.classList.contains('active')) closeDrawerSidebar();
    else openDrawerSidebar();
  });

  btnCloseSidebar?.addEventListener('click', () => closeDrawerSidebar());
  drawerBackdrop?.addEventListener('click', () => closeDrawerSidebar());

  window.addEventListener('keydown', (e) => {
    if ((e.key === 'm' || e.key === 'M') && !e.target.matches('input, textarea')) {
      if (drawerSidebar?.classList.contains('active')) closeDrawerSidebar();
      else openDrawerSidebar();
    }
    if (e.key === 'Escape') {
      const certModal = document.getElementById('certificate-modal-backdrop');
      if (certModal?.classList.contains('active')) {
        handleCloseCertificateAndReturnToHub();
        return;
      }
      if (aquaModal?.classList.contains('active')) {
        window.dismissAquaGuidedModal();
        return;
      }
      if (drawerSidebar?.classList.contains('active')) {
        closeDrawerSidebar();
        return;
      }
    }
  });

  // Drawer Sidebar Nav Links
  document.getElementById('drawer-nav-home')?.addEventListener('click', () => {
    closeDrawerSidebar();
    openGameHub();
  });
  document.getElementById('drawer-nav-prologue')?.addEventListener('click', () => {
    closeDrawerSidebar();
    openPrologueHandler();
  });
  document.getElementById('drawer-nav-portal-moon')?.addEventListener('click', () => {
    closeDrawerSidebar();
    setDestination('moon', true);
    openStoryArticle('apollo11');
  });
  document.getElementById('drawer-nav-portal-mars')?.addEventListener('click', () => {
    closeDrawerSidebar();
    setDestination('mars', true);
    openStoryArticle('opportunity');
  });
  document.getElementById('drawer-nav-calendar')?.addEventListener('click', () => {
    closeDrawerSidebar();
    calendarManager.open();
  });
  document.getElementById('drawer-nav-archive')?.addEventListener('click', () => {
    closeDrawerSidebar();
    newsManager.open();
  });
  document.getElementById('drawer-nav-labs')?.addEventListener('click', () => {
    closeDrawerSidebar();
    miniGameManager.open('apollo11');
  });
  document.getElementById('drawer-nav-quiz')?.addEventListener('click', () => {
    closeDrawerSidebar();
    quizManager.render();
    document.getElementById('quiz-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('drawer-nav-badges')?.addEventListener('click', () => {
    closeDrawerSidebar();
    questManager.renderBadgesShowcase();
    document.getElementById('badges-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('drawer-nav-roadmap')?.addEventListener('click', () => {
    closeDrawerSidebar();
    questManager.renderMissionsList();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('drawer-nav-pitch')?.addEventListener('click', () => {
    closeDrawerSidebar();
    closeGameHub();
    setMode('pitch');
  });

  // Editorial Pre-Mission Story Articles Controller
  const storyModal = document.getElementById('mission-story-modal');
  let currentStoryArticle = null;

  function openStoryArticle(articleId) {
    const article = MISSION_STORY_ARTICLES[articleId] || MISSION_STORY_ARTICLES.opportunity;
    currentStoryArticle = article;

    const badge = document.getElementById('story-article-badge');
    const readtime = document.getElementById('story-article-readtime');
    const title = document.getElementById('story-article-title');
    const author = document.getElementById('story-article-author');
    const heroImg = document.getElementById('story-article-hero-img');
    const caption = document.getElementById('story-article-caption');
    const summary = document.getElementById('story-article-summary');
    const paragraphs = document.getElementById('story-article-paragraphs');
    const facts = document.getElementById('story-article-facts');

    if (badge) badge.innerText = article.badge;
    if (readtime) readtime.innerText = article.readTime;
    if (title) title.innerText = article.title;
    if (author) author.innerText = article.author;
    if (heroImg) heroImg.src = article.heroImage;
    if (caption) caption.innerText = article.subtitle;
    if (summary) {
      summary.innerHTML = `<strong>EXECUTIVE ARCHIVAL SUMMARY:</strong> <p>${article.summary}</p>`;
    }
    if (paragraphs) {
      paragraphs.innerHTML = article.paragraphs.map(p => `<p class="story-p">${p}</p>`).join('');
    }
    if (facts) {
      facts.innerHTML = `
        <h4 class="facts-title">⚡ FAST MISSION TELEMETRY</h4>
        <div class="facts-grid">
          ${article.fastFacts.map(f => `
            <div class="fact-item">
              <span class="fact-label">${f.label}:</span>
              <strong class="fact-val">${f.val}</strong>
            </div>
          `).join('')}
        </div>
      `;
    }

    storyModal?.classList.add('active');
    martianAudio.playUiSwitch?.();
  }

  document.getElementById('story-modal-close-btn')?.addEventListener('click', () => {
    storyModal?.classList.remove('active');
    if (isHubActive) openGameHub();
  });

  storyModal?.addEventListener('click', (e) => {
    if (e.target === storyModal) {
      storyModal.classList.remove('active');
      if (isHubActive) openGameHub();
    }
  });

  document.getElementById('story-btn-launch-3d')?.addEventListener('click', () => {
    storyModal?.classList.remove('active');
    closeGameHub();
    setFullscreenMode(true, false);
    if (currentStoryArticle) {
      switchCelestialBody(currentStoryArticle.destination);
    }
    setMode('drive');
    kittyCompanion.speak("Welcome to surface exploration! Follow my beacon to the relic!");
  });

  document.getElementById('story-btn-workbench')?.addEventListener('click', () => {
    storyModal?.classList.remove('active');
    if (currentStoryArticle) {
      switchCelestialBody(currentStoryArticle.destination);
      miniGameManager.open(currentStoryArticle.labMode);
    }
  });

  // Dual Primary Exploration Portals on Main Hub
  const portalMoon = document.getElementById('portal-explore-moon');
  const portalMars = document.getElementById('portal-explore-mars');
  const portalVoyager = document.getElementById('portal-explore-voyager');

  const btnPortalLaunchMoon = document.getElementById('btn-portal-launch-moon');
  const btnPortalLaunchMars = document.getElementById('btn-portal-launch-mars');
  const btnPortalLaunchVoyager = document.getElementById('btn-portal-launch-voyager');

  // =========================================================================
  // 3D CELESTIAL ORRERY HERO BACKGROUND SYSTEM
  // =========================================================================
  const hubHeroBg = document.getElementById('hub-hero-bg');
  const heroHintPill = document.getElementById('hero-3d-hint-pill');

  const ORRERY_HINT_DEFAULT = '🎮 3D CELESTIAL ORRERY • DRAG TO ROTATE 3D WORLDS';
  const ORRERY_LABELS = {
    home: '🎮 3D CELESTIAL ORRERY • DRAG TO ROTATE 3D WORLDS',
    moon: '🌕 THE MOON: 3D TRANQUILITY BASE • APOLLO 11 LANDING SITE',
    mars: '🔴 MARS: 3D PERSEVERANCE VALLEY • OPPORTUNITY MER-B',
    voyager: '🌌 VOYAGER 1: 3D INTERSTELLAR EXPEDITION (24.3 BILLION KM)',
    deepspace: '🌌 VOYAGER 1: 3D INTERSTELLAR EXPEDITION (24.3 BILLION KM)'
  };

  let orreryResetTimer = null;

  function setOrreryFocus(dest) {
    clearTimeout(orreryResetTimer);
    const key = dest === 'deepspace' ? 'voyager' : dest;
    if (heroHintPill && ORRERY_LABELS[key]) {
      heroHintPill.innerText = ORRERY_LABELS[key];
      heroHintPill.classList.toggle('active-hover', key !== 'home');
    }
    if (hero3DOrrery) {
      hero3DOrrery.focusPlanet(dest); // preview only: hover must not re-select & re-trigger sounds
    }
  }

  function scheduleOrreryHome(delayMs = 1800) {
    clearTimeout(orreryResetTimer);
    orreryResetTimer = setTimeout(() => {
      if (heroHintPill) {
        heroHintPill.innerText = ORRERY_HINT_DEFAULT;
        heroHintPill.classList.remove('active-hover');
      }
      if (hero3DOrrery) {
        hero3DOrrery.focusPlanet(selectedDestination || 'mars');
      }
    }, delayMs);
  }

  // Backwards compatibility helpers
  window.updateNasaEyesLocation = (dest) => setOrreryFocus(dest);
  window.scheduleNasaEyesHome = (delay) => scheduleOrreryHome(delay);
  window.setHeroEngineMode = () => {};
  window.launchExpedition = launchExpedition;

  btnPortalLaunchMoon?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    setDestination('moon', true);
    launchExpedition('moon');
  });

  btnPortalLaunchMars?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    setDestination('mars', true);
    launchExpedition('mars');
  });

  btnPortalLaunchVoyager?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    setDestination('deepspace', true);
    launchExpedition('deepspace');
  });

  portalMoon?.addEventListener('click', (e) => {
    e.preventDefault();
    martianAudio.playUiSwitch?.();
    setDestination('moon', true);
    launchExpedition('moon');
  });

  portalMoon?.addEventListener('hoverstart', () => {
    setOrreryFocus('moon');
    martianAudio.playPortalHover?.('moon');
  });

  portalMoon?.addEventListener('hoverend', () => {
    scheduleOrreryHome(1800);
  });

  portalMars?.addEventListener('click', (e) => {
    e.preventDefault();
    martianAudio.playUiSwitch?.();
    setDestination('mars', true);
    launchExpedition('mars');
  });

  portalMars?.addEventListener('hoverstart', () => {
    setOrreryFocus('mars');
    martianAudio.playPortalHover?.('mars');
  });

  portalMars?.addEventListener('hoverend', () => {
    scheduleOrreryHome(1800);
  });

  portalVoyager?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    setDestination('deepspace', true);
    launchExpedition('deepspace');
  });

  portalVoyager?.addEventListener('hoverstart', () => {
    setOrreryFocus('deepspace');
    martianAudio.playPortalHover?.('deepspace');
  });

  portalVoyager?.addEventListener('hoverend', () => {
    scheduleOrreryHome(1800);
  });

  // Drawer shortcuts
  document.getElementById('drawer-nav-portal-moon')?.addEventListener('hoverstart', () => {
    setOrreryFocus('moon');
  });
  document.getElementById('drawer-nav-portal-moon')?.addEventListener('hoverend', () => {
    scheduleOrreryHome(1800);
  });
  document.getElementById('drawer-nav-portal-mars')?.addEventListener('hoverstart', () => {
    setOrreryFocus('mars');
  });
  document.getElementById('drawer-nav-portal-mars')?.addEventListener('hoverend', () => {
    scheduleOrreryHome(1800);
  });

  // Dynamic Radio Comms Alert Pill Controller
  const commsAlertPill = document.getElementById('hud-comms-alert-pill');
  const commsCaller = document.getElementById('comms-alert-caller');
  const commsMsg = document.getElementById('comms-alert-msg');
  const btnCommsOpen = document.getElementById('btn-comms-open-action');
  const btnCommsDismiss = document.getElementById('btn-comms-dismiss');
  let commsActionFn = null;

  function triggerCommsAlert(caller, message, onAction) {
    if (commsCaller) commsCaller.innerText = caller;
    if (commsMsg) commsMsg.innerText = message;
    commsActionFn = onAction;
    commsAlertPill?.classList.add('active');
    if (commsAlertPill) commsAlertPill.style.display = 'flex';
    martianAudio.playTelemetryTransmission?.();
  }

  btnCommsOpen?.addEventListener('click', () => {
    commsAlertPill?.classList.remove('active');
    if (commsAlertPill) commsAlertPill.style.display = 'none';
    if (commsActionFn) commsActionFn();
  });

  btnCommsDismiss?.addEventListener('click', () => {
    commsAlertPill?.classList.remove('active');
    if (commsAlertPill) commsAlertPill.style.display = 'none';
  });

  // Story Prologue Triggers
  const openPrologueHandler = () => {
    actorDirector.openPrologue(() => {
      if (isHubActive) openGameHub();
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

  miniGameManager.onCloseCallback = () => {
    if (isHubActive) openGameHub();
  };

  if (kittyCompanion) {
    kittyCompanion.onCloseCallback = () => {
      if (isHubActive) openGameHub();
    };
  }

  pitchDirector.onCompleteCallback = () => {
    if (isHubActive) openGameHub();
  };

  document.getElementById('btn-exit-pitch-to-hub')?.addEventListener('click', () => {
    pitchDirector.stop();
    if (isHubActive) openGameHub();
  });

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
    switchCelestialBody('moon');
    miniGameManager.open('apollo11');
  });

  document.getElementById('hub-card-archaeology')?.addEventListener('click', () => {
    switchCelestialBody('mars');
    miniGameManager.open('opportunity');
  });

  document.getElementById('hub-card-insight')?.addEventListener('click', () => {
    switchCelestialBody('mars');
    miniGameManager.open('insight');
  });

  document.getElementById('hub-card-voyager')?.addEventListener('click', () => {
    switchCelestialBody('deepspace');
    miniGameManager.open('voyager1');
  });

  document.getElementById('hub-card-storm')?.addEventListener('click', () => {
    closeGameHub();
    setFullscreenMode(true, false);
    switchCelestialBody('mars');
    setMode('sol5111');
  });

  document.getElementById('hub-card-roadmap')?.addEventListener('click', () => {
    questManager.renderMissionsList();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });

  document.getElementById('hub-card-drive-mode')?.addEventListener('click', () => {
    closeGameHub();
    setFullscreenMode(true, false);
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
    setFullscreenMode(true, false);
    setMode('archaeologist');
  });

  document.getElementById('hub-tab-drive')?.addEventListener('click', () => {
    closeGameHub();
    setFullscreenMode(true, false);
    setMode('drive');
  });

  document.getElementById('hub-tab-pitch')?.addEventListener('click', () => {
    closeGameHub();
    setFullscreenMode(true, false);
    setMode('pitch');
  });

  document.getElementById('hub-tab-quiz')?.addEventListener('click', () => {
    quizManager.render();
    document.getElementById('quiz-modal-backdrop')?.classList.add('active');
  });

  // Hook up Roadmap Direct Action Callback
  questManager.onMissionActionCallback = (missionId) => {
    spawnRoverForMission(missionId);
  };

  questManager.onPlanetChangeCallback = (planet) => {
    switchCelestialBody(planet);
  };

  // Top Simulation Navigation Bar Explicit Click Handlers (Fail-Safe)
  document.getElementById('tab-home-hub')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openGameHub();
  });

  document.getElementById('tab-archaeologist')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    setMode('archaeologist');
  });

  document.getElementById('open-minigames-tab-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    const defaultForWorld =
      currentPlanet === 'moon'
        ? 'apollo11'
        : currentPlanet === 'deepspace'
          ? 'voyager1'
          : 'opportunity';
    openLabsHandler(defaultForWorld);
  });

  document.getElementById('tab-sol5111')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    setMode('sol5111');
  });

  document.getElementById('tab-drive')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    setMode('drive');
  });

  document.getElementById('tab-pitch')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    setMode('pitch');
  });

  document.getElementById('btn-open-prologue')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    openPrologueHandler();
  });

  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFullscreenMode(!isFullscreenActive, false);
  });

  // Generic data-mode fallback
  document.querySelectorAll('.nav-tab[data-mode]').forEach((tab) => {
    tab.addEventListener('click', () => {
      setMode(tab.dataset.mode);
    });
  });

  // Modals Open/Close
  document.getElementById('open-missions-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    questManager.openRoadmapForPlanet(currentPlanet);
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('open-sheet-btn')?.addEventListener('click', () => {
    questManager.renderMissionsList();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('missions-close-btn')?.addEventListener('click', () => {
    document.getElementById('missions-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });
  document.getElementById('missions-dismiss-btn')?.addEventListener('click', () => {
    spawnRoverForMission(questManager.selectedMissionId);
  });

  document.getElementById('lang-toggle-btn')?.addEventListener('click', () => {
    const lang = questManager.toggleLanguage();
    quizManager.setLanguage(lang);
    newsManager.setLanguage(lang);
    calendarManager.setLanguage(lang);
    martianAudio.playClick();
  });

  document.getElementById('open-quiz-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    martianAudio.playUiSwitch?.();
    quizManager.render();
    document.getElementById('quiz-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('quiz-close-btn')?.addEventListener('click', () => {
    document.getElementById('quiz-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });

  document.getElementById('news-close-btn')?.addEventListener('click', () => {
    document.getElementById('news-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });
  document.getElementById('news-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('news-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });

  document.getElementById('calendar-close-btn')?.addEventListener('click', () => {
    document.getElementById('calendar-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });
  document.getElementById('calendar-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('calendar-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });

  document.getElementById('badges-close-btn')?.addEventListener('click', () => {
    document.getElementById('badges-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });
  document.getElementById('badges-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('badges-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });

  document.getElementById('disc-close-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });
  document.getElementById('disc-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('mission-discovery-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });

  document.getElementById('celebration-close-btn')?.addEventListener('click', () => {
    document.getElementById('celebration-modal-backdrop')?.classList.remove('active');
    openGameHub();
  });
  document.getElementById('celebration-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('celebration-modal-backdrop')?.classList.remove('active');
    openGameHub();
  });

  const certCloseBtn = document.getElementById('cert-close-btn');
  if (certCloseBtn) {
    certCloseBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCloseCertificateAndReturnToHub();
    };
  }

  const certDismissBtn = document.getElementById('cert-dismiss-btn');
  if (certDismissBtn) {
    certDismissBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCloseCertificateAndReturnToHub();
    };
  }

  const certBackdrop = document.getElementById('certificate-modal-backdrop');
  if (certBackdrop) {
    certBackdrop.onclick = (e) => {
      if (e.target === certBackdrop) {
        handleCloseCertificateAndReturnToHub();
      }
    };
  }

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
    if (isHubActive) openGameHub();
  });
  document.getElementById('rubric-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('rubric-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });

  document.getElementById('dust-info-btn')?.addEventListener('click', () => {
    document.getElementById('dust-modal-backdrop')?.classList.add('active');
  });
  document.getElementById('dust-close-btn')?.addEventListener('click', () => {
    document.getElementById('dust-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });
  document.getElementById('dust-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('dust-modal-backdrop')?.classList.remove('active');
    if (isHubActive) openGameHub();
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
        if (isHubActive && backdrop.id !== 'modal-backdrop' && backdrop.id !== 'scan-modal-backdrop') {
          openGameHub();
        }
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
      sceneManager.cancelTransition?.();
      setTarget(roverController.position.x, roverController.position.y + 0.6, roverController.position.z);
      sceneManager.spherical.theta = roverController.heading;
      sceneManager.spherical.phi = 1.15;
      sceneManager.spherical.radius = 7.0;
      if (sceneManager.targetState) {
        sceneManager.targetState.theta = roverController.heading;
        sceneManager.targetState.phi = 1.15;
        sceneManager.targetState.radius = 7.0;
        sceneManager.targetState.lookAt.set(roverController.position.x, roverController.position.y + 0.6, roverController.position.z);
      }
      sceneManager.updateCameraPosition();
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

  // Audio Toggle & Sync System (Default ON across all loads & WebGL starts)
  function syncAudioUI(isUnmuted) {
    const audioBtn = document.getElementById('audio-toggle-btn');
    const audioIcon = document.getElementById('audio-icon');
    const audioLbl = document.getElementById('lbl-audio-btn');
    const hubAudioBtn = document.getElementById('hub-audio-toggle');
    const hubAudioIcon = document.getElementById('hub-audio-icon');
    const hubAudioText = document.getElementById('hub-audio-text');

    // ON but not yet allowed by the browser → invite a tap instead of claiming "ON"
    const blocked = isUnmuted && martianAudio.isBlocked?.();
    const labelText = blocked ? 'Tap for sound' : (isUnmuted ? 'Audio: ON' : 'Audio: OFF');
    const iconText = blocked ? '🔈' : (isUnmuted ? '🔊' : '🔇');

    if (audioIcon) audioIcon.innerText = iconText;
    if (audioLbl) audioLbl.innerText = labelText;
    if (hubAudioIcon) hubAudioIcon.innerText = iconText;
    if (hubAudioText) hubAudioText.innerText = labelText;

    [audioBtn, hubAudioBtn].forEach(btn => {
      if (!btn) return;
      btn.classList.toggle('audio-active', isUnmuted && !blocked);
      btn.classList.toggle('audio-blocked', !!blocked);
    });
  }

  // Audio unlock is handled inside martianAudio (persistent listeners on real
  // user gestures only — mouse movement cannot start Web Audio).
  martianAudio.installUnlockListeners?.();
  // Keep the buttons in sync whenever the browser blocks, unlocks or suspends audio
  window.addEventListener('martianaudio:state', (e) => syncAudioUI(!e.detail.muted));

  // Initialize UI with Audio ON
  syncAudioUI(!martianAudio.isMuted);

  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isUnmuted = martianAudio.unlockOrToggle();
      syncAudioUI(isUnmuted);
    });
  }

  const hubAudioBtn = document.getElementById('hub-audio-toggle');
  if (hubAudioBtn) {
    hubAudioBtn.addEventListener('click', () => {
      const isUnmuted = martianAudio.unlockOrToggle();
      syncAudioUI(isUnmuted);
    });
  }

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

    // 4. Target Relic & Distance (always follows the ACTIVE mission, never hard-coded per planet)
    if (flightTargetVal && flightTargetDist) {
      if (currentPlanet === 'deepspace') {
        flightTargetVal.innerText = 'VOYAGER 1 & GOLDEN RECORD';
        flightTargetDist.innerText = 'HELIOPAUSE • 24.3 BILLION KM';
      } else {
        const activeMissionForHud = getActiveMission();
        const activeArtifactForHud = activeMissionForHud ? getActiveMissionArtifact(activeMissionForHud.id) : null;
        const siteName = currentPlanet === 'moon' ? 'TRANQUILITY BASE' : 'PERSEVERANCE VALLEY';
        if (activeArtifactForHud) {
          flightTargetVal.innerText = String(activeArtifactForHud.title || '').toUpperCase();
          const missionTag = activeMissionForHud.stationYear ? ` • ${activeMissionForHud.stationYear}` : '';
          flightTargetDist.innerText = `${siteName}${missionTag}`;
        } else if (currentPlanet === 'moon') {
          flightTargetVal.innerText = 'LUNAR RELIC';
          flightTargetDist.innerText = 'TRANQUILITY BASE • HISTORIC SITE';
        } else {
          flightTargetVal.innerText = 'MARTIAN RELIC';
          flightTargetDist.innerText = 'PERSEVERANCE VALLEY • CRATER RIM';
        }
      }
    }
  }

  // Global Micro-Interaction Audio Synthesizer Triggers
  // pointerenter (capture) fires for EVERY child element the pointer crosses, so only
  // react when the hoverable element itself is entered — one blip per element, not per child.
  // Portal cards are excluded: they play their own destination chime (playPortalHover).
  const HOVER_SOUND_SELECTOR =
    'button, .hub-quick-btn, .hub-game-card, .nav-tab, .mg-tab-pill, .hub-commander-compact-chip, .cmd-card-status-badge, .target-planet-chip, .character-select-card';
  // 'hoverstart' comes from the hover stabilizer: once per real enter, never on edge flicker
  document.addEventListener('hoverstart', (e) => {
    const el = e.target;
    if (!(el instanceof Element) || !el.matches(HOVER_SOUND_SELECTOR)) return;
    if (el.closest('.exploration-portal-card') && !el.matches('.portal-launch-btn')) return;
    martianAudio.playUiHover?.();
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
      // guideBotEscort disabled: single chosen companion drone updated
      kittyCompanion?.update(delta, elapsedTime, roverController.position, roverController.heading);
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

  // =========================================================================
  // RELOAD STATE RESTORATION & MULTI-PROFILE PERSISTENCE (F5 RELOAD RETENTION)
  // =========================================================================
  const isExplicitlyLoggedOut = localStorage.getItem('nasa_user_logged_out') === 'true';
  const activeProf = profileManager.getActiveProfile();
  const savedScreenState = profileManager.getSavedScreen();

  if (!isExplicitlyLoggedOut && activeProf && savedScreenState && savedScreenState.screen) {
    console.log('🔄 Restoring active screen on reload:', savedScreenState);
    if (aquaSplashScreen) {
      aquaSplashScreen.style.display = 'none';
      aquaSplashScreen.classList.remove('active');
      isSplashActive = false;
      window.__isSplashActive = false;
    }
    profileManager.restoreScreen(savedScreenState.screen, savedScreenState.params);
  } else if (!isExplicitlyLoggedOut && activeProf) {
    if (aquaSplashScreen) {
      aquaSplashScreen.style.display = 'none';
      aquaSplashScreen.classList.remove('active');
      isSplashActive = false;
      window.__isSplashActive = false;
    }
    openGameHub();
  } else {
    // When logged out (or brand new visitor): STAY STRICTLY ON START GAME SPLASH SCREEN!
    // Do NOT auto-login and do NOT pop up profile modal on reload!
    console.log('🌟 Player is logged out. Showing Start Game splash screen.');
    closeGameHub();
    if (aquaSplashScreen) {
      aquaSplashScreen.style.display = 'flex';
      aquaSplashScreen.style.pointerEvents = 'auto';
      aquaSplashScreen.classList.remove('fading-out');
      aquaSplashScreen.classList.add('active');
    }
    isSplashActive = true;
    window.__isSplashActive = true;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplication);
} else {
  initApplication();
}
