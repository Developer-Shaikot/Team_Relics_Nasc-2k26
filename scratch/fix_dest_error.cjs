const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

// Fix lines 347-350 in switchCelestialBody
const badCode = `      kittyCompanion?.setVisible(dest !== 'deepspace');
      if (dest === 'deepspace') {
        coinsManager.clearCoins();
      }`;

const goodCode = `      kittyCompanion?.setVisible(true);`;

if (code.includes(badCode)) {
  code = code.replace(badCode, goodCode);
  console.log('Successfully fixed switchCelestialBody ReferenceError in src/main.js');
} else {
  console.error('badCode not found');
}

// In launchExpedition, ensure kittyCompanion is hidden only when dest === 'deepspace'
const launchKitty = `      kittyCompanion?.setVisible(true);
      astronautCommander.setVisible(false); // Clean robotic rover
      astronautCommander.setCrashState(false);

      const isBn = questManager?.currentLanguage === 'bn';
      const worldName = dest === 'moon' ? (isBn ? 'চাঁদ' : 'the Moon') : dest === 'deepspace' ? (isBn ? 'ডিপ স্পেস সেন্টার' : 'Deep Space Center') : (isBn ? 'মঙ্গলগ্রহ' : 'Mars');
      kittyCompanion?.speak(isBn ? \`কমান্ডার, \${worldName}-এ স্বাগতম!\` : \`Welcome to \${worldName}, Commander! Follow my guidance arrow!\`);`;

const fixedLaunchKitty = `      kittyCompanion?.setVisible(dest !== 'deepspace');
      astronautCommander.setVisible(false); // Clean robotic rover
      astronautCommander.setCrashState(false);

      const isBn = questManager?.currentLanguage === 'bn';
      const worldName = dest === 'moon' ? (isBn ? 'চাঁদ' : 'the Moon') : dest === 'deepspace' ? (isBn ? 'ডিপ স্পেস সেন্টার' : 'Deep Space Center') : (isBn ? 'মঙ্গলগ্রহ' : 'Mars');
      if (dest !== 'deepspace') {
        kittyCompanion?.speak(isBn ? \`কমান্ডার, \${worldName}-এ স্বাগতম!\` : \`Welcome to \${worldName}, Commander! Follow my guidance arrow!\`);
      }`;

const norm = s => s.replace(/\r\n/g, '\n');
if (norm(code).includes(norm(launchKitty))) {
  code = norm(code).replace(norm(launchKitty), fixedLaunchKitty);
  console.log('Successfully updated launchExpedition kitty check in src/main.js');
}

fs.writeFileSync('src/main.js', code, 'utf8');
console.log('Saved src/main.js');

