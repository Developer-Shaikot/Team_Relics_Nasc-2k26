const fs = require('fs');

// 1. Update style.css
let css = fs.readFileSync('style.css', 'utf8');

// Normal mode positions
css = css.replace(
  /\.waypoint-tracker-hud\s*\{\s*position:\s*absolute;\s*top:\s*\d+px;/,
  `.waypoint-tracker-hud {
  position: absolute;
  top: 58px;`
);

css = css.replace(
  /\.rover-radar-hud\s*\{\s*position:\s*absolute;\s*top:\s*\d+px;/,
  `.rover-radar-hud {
  position: absolute;
  top: 118px;`
);

// Fullscreen mode positions
css = css.replace(
  /body\.fullscreen-mode-active\s+\.waypoint-tracker-hud\s*\{[\s\S]*?top:\s*\d+px\s*!important;/,
  `body.fullscreen-mode-active .waypoint-tracker-hud {
  position: fixed !important;
  top: 50px !important;`
);

// Remove .rover-radar-hud from display: none in fullscreen mode and give it proper fixed position
const oldFsHide = `body.fullscreen-mode-active .rover-radar-hud,
body.fullscreen-mode-active .spaceflight-hud-overlay,
body.fullscreen-mode-active .flight-compass-bar,
body.fullscreen-mode-active .fun-fact-card,
body.fullscreen-mode-active .jdsn-avatars-dock {
  display: none !important;
}`;

const newFsHide = `body.fullscreen-mode-active .rover-radar-hud {
  position: fixed !important;
  top: 110px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 10000 !important;
}

body.fullscreen-mode-active .fun-fact-card,
body.fullscreen-mode-active .jdsn-avatars-dock {
  display: none !important;
}`;

if (css.includes(oldFsHide)) {
  css = css.replace(oldFsHide, newFsHide);
  console.log('Updated fullscreen hide rules in style.css');
} else {
  // Try regex replace
  css = css.replace(
    /body\.fullscreen-mode-active\s+\.rover-radar-hud,\s*body\.fullscreen-mode-active\s+\.spaceflight-hud-overlay,[\s\S]*?display:\s*none\s*!important;\s*\}/,
    newFsHide
  );
  console.log('Regex updated fullscreen hide rules in style.css');
}

fs.writeFileSync('style.css', css, 'utf8');
console.log('style.css updated successfully');

// 2. Update roverController.onProximityAlert in src/main.js
let mainCode = fs.readFileSync('src/main.js', 'utf8');

const oldProx = `  roverController.onProximityAlert = (artifact, dist) => {
    if (dist <= 4.5 && artifact) {
      activeRadarArtifact = artifact;
      if (radarHud) radarHud.style.display = 'flex';
      const isAlreadyLogged = artifact.missionId && questManager.completedMissions.has(artifact.missionId);

      if (isAlreadyLogged) {
        if (radarTitle) radarTitle.innerHTML = \`<span style="color:#10b981;">✓ MISSION ALREADY LOGGED:</span> \${artifact.title}\`;
        if (radarSub) {
          radarSub.innerText = \`Historic hardware archived in Junior Deep Space Network (+150 XP Earned)\`;
        }
        if (radarScanBtn) radarScanBtn.style.display = 'none';
      } else {
        if (radarTitle) radarTitle.innerText = \`📍 \${artifact.title}\`;
        if (radarSub) {
          radarSub.innerText = \`\${artifact.title} (\${dist.toFixed(1)}m) • Press [E] or Click to Scan\`;
        }
        if (radarScanBtn) radarScanBtn.style.display = 'block';
      }
    } else if (!activeRadarArtifact || dist > 5.0) {
      activeRadarArtifact = null;
      if (radarHud) radarHud.style.display = 'none';
    }
  };`;

const newProx = `  roverController.onProximityAlert = (artifact, dist) => {
    if (dist <= 4.5 && artifact) {
      activeRadarArtifact = artifact;
      if (radarHud) radarHud.style.display = 'flex';
      const isAlreadyLogged = artifact.missionId && questManager.completedMissions.has(artifact.missionId);

      if (isAlreadyLogged) {
        if (radarTitle) radarTitle.innerHTML = \`<span style="color:#10b981;">✓ HISTORIC RELIC LOGGED:</span> \${artifact.title}\`;
        if (radarSub) {
          radarSub.innerText = \`\${artifact.title} (\${dist.toFixed(1)}m) • Press [E] or Click to Scan Again\`;
        }
        if (radarScanBtn) {
          radarScanBtn.style.display = 'block';
          radarScanBtn.innerText = 'RESCAN ➔';
        }
      } else {
        if (radarTitle) radarTitle.innerText = \`📍 TARGET: \${artifact.title}\`;
        if (radarSub) {
          radarSub.innerText = \`\${artifact.title} (\${dist.toFixed(1)}m) • Press [E] or Click to Scan\`;
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
  };`;

const normMain = mainCode.replace(/\r\n/g, '\n');
const normOldProx = oldProx.replace(/\r\n/g, '\n');
const normNewProx = newProx.replace(/\r\n/g, '\n');

if (normMain.includes(normOldProx)) {
  mainCode = normMain.replace(normOldProx, normNewProx);
  fs.writeFileSync('src/main.js', mainCode, 'utf8');
  console.log('src/main.js onProximityAlert updated successfully');
} else {
  console.error('oldProx not found in src/main.js!');
}

