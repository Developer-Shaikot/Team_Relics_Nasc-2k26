const fs = require('fs');

// ==========================================
// 1. UPDATE index.html
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// Update top nav button from Panels to Fullscreen
const oldBtn = `<button class="action-btn" id="toggle-sidebar-btn" title="Toggle HUD Panels for Fullscreen View">
        <span id="sidebar-toggle-icon">🔲</span>
        <span class="btn-text" id="lbl-sidebar-btn">Panels</span>
      </button>`;

const newBtn = `<button class="action-btn highlight-cyan-tab" id="toggle-sidebar-btn" title="Toggle Fullscreen Immersive Exploration Mode (Press F)">
        <span id="sidebar-toggle-icon">⛶</span>
        <span class="btn-text" id="lbl-sidebar-btn">Fullscreen</span>
      </button>`;

if (html.includes(oldBtn)) {
  html = html.replace(oldBtn, newBtn);
  console.log('Updated toggle-sidebar-btn in index.html');
} else {
  console.log('Notice: exact oldBtn string not matched, checking regex...');
  html = html.replace(/<button class="action-btn" id="toggle-sidebar-btn"[\s\S]*?<\/button>/, newBtn);
  console.log('Updated toggle-sidebar-btn via regex');
}

// Add Floating Exit Fullscreen Button after </header>
const floatingExitBtn = `
  <!-- FLOATING EXIT FULLSCREEN BUTTON (Active in Fullscreen Mode) -->
  <button class="fullscreen-exit-floating-btn" id="btn-exit-fullscreen-floating" title="Exit Fullscreen Mode (Press ESC or F)">
    <span class="exit-icon">⛶</span>
    <span class="exit-text">EXIT FULLSCREEN (ESC)</span>
  </button>
`;

if (!html.includes('id="btn-exit-fullscreen-floating"')) {
  html = html.replace('</header>', '</header>\n' + floatingExitBtn);
  console.log('Added floatingExitBtn to index.html');
}

