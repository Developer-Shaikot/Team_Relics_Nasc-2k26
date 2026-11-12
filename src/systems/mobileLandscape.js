// Phones and tablets play the game in landscape.
//
// - Marks touch devices with `html.touch-ui` so mobile-landscape.css can switch on.
// - Portrait on a touch screen (up to 1024 px wide) shows a "turn your device" card
//   (pure CSS: the card is always in the DOM, the media query decides when it shows).
// - In fullscreen, asks the browser to lock the screen to landscape (Android Chrome
//   supports this; iOS ignores it and the rotate card covers that case).
// - On the 3D game screen, adds an on-screen D-pad and an action button. They send the
//   same W/A/S/D/E key events the keyboard does, so the rover, Voyager rotation and
//   scanning all work without any game-logic changes.

const KEYS = {
  up: { key: 'w', code: 'KeyW', keyCode: 87 },
  down: { key: 's', code: 'KeyS', keyCode: 83 },
  left: { key: 'a', code: 'KeyA', keyCode: 65 },
  right: { key: 'd', code: 'KeyD', keyCode: 68 },
  action: { key: 'e', code: 'KeyE', keyCode: 69 },
};

const TEXT = {
  en: {
    rotateTitle: 'Turn your device sideways',
    rotateBody: 'Relics of the Cosmic Dust plays in landscape. Rotate your phone or tablet to continue.',
    scan: 'SCAN',
    lab: 'LAB',
  },
  bn: {
    rotateTitle: 'ডিভাইসটা আড়াআড়ি করে ধরো',
    rotateBody: 'এই গেমটা ল্যান্ডস্কেপে খেলতে হয়। চালিয়ে যেতে ফোন বা ট্যাবলেট ঘুরিয়ে নাও।',
    scan: 'স্ক্যান',
    lab: 'ল্যাব',
  },
};

const isTouchDevice = () =>
  window.matchMedia?.('(pointer: coarse)').matches ||
  window.matchMedia?.('(any-pointer: coarse)').matches ||
  (navigator.maxTouchPoints || 0) > 0;

const lang = () => (window.__currentWizardLang === 'bn' ? 'bn' : 'en');

function fireKey(type, k) {
  const ev = new KeyboardEvent(type, { key: k.key, code: k.code, keyCode: k.keyCode, which: k.keyCode, bubbles: true, cancelable: true });
  window.dispatchEvent(ev);
}

