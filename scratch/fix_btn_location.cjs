const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove floating exit button wherever it currently is
const regex = /\s*<!-- FLOATING EXIT FULLSCREEN BUTTON[\s\S]*?<\/button>/g;
html = html.replace(regex, '');

const floatingBtnSnippet = `
  <!-- FLOATING EXIT FULLSCREEN BUTTON (Active in Fullscreen Mode) -->
  <button class="fullscreen-exit-floating-btn" id="btn-exit-fullscreen-floating" title="Exit Fullscreen Mode (Press ESC or F)">
    <span class="exit-icon">⛶</span>
    <span class="exit-text">EXIT FULLSCREEN (ESC)</span>
  </button>
`;

const simHeaderEnd = html.indexOf('</header>', html.indexOf('class="top-nav-bar"'));
if (simHeaderEnd !== -1) {
  const insertPos = simHeaderEnd + '</header>'.length;
  html = html.slice(0, insertPos) + floatingBtnSnippet + html.slice(insertPos);
  console.log('Successfully positioned floating exit button after simulation top-nav-bar');
}

fs.writeFileSync('index.html', html, 'utf8');