// Add Guider Briefing Modal before <script type="module" src="/src/main.js"></script>
const guiderModalHtml = `
  <!-- =========================================================================
       GUIDER IMMERSIVE EXPEDITION BRIEFING MODAL
       ========================================================================= -->
  <div class="modal-backdrop" id="guider-briefing-modal">
    <div class="modal-card wide-card guider-briefing-card">
      <button class="modal-close-btn" id="guider-briefing-close-btn">✕</button>

      <div class="guider-briefing-header">
        <div class="guider-avatar-circle pulse">
          <span class="guider-avatar-emoji">🤖</span>
        </div>
        <div class="guider-header-meta">
          <div class="modal-type-badge cyan-glow" id="guider-modal-bot-badge">ASTRO-BOT GUIDANCE PROTOCOL</div>
          <h2 class="modal-title" id="guider-modal-title">Immersive Planetary Exploration Active!</h2>
          <div class="modal-abbrev">JDSN Command Directive: Pilot, Collect, Scan &amp; Complete Missions</div>
        </div>
      </div>

      <div class="modal-body scrollable-body guider-briefing-body">
        <div class="guider-speech-callout">
          <div class="speech-quote-icon">💬</div>
          <p class="speech-text" id="guider-briefing-speech">
            "Commander! Fullscreen Immersive Mode is now <strong>ACTIVE</strong>. All distracting telemetry panels have been retracted into the hull. Follow my flight guidance directives below to navigate the terrain, collect cosmic coins, scan NASA relics, and complete the expedition!"
          </p>
        </div>

        <div class="guider-directives-grid">
          <div class="directive-step-card">
            <div class="step-num-pill">01</div>
            <div class="step-icon">🕹️</div>
            <div class="step-content">
              <h4>PILOT &amp; FOLLOW THE BEACON</h4>
              <p>Use <strong>[W] [A] [S] [D]</strong> or <strong>Arrow Keys</strong> to drive your rover across craters and hills. Follow my aerial escort path toward the tall glowing cyan beacon pillar!</p>
            </div>
          </div>

          <div class="directive-step-card">
            <div class="step-num-pill">02</div>
            <div class="step-icon">🪙</div>
            <div class="step-content">
              <h4>COLLECT COSMIC COINS</h4>
              <p>Gather floating gold coins scattered across the landscape. You will need them to fund <strong>Emergency Field Repairs</strong> if dangerous storms (like Sol 5111) roll your rover over!</p>
            </div>
          </div>

          <div class="directive-step-card">
            <div class="step-num-pill">03</div>
            <div class="step-icon">📡</div>
            <div class="step-content">
              <h4>SCAN HISTORIC NASA RELICS</h4>
              <p>When you approach a target (Surveyor 1, Apollo 11, Opportunity, InSight, Voyager 1), the radar card rings. Press <strong>[E]</strong> or click <strong>[SCAN ➔]</strong> to record the historic discovery!</p>
            </div>
          </div>

          <div class="directive-step-card">
            <div class="step-num-pill">04</div>
            <div class="step-icon">🧪</div>
            <div class="step-content">
              <h4>SOLVE JPL LABS TO FINISH</h4>
              <p>Solve interactive science labs (Rocket Δv Staging, APXS Spectroscopy, Marsquake Seismology). Finish all 6 mission levels across Moon and Mars to claim your Space Pioneer Master Certificate!</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer modal-footer-dual centered">
        <button class="modal-action-btn secondary-btn" id="btn-guider-view-roadmap">
          <span>🗺️ VIEW MISSION ROADMAP (LEVELS)</span>
        </button>
        <button class="modal-action-btn glow-gold" id="btn-guider-lets-go">
          <span>🚀 LET'S GO! (CONTINUE EXPEDITION) ➔</span>
        </button>
      </div>
    </div>
  </div>
`;

if (!html.includes('id="guider-briefing-modal"')) {
  html = html.replace('<script type="module" src="/src/main.js"></script>', guiderModalHtml + '\n  <script type="module" src="/src/main.js"></script>');
  console.log('Added guider-briefing-modal to index.html');
}

fs.writeFileSync('index.html', html, 'utf8');

// ==========================================
// 2. UPDATE style.css
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');