function isShown(el) {
  if (!el) return false;
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function buildRotateCard() {
  const card = document.createElement('div');
  card.id = 'rotate-device-card';
  card.setAttribute('role', 'alert');
  card.innerHTML = `
    <div class="rotate-card-inner">
      <div class="rotate-phone" aria-hidden="true"><span class="rotate-phone-screen"></span></div>
      <h2 class="rotate-title"></h2>
      <p class="rotate-body"></p>
    </div>`;
  document.body.appendChild(card);
  return card;
}

function buildTouchPad() {
  const pad = document.createElement('div');
  pad.id = 'touch-drive-pad';
  pad.setAttribute('aria-label', 'On-screen driving controls');
  pad.innerHTML = `
    <div class="tdp-dpad">
      <button type="button" class="tdp-btn tdp-up" data-dir="up" aria-label="Forward">▲</button>
      <button type="button" class="tdp-btn tdp-left" data-dir="left" aria-label="Turn left">◀</button>
      <button type="button" class="tdp-btn tdp-right" data-dir="right" aria-label="Turn right">▶</button>
      <button type="button" class="tdp-btn tdp-down" data-dir="down" aria-label="Reverse">▼</button>
    </div>`;
  const action = document.createElement('button');
  action.type = 'button';
  action.id = 'touch-action-btn';
  action.dataset.dir = 'action';
  action.innerHTML = '<span class="tab-key">E</span><span class="tab-label"></span>';
  document.body.appendChild(pad);
  document.body.appendChild(action);
  return { pad, action };
}

// Hold-to-drive: one keydown on press (the rover keeps driving until keyup), and a repeat
// for Voyager in deep space, which turns one step per keydown.
function bindHold(btn) {
  const k = KEYS[btn.dataset.dir];
  let timer = 0;
  let held = false;
  const press = (e) => {
    e.preventDefault();
    if (held) return;
    held = true;
    btn.classList.add('pressed');
    try { btn.setPointerCapture?.(e.pointerId); } catch (err) { /* ignore */ }
    fireKey('keydown', k);
    if (btn.dataset.dir !== 'action') {
      timer = setInterval(() => fireKey('keydown', k), 90);
    }
  };
  const release = () => {
    if (!held) return;
    held = false;
    btn.classList.remove('pressed');
    clearInterval(timer);
    fireKey('keyup', k);
  };
  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('lostpointercapture', release);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
  // Stop the browser's follow-up "click" after a tap: the press can open a modal or a toast
  // under the finger, and that click would land on it (e.g. the Badge Unlocked toast).
  btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  btn.addEventListener('touchend', (e) => { e.preventDefault(); release(); }, { passive: false });
  btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
  return release;
}

function lockLandscape() {
  try {
    const p = screen.orientation?.lock?.('landscape');
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* not supported */ }
}

export function installMobileLandscape() {
  const root = document.documentElement;
  const card = buildRotateCard();
  const { pad, action } = buildTouchPad();
  const releases = [...pad.querySelectorAll('.tdp-btn'), action].map(bindHold);

  // Running inside the Android app (Capacitor): it is always fullscreen, so CSS hides fullscreen toggles
  root.classList.toggle('native-app', !!window.Capacitor?.isNativePlatform?.());

  const syncTouch = () => root.classList.toggle('touch-ui', !!isTouchDevice());
  syncTouch();
  window.matchMedia?.('(pointer: coarse)').addEventListener?.('change', syncTouch);

  const syncText = () => {
    const t = TEXT[lang()];
    card.querySelector('.rotate-title').textContent = t.rotateTitle;
    card.querySelector('.rotate-body').textContent = t.rotateBody;
  };

  // Show the pad only on the live 3D game screen with nothing on top of it.
  let lastState = '';
  const syncPad = () => {
    syncText();
    const inGame =
      root.classList.contains('touch-ui') &&
      isShown(document.getElementById('btn-in-game-back-to-hub')) &&
      !document.getElementById('game-hub-screen')?.classList.contains('active') &&
      !document.querySelector('.modal-backdrop.active') &&
      !document.getElementById('aqua-guided-modal-backdrop')?.classList.contains('active') &&
      !isShown(document.getElementById('aqua-splash-screen'));
    const deepSpace = /voyager|deep space|interstellar/i.test(document.getElementById('active-world-pill')?.textContent || '') ||
      /voyager/i.test(document.getElementById('flight-target-val')?.textContent || '');
    const state = `${inGame}|${deepSpace}|${lang()}`;
    if (state === lastState) return;
    lastState = state;
    root.classList.toggle('touch-game-active', inGame);
    root.classList.toggle('touch-game-deepspace', inGame && deepSpace);
    action.querySelector('.tab-label').textContent = deepSpace ? TEXT[lang()].lab : TEXT[lang()].scan;
    action.setAttribute('aria-label', deepSpace ? 'Open the science lab (E)' : 'Scan the relic (E)');
    if (!inGame) releases.forEach((r) => r());
  };
  syncPad();
  setInterval(syncPad, 300);
  window.addEventListener('resize', syncPad);
  window.addEventListener('blur', () => releases.forEach((r) => r()));

  // Landscape lock works only while fullscreen (Android Chrome). The game asks for
  // fullscreen when a mission starts; also ask on the Start Game tap.
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement && root.classList.contains('touch-ui')) lockLandscape();
  });
  document.addEventListener('click', (e) => {
    if (!root.classList.contains('touch-ui')) return;
    if (!e.target.closest?.('#btn-aqua-splash-start')) return;
    if (!document.fullscreenElement && root.requestFullscreen) {
      root.requestFullscreen({ navigationUI: 'hide' }).then(lockLandscape).catch(() => {});
    }
  }, true);
}
