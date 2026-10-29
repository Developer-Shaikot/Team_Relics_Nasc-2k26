const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Update normal mode waypoint tracker to top: 92px
css = css.replace('.waypoint-tracker-hud {\r\n  position: absolute;\r\n  top: 84px;',
  '.waypoint-tracker-hud {\r\n  position: absolute;\r\n  top: 92px;');

// Update normal mode rover radar to top: 140px
css = css.replace('.rover-radar-hud {\r\n  position: absolute;\r\n  top: 130px;',
  '.rover-radar-hud {\r\n  position: absolute;\r\n  top: 140px;');

// Update fullscreen mode waypoint tracker to top: 56px
css = css.replace('body.fullscreen-mode-active .waypoint-tracker-hud {\r\n  top: 24px !important;',
  'body.fullscreen-mode-active .waypoint-tracker-hud {\r\n  top: 56px !important;');

// Update fullscreen mode rover radar to top: 108px
css = css.replace('body.fullscreen-mode-active .rover-radar-hud {\r\n  top: 76px !important;',
  'body.fullscreen-mode-active .rover-radar-hud {\r\n  top: 108px !important;');

fs.writeFileSync('style.css', css, 'utf8');
console.log('Successfully updated HUD vertical stacking coordinates in style.css');