const fullscreenStyles = `
/* ==========================================================================
   IMMERSIVE FULLSCREEN MODE & GUIDER BRIEFING MODAL
   ========================================================================== */

/* 1. Panel Retraction Animations when in Fullscreen Mode */
body.fullscreen-mode-active .top-nav-bar {
  transform: translateY(-105%) !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
}

body.fullscreen-mode-active .left-telemetry-panel {
  transform: translateX(-125%) !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
}

body.fullscreen-mode-active .right-scanner-panel {
  transform: translateX(125%) !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
}

body.fullscreen-mode-active .bottom-dock {
  transform: translateY(125%) !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
}

/* Reposition Floating Waypoint & Proximity Radar in Fullscreen Mode */
body.fullscreen-mode-active .waypoint-tracker-hud {
  top: 24px !important;
  transition: top 0.35s ease;
}

body.fullscreen-mode-active .rover-radar-hud {
  top: 76px !important;
  transition: top 0.35s ease;
}

body.fullscreen-mode-active .spaceflight-hud-overlay {
  top: 0 !important;
  height: 100% !important;
  padding-top: 10px !important;
}

/* 2. Floating Exit Fullscreen Button */
.fullscreen-exit-floating-btn {
  position: fixed;
  top: 18px;
  right: 22px;
  z-index: 99999;
  display: none;
  align-items: center;
  gap: 8px;
  background: rgba(8, 16, 36, 0.88);
  border: 1.5px solid rgba(0, 229, 255, 0.5);
  border-radius: 20px;
  padding: 8px 18px;
  color: #00e5ff;
  font-family: var(--font-display);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  cursor: pointer;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(0, 229, 255, 0.3);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.fullscreen-exit-floating-btn:hover {
  background: rgba(0, 229, 255, 0.25);
  border-color: #00e5ff;
  color: #ffffff;
  box-shadow: 0 0 28px rgba(0, 229, 255, 0.7);
  transform: translateY(-2px) scale(1.04);
}

body.fullscreen-mode-active .fullscreen-exit-floating-btn {
  display: inline-flex !important;
  animation: fadeInDown 0.35s ease forwards;
}

/* 3. Guider Mission Briefing Modal Styling */
.guider-briefing-card {
  width: min(94%, 720px) !important;
  background: linear-gradient(135deg, rgba(8, 14, 30, 0.98) 0%, rgba(4, 8, 18, 0.98) 100%) !important;
  border: 1.5px solid rgba(0, 229, 255, 0.45) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 229, 255, 0.3) !important;
  border-radius: 16px !important;
  padding: 24px 28px !important;
}

.guider-briefing-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
  padding-bottom: 14px;
}

.guider-avatar-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(124, 58, 237, 0.35));
  border: 2px solid #00e5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.6);
  flex-shrink: 0;
}

.guider-avatar-emoji {
  font-size: 32px;
}

.guider-header-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.guider-speech-callout {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 18px;
}

.speech-quote-icon {
  font-size: 20px;
  color: #00e5ff;
  flex-shrink: 0;
  margin-top: 2px;
}

.speech-text {
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 1.5;
  color: #e0f2fe;
}

.speech-text strong {
  color: #00e5ff;
}

.guider-directives-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

@media (max-width: 680px) {
  .guider-directives-grid {
    grid-template-columns: 1fr;
  }
}

.directive-step-card {
  position: relative;
  background: rgba(12, 22, 48, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  gap: 12px;
  transition: all 0.25s ease;
}

.directive-step-card:hover {
  background: rgba(16, 32, 68, 0.9);
  border-color: rgba(0, 229, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
}

.step-num-pill {
  position: absolute;
  top: 8px;
  right: 10px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: rgba(0, 229, 255, 0.6);
  letter-spacing: 0.5px;
}

.step-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.directive-step-card h4 {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 800;
  color: #ffb700;
  letter-spacing: 0.5px;
}

.directive-step-card p {
  font-family: var(--font-body);
  font-size: 11.5px;
  color: #cbd5e1;
  line-height: 1.45;
}

.directive-step-card strong {
  color: #00e5ff;
}
`;

if (!css.includes('body.fullscreen-mode-active')) {
  css += '\n' + fullscreenStyles;
  fs.writeFileSync('style.css', css, 'utf8');
  console.log('Appended fullscreenStyles to style.css');
}

// ==========================================
// 3. UPDATE src/main.js
// ==========================================
let js = fs.readFileSync('src/main.js', 'utf8');

const oldToggleSection = `  // Fullscreen HUD Panels Toggle
  let hudPanelsVisible = true;
  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
    hudPanelsVisible = !hudPanelsVisible;
    const leftPanel = document.getElementById('telemetry-panel');
    const rightPanel = document.getElementById('scanner-panel');
    const icon = document.getElementById('sidebar-toggle-icon');
    const btnLabel = document.getElementById('lbl-sidebar-btn');

    if (leftPanel) leftPanel.style.display = hudPanelsVisible ? 'flex' : 'none';
    if (rightPanel && currentMode === 'archaeologist')
      rightPanel.style.display = hudPanelsVisible ? 'flex' : 'none';
    if (icon) icon.innerText = hudPanelsVisible ? '🔲' : '🔳';
    if (btnLabel) btnLabel.innerText = hudPanelsVisible ? 'Panels: ON' : 'Fullscreen';
  });`;

