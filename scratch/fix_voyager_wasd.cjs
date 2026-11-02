const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

// 1. Deep Space attitude WASD control & E to open science lab
const oldKeydown = `  window.addEventListener('keydown', (e) => {
    if (['KeyE', 'e', 'E'].includes(e.code) && activeRadarArtifact) {
      scanner.triggerManualScan(activeRadarArtifact.id);
    }
  });`;

const newKeydown = `  window.addEventListener('keydown', (e) => {
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
  });`;

const norm = s => s.replace(/\r\n/g, '\n');
if (norm(code).includes(norm(oldKeydown))) {
  code = norm(code).replace(norm(oldKeydown), norm(newKeydown));
  console.log('Added Voyager 1 WASD attitude controls to src/main.js');
} else {
  console.error('oldKeydown not found');
}

// 2. Update Deep Space waypoint subtext
const oldDeepSub = "if (subElem) subElem.innerText = 'Inspect Subsystems or Click JPL Science Labs to Transmit Handshake!';";
const newDeepSub = "if (subElem) subElem.innerText = 'Orient Antenna [W/S/A/D] • Press [E] or Click to Open Science Workbench & Golden Record!';";
if (code.includes(oldDeepSub)) {
  code = code.replace(oldDeepSub, newDeepSub);
  console.log('Updated Deep Space waypoint subtext');
}

// 3. Fix kitty companion visibility & clear coins in launchExpedition for deepspace
const oldKittyLaunch = "kittyCompanion?.setVisible(true);";
const newKittyLaunch = `kittyCompanion?.setVisible(dest !== 'deepspace');
      if (dest === 'deepspace') {
        coinsManager.clearCoins();
      }`;
if (code.includes(oldKittyLaunch)) {
  code = code.replace(oldKittyLaunch, newKittyLaunch);
  console.log('Fixed kittyCompanion and coinsManager in launchExpedition');
}

fs.writeFileSync('src/main.js', code, 'utf8');
console.log('src/main.js updated successfully');

