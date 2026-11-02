const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

const oldBtn = `<button class="aqua-splash-start-btn" id="btn-aqua-splash-start" type="button" title="Start Game &amp; Begin Journey">
          <span>START GAME</span>
        </button>`;

const newBtn = `<button class="aqua-splash-start-btn" id="btn-aqua-splash-start" type="button" onclick="window.dismissAquaSplash &amp;&amp; window.dismissAquaSplash(event)" title="Start Game &amp; Begin Journey">
          <span>START GAME</span>
        </button>`;

const oldEndSplash = `      <!-- Subtle NASA Space Apps / JDSN Credit -->
      <div class="aqua-splash-credits">
        <span>NASA SPACE APPS • JUNIOR DEEP SPACE NETWORK</span>
      </div>
    </div>
  </div>`;

const newEndSplash = `      <!-- Subtle NASA Space Apps / JDSN Credit -->
      <div class="aqua-splash-credits">
        <span>NASA SPACE APPS • JUNIOR DEEP SPACE NETWORK</span>
      </div>
    </div>
  </div>

  <script>
    // Fail-safe immediate handler for Start Game button
    window.dismissAquaSplash = function(e) {
      if (e && e.preventDefault) e.preventDefault();
      const splash = document.getElementById('aqua-splash-screen');
      if (splash) {
        splash.classList.add('fading-out');
        splash.classList.remove('active');
        splash.style.pointerEvents = 'none';
        splash.style.display = 'none';
      }
      window.__isSplashActive = false;
      if (typeof window.openAquaGuidedModal === 'function') {
        window.openAquaGuidedModal(1);
      } else {
        const modal = document.getElementById('aqua-guided-modal-backdrop');
        if (modal) modal.classList.add('active');
        const hub = document.getElementById('game-hub-screen');
        if (hub) {
          hub.style.display = 'grid';
          hub.classList.add('active');
        }
      }
    };
    window.startGame = window.dismissAquaSplash;
    window.handleStartGameClick = window.dismissAquaSplash;

    document.addEventListener('DOMContentLoaded', function() {
      const btn = document.getElementById('btn-aqua-splash-start');
      if (btn) {
        btn.addEventListener('click', window.dismissAquaSplash);
        btn.addEventListener('pointerdown', window.dismissAquaSplash);
        btn.addEventListener('touchend', window.dismissAquaSplash);
      }
    });
  </script>`;

const norm = s => s.replace(/\r\n/g, '\n');

if (norm(html).includes(norm(oldBtn))) {
  html = norm(html).replace(norm(oldBtn), norm(newBtn));
  console.log('Updated btn in index.html');
}

if (norm(html).includes(norm(oldEndSplash))) {
  html = norm(html).replace(norm(oldEndSplash), norm(newEndSplash));
  console.log('Added fail-safe script in index.html');
}

fs.writeFileSync('index.html', html, 'utf8');

// 2. Update style.css
let css = fs.readFileSync('style.css', 'utf8');

// Ensure .aqua-guided-modal-backdrop has z-index 100005 so it's above splash screen
css = css.replace(
  /\.aqua-guided-modal-backdrop\s*\{\s*position:\s*fixed;\s*inset:\s*0;\s*z-index:\s*\d+;/,
  `.aqua-guided-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100005;`
);

// Ensure .aqua-splash-action-row and .aqua-splash-start-btn have highest clickability
const oldActionRow = `.aqua-splash-action-row {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}`;

const newActionRow = `.aqua-splash-action-row {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 50;
  pointer-events: auto;
}

.aqua-splash-start-btn * {
  pointer-events: none;
}`;

if (norm(css).includes(norm(oldActionRow))) {
  css = norm(css).replace(norm(oldActionRow), norm(newActionRow));
  console.log('Updated aqua-splash-action-row in style.css');
}

fs.writeFileSync('style.css', css, 'utf8');

// 3. Update src/main.js: Expose dismissAquaSplash and openAquaGuidedModal on window
let main = fs.readFileSync('src/main.js', 'utf8');

const oldDismiss = `  function dismissAquaSplash() {
    if (!aquaSplashScreen) return;
    martianAudio.ensureActive?.();
    martianAudio.playUiSwitch?.();

    aquaSplashScreen.classList.add('fading-out');
    aquaSplashScreen.classList.remove('active');
    isSplashActive = false;
    window.__isSplashActive = false;

    setTimeout(() => {
      aquaSplashScreen.style.display = 'none';
    }, 450);

    // Launch Aqua Explorer Guided Game Wizard at Step 1 (Mission Story)
    openAquaGuidedModal(1);
  }`;

const newDismiss = `  function dismissAquaSplash() {
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
  window.openAquaGuidedModal = openAquaGuidedModal;`;

if (norm(main).includes(norm(oldDismiss))) {
  main = norm(main).replace(norm(oldDismiss), newDismiss);
  console.log('Updated dismissAquaSplash in src/main.js');
}

fs.writeFileSync('src/main.js', main, 'utf8');
console.log('All updates finished successfully.');