const newToggleSection = `  // =========================================================================
  // IMMERSIVE FULLSCREEN MODE & GUIDER BRIEFING SYSTEM
  // =========================================================================
  let isFullscreenActive = false;

  function setFullscreenMode(active, triggerGuiderModal = true) {
    isFullscreenActive = active;
    document.body.classList.toggle('fullscreen-mode-active', active);

    const icon = document.getElementById('sidebar-toggle-icon');
    const btnLabel = document.getElementById('lbl-sidebar-btn');
    if (icon) icon.innerText = active ? '🔲' : '⛶';
    if (btnLabel) btnLabel.innerText = active ? 'Exit Full' : 'Fullscreen';

    if (active) {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      audioManager?.playUiSwitch();
      if (triggerGuiderModal) {
        showGuiderBriefingModal();
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      audioManager?.playUiSwitch();
    }
  }

  function showGuiderBriefingModal() {
    const modal = document.getElementById('guider-briefing-modal');
    if (!modal) return;

    const botBadge = document.getElementById('guider-modal-bot-badge');
    const botTitle = document.getElementById('guider-modal-title');
    const botSpeech = document.getElementById('guider-briefing-speech');
    const robotName = savedRobotConfig?.name || 'ASTRO-BOT';
    const commanderTitle = selectedCommander === 'asha' ? 'Asha (Dhaka)' : 'Leo (Florida)';

    if (botBadge) botBadge.innerText = \`\${robotName} GUIDANCE PROTOCOL\`;
    if (botTitle) botTitle.innerText = \`Commander \${commanderTitle}! Immersive Exploration Engaged\`;
    if (botSpeech) {
      botSpeech.innerHTML = \`"Commander \${commanderTitle}! Fullscreen Immersive Mode is now <strong>ACTIVE</strong>. All distracting telemetry consoles have retracted into the hull. Follow my guidance directives below to pilot your rover, collect cosmic coins, scan relics, and complete the expedition!"\`;
    }

    modal.classList.add('active');
    audioManager?.playUiAlert();
  }

  // Toggle button in header
  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
    setFullscreenMode(!isFullscreenActive, true);
  });

  // Floating exit button in fullscreen mode
  document.getElementById('btn-exit-fullscreen-floating')?.addEventListener('click', () => {
    setFullscreenMode(false);
  });

  // Close Guider Modal buttons
  document.getElementById('guider-briefing-close-btn')?.addEventListener('click', () => {
    document.getElementById('guider-briefing-modal')?.classList.remove('active');
    audioManager?.playUiClick();
  });

  document.getElementById('btn-guider-lets-go')?.addEventListener('click', () => {
    document.getElementById('guider-briefing-modal')?.classList.remove('active');
    audioManager?.playUiConfirm();
    setMode('drive');
  });

  document.getElementById('btn-guider-view-roadmap')?.addEventListener('click', () => {
    document.getElementById('guider-briefing-modal')?.classList.remove('active');
    audioManager?.playUiClick();
    document.getElementById('missions-modal-backdrop')?.classList.add('active');
  });

  // Keyboard shortcut: Press 'F' to toggle Fullscreen
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      setFullscreenMode(!isFullscreenActive, true);
    }
  });

  // Detect when user exits browser fullscreen via ESC
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isFullscreenActive) {
      setFullscreenMode(false, false);
    }
  });`;

if (js.includes(oldToggleSection)) {
  js = js.replace(oldToggleSection, newToggleSection);
  console.log('Replaced toggle section in src/main.js');
} else {
  console.log('Searching for regex match in src/main.js...');
  js = js.replace(/\/\/ Fullscreen HUD Panels Toggle[\s\S]*?btnLabel\.innerText = hudPanelsVisible \? 'Panels: ON' : 'Fullscreen';\s*\}\);/, newToggleSection);
  console.log('Replaced via regex');
}

fs.writeFileSync('src/main.js', js, 'utf8');
console.log('All updates complete!');

