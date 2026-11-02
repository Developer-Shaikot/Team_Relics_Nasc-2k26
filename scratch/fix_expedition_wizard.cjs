const fs = require('fs');

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

// Replace moon_mission_locate with moon_quest_apollo11
html = html.replace(/data-mission-id="moon_mission_locate"/g, 'data-mission-id="moon_quest_apollo11"');

// Replace mission_dust_clean with mission_mossbauer
html = html.replace(/data-mission-id="mission_dust_clean"/g, 'data-mission-id="mission_mossbauer"');

// Replace voyager1 with mission_blackbox on card 4
html = html.replace(/id="aqua-lvl-card-4" data-dest="deepspace" data-mission-id="voyager1"/g, 'id="aqua-lvl-card-4" data-dest="deepspace" data-mission-id="mission_blackbox"');
html = html.replace(/class="aqua-lvl-launch-btn deep-btn" type="button" data-dest="deepspace" data-mission-id="voyager1"/g, 'class="aqua-lvl-launch-btn deep-btn" type="button" data-dest="deepspace" data-mission-id="mission_blackbox"');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html mission IDs in Expedition Wizard');

// 2. UPDATE src/main.js
let js = fs.readFileSync('src/main.js', 'utf8');

// Update updateAquaStars
const oldStars = `  function updateAquaStars() {
    const starConfigs = [
      { elId: 'aqua-stars-lvl-1', missionId: 'moon_mission_locate' },
      { elId: 'aqua-stars-lvl-2', missionId: 'mission_blueberries' },
      { elId: 'aqua-stars-lvl-3', missionId: 'mission_dust_clean' },
      { elId: 'aqua-stars-lvl-4', missionId: 'voyager1' }
    ];`;

const newStars = `  function updateAquaStars() {
    const starConfigs = [
      { elId: 'aqua-stars-lvl-1', missionId: 'moon_quest_apollo11' },
      { elId: 'aqua-stars-lvl-2', missionId: 'mission_blueberries' },
      { elId: 'aqua-stars-lvl-3', missionId: 'mission_mossbauer' },
      { elId: 'aqua-stars-lvl-4', missionId: 'mission_blackbox' }
    ];`;

if (js.includes(oldStars)) {
  js = js.replace(oldStars, newStars);
  console.log('Successfully updated updateAquaStars in src/main.js');
} else {
  // Regex replacement in case of CRLF
  js = js.replace(/function updateAquaStars\(\)\s*\{[\s\S]*?elId:\s*'aqua-stars-lvl-4'[\s\S]*?\];/, newStars);
  console.log('Applied updateAquaStars via regex');
}

// Update spawnRoverForMission signature and planet determination
const oldSpawnRover = `  function spawnRoverForMission(missionId) {
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

    const isMoonMission = KIDS_MISSIONS_MOON.some((m) => m.id === missionId);
    const targetPlanet = isMoonMission ? 'moon' : (missionId === 'mission_blackbox' ? 'deepspace' : 'mars');
    if (currentPlanet !== targetPlanet) {
      switchCelestialBody(targetPlanet, false);
    }`;

const newSpawnRover = `  function spawnRoverForMission(missionId, forcedPlanet = null) {
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
    }`;

if (js.includes(oldSpawnRover)) {
  js = js.replace(oldSpawnRover, newSpawnRover);
  console.log('Successfully updated spawnRoverForMission in src/main.js');
} else {
  // Regex replacement for spawnRoverForMission
  js = js.replace(/function spawnRoverForMission\(missionId\)[\s\S]*?if \(currentPlanet !== targetPlanet\) \{\s*switchCelestialBody\(targetPlanet, false\);\s*\}/, newSpawnRover);
  console.log('Applied spawnRoverForMission via regex');
}

// Update wizard click handler in src/main.js
const oldWizardClick = `  // Level Card Launch Buttons in Step 3
  document.querySelectorAll('.aqua-lvl-launch-btn, .aqua-level-card').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = el.classList.contains('aqua-level-card') ? el : el.closest('.aqua-level-card');
      const dest = card?.dataset.dest || 'mars';
      const missionId = card?.dataset.missionId;

      closeAquaGuidedModal();

      if (dest === 'deepspace' || missionId === 'voyager1') {
        launchExpedition('deepspace');
      } else if (missionId) {
        spawnRoverForMission(missionId);
      } else {
        launchExpedition(dest);
      }
    });
  });`;

const newWizardClick = `  // Level Card Launch Buttons in Step 3
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
  });`;

if (js.includes(oldWizardClick)) {
  js = js.replace(oldWizardClick, newWizardClick);
  console.log('Successfully updated wizard click handler in src/main.js');
} else {
  js = js.replace(/\/\/ Level Card Launch Buttons in Step 3[\s\S]*?launchExpedition\(dest\);\s*\}\s*\}\);\s*\}\);/, newWizardClick);
  console.log('Applied wizard click handler via regex');
}

fs.writeFileSync('src/main.js', js, 'utf8');
console.log('src/main.js updated successfully');

