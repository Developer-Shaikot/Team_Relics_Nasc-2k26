const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

// 1. Fix telemetry update & distance extraction
const oldBlock = `    updateMinimap(stats);

    if (currentPlanet === 'moon' && stats.distanceMeters >= 20) {
      questManager.markMissionCompleted('moon_quest_lrv_buggy');
    }

    // CRITICAL BUG FIX: Proximity triggers and in-game HUDs ONLY run during active fullscreen gameplay!
    if (!isFullscreenActive || isHubActive || isSplashActive || window.__isSplashActive) {
      return;
    }

    const activeMission = getActiveMission();
    const artifact = getActiveMissionArtifact(activeMission?.id);
    if (artifact && !questManager.completedMissions.has(activeMission.id)) {
      const dx = roverController.position.x - artifact.coords.x;
      const dz = roverController.position.z - artifact.coords.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const distValElem = document.getElementById('waypoint-dist-val');
      if (distValElem) distValElem.innerText = \`\${dist.toFixed(1)}m\`;

      // Approaching within 12 meters -> Trigger Holographic History Billboard with word-by-word animation!
      if (dist <= 12.0 && !hasShownBillboardForMission.has(activeMission.id)) {
        showRelicBillboard(artifact);
      }

      if (dist <= 4.0) {
        activeRadarArtifact = artifact;
        if (radarHud) radarHud.style.display = 'flex';
        if (radarTitle) radarTitle.innerText = \`📍 TARGET: \${artifact.title}\`;
        if (radarSub) {
          radarSub.innerText = \`Objective reached! (\${dist.toFixed(1)}m) • Press [E] or Click to Scan\`;
        }
      }
    }`;

const newBlock = `    updateMinimap(stats);

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
      if (distValElem) distValElem.innerText = \`\${dist.toFixed(1)}m\`;

      // Approaching within 12 meters -> Trigger Holographic History Billboard
      if (dist <= 12.0 && !hasShownBillboardForMission.has(activeMission.id)) {
        showRelicBillboard(artifact);
      }

      if (dist <= 4.5) {
        activeRadarArtifact = artifact;
        if (radarHud) radarHud.style.display = 'flex';
        if (radarTitle) radarTitle.innerText = \`📍 TARGET: \${artifact.title}\`;
        if (radarSub) {
          radarSub.innerText = \`\${artifact.title} (\${dist.toFixed(1)}m) • Press [E] or Click to Scan\`;
        }
        if (radarScanBtn) {
          radarScanBtn.style.display = 'block';
          radarScanBtn.innerText = 'SCAN ➔';
        }
      }
    }`;

// Normalize line endings for replacement
const normalize = s => s.replace(/\r\n/g, '\n');
const codeNorm = normalize(code);
const oldNorm = normalize(oldBlock);
const newNorm = normalize(newBlock);

if (codeNorm.includes(oldNorm)) {
  const updated = codeNorm.replace(oldNorm, newNorm);
  fs.writeFileSync('src/main.js', updated, 'utf8');
  console.log('Successfully updated telemetry update block in src/main.js');
} else {
  console.error('oldBlock not found in src/main.js!');
}

// 2. Fix showRelicBillboard
let code2 = fs.readFileSync('src/main.js', 'utf8');
const oldBB = 'if (!isFullscreenActive || isHubActive || isSplashActive || window.__isSplashActive) return;';
const newBB = 'if (isHubActive || isSplashActive || window.__isSplashActive) return;';

if (code2.includes(oldBB)) {
  code2 = code2.replace(oldBB, newBB);
  fs.writeFileSync('src/main.js', code2, 'utf8');
  console.log('Successfully updated showRelicBillboard guard');
}

