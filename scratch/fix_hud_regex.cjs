const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Use regex to match regardless of \r\n or \n
css = css.replace(/body\.fullscreen-mode-active\s+\.waypoint-tracker-hud\s*\{\s*top:\s*24px\s*!important;/,
  'body.fullscreen-mode-active .waypoint-tracker-hud {\r\n  top: 56px !important;');

css = css.replace(/body\.fullscreen-mode-active\s+\.rover-radar-hud\s*\{\s*top:\s*76px\s*!important;/,
  'body.fullscreen-mode-active .rover-radar-hud {\r\n  top: 108px !important;');

// Also ensure normal mode is 92px and 140px
css = css.replace(/\.waypoint-tracker-hud\s*\{\s*position:\s*absolute;\s*top:\s*\d+px;/,
  '.waypoint-tracker-hud {\r\n  position: absolute;\r\n  top: 92px;');

css = css.replace(/\.rover-radar-hud\s*\{\s*position:\s*absolute;\s*top:\s*\d+px;/,
  '.rover-radar-hud {\r\n  position: absolute;\r\n  top: 140px;');

fs.writeFileSync('style.css', css, 'utf8');
console.log('Regex update applied successfully');

