// Page-wise interactive guide ("coachmarks").
//
// The first time a cadet reaches a page (Game Hub, the 3D field, a modal), the guide
// bot points at that page's important buttons one at a time with a spotlight and an
// arrow bubble. Built to stay out of the way:
//   • each page's tips show ONCE per cadet profile (replay any time with the 💡 buttons)
//   • only starts after the page has settled and nothing else (wizard, modal, drawer) is open
//   • Skip (this page), Esc, or "Don't show tips again" (all pages), always one click away
//   • the highlighted button stays clickable: using it counts as "got it" and moves on
//   • steps whose button isn't on screen right now are skipped automatically

const STORE_KEY = 'rcd_coachmarks_v1';
const SETTLE_MS = 900; // page must stay the same this long before a tour auto-starts
const POLL_MS = 400;
const BOT_EMOJI = { echo: '🤖', nova: '🐱', orion: '🛸' };

// ---------------------------------------------------------------------------
// Tour content. `target` = CSS selector (or list, first visible wins); no target or
// nothing visible + `center: true` shows the bubble centred. `once` = shown only the
// first time across all tours (used for the shared modal Back/✕ explanation).
// ---------------------------------------------------------------------------
const MODAL_CLOSE_STEPS = [
  {
    target: '.modal-backdrop.active .modal-hdr-back-btn',
    once: 'modal-back',
    en: ['Back to Hub ⬅', 'This takes you straight back to the Game Hub.'],
    bn: ['হাবে ফিরে যাও ⬅', 'এটা চাপলে সরাসরি গেম হাবে ফিরে যাবে।']
  },
  {
    target: '.modal-backdrop.active .modal-close-btn',
    once: 'modal-close',
    en: ['Close ✕', 'Closes this window and keeps you where you were.'],
    bn: ['বন্ধ করো ✕', 'এই উইন্ডোটা বন্ধ করে, তুমি যেখানে ছিলে সেখানেই থাকবে।']
  }
];

const TOURS = {
  hub: [
    {
      target: '.triple-portals-grid',
      en: ['Pick a world 🪐', 'Moon, Mars or Deep Space: tap a card to fly there and explore!'],
      bn: ['একটা জগৎ বেছে নাও 🪐', 'চাঁদ, মঙ্গল নাকি গভীর মহাকাশ? কার্ডে চাপ দিয়ে সেখানে উড়ে যাও!']
    },
    {
      target: '#btn-arcade-play',
      en: ['Start a mission ▶', 'Press PLAY for a guided story mission with your robot buddy.'],
      bn: ['মিশন শুরু করো ▶', 'রোবট বন্ধুর সাথে গাইডেড মিশনের জন্য PLAY চাপো।']
    },
    {
      target: '#btn-arcade-level',
      en: ['Choose a level 🗺️', 'Jump straight to any level you have unlocked.'],
      bn: ['লেভেল বেছে নাও 🗺️', 'যে লেভেলগুলো আনলক করেছ, সরাসরি সেখানে চলে যাও।']
    },
    {
      target: '#hero-dust-hunter-badge',
      en: ['Catch stardust ✨', 'Click the floating crystals in the 3D space to collect coins.'],
      bn: ['স্টারডাস্ট ধরো ✨', '৩D মহাকাশে ভাসমান ক্রিস্টালগুলোতে ক্লিক করে কয়েন জমাও।']
    },
    {
      target: '#hub-profile-click',
      en: ['Your cadet card 🧑‍🚀', 'See your XP and rank. Tap it to view your badges and certificate.'],
      bn: ['তোমার ক্যাডেট কার্ড 🧑‍🚀', 'এখানে তোমার XP আর র‍্যাঙ্ক। চাপ দিলে ব্যাজ আর সার্টিফিকেট দেখবে।']
    },
    {
      target: '#btn-toggle-hub-sidebar',
      en: ['Mission menu ☰', 'Every screen in one place. Shortcut: press M.'],
      bn: ['মিশন মেনু ☰', 'সব স্ক্রিন এক জায়গায়। শর্টকাট: M চাপো।']
    },
    {
      target: '.hub-bottom-bar',
      en: ['Quick tabs', 'Story, Science Labs, Quiz and more, one tap away.'],
      bn: ['দ্রুত ট্যাব', 'গল্প, সায়েন্স ল্যাব, কুইজ আরও অনেক কিছু, এক চাপেই।']
    },
    {
      target: '#hub-tips-btn',
      en: ['Need help again? 💡', 'Tap here any time to see these tips again.'],
      bn: ['আবার সাহায্য লাগবে? 💡', 'যেকোনো সময় এখানে চাপলে টিপসগুলো আবার দেখবে।']
    }
  ],

  game: [
    {
      target: ['#touch-drive-pad', '#drive-touch-controls'],
      center: true,
      en: ['Drive your explorer 🚀', 'Use W A S D or the arrow keys to move. On a phone, use the arrow pad.'],
      bn: ['এক্সপ্লোরার চালাও 🚀', 'W A S D বা অ্যারো কি দিয়ে চলো। ফোনে অ্যারো প্যাড ব্যবহার করো।']
    },
    {
      target: '#waypoint-tracker-hud',
      en: ['Your goal 🎯', 'Shows where to go next and how far away it is.'],
      bn: ['তোমার লক্ষ্য 🎯', 'পরের গন্তব্য কোথায় আর কত দূরে, এখানে দেখাবে।']
    },
    {
      target: '#hud-minimap-container',
      en: ['Radar map 📡', 'The arrow is you. Head for the glowing dot!'],
      bn: ['রাডার ম্যাপ 📡', 'তীর চিহ্নটা তুমি। জ্বলজ্বলে বিন্দুর দিকে যাও!']
    },
    {
      target: '#rover-radar-hud',
      center: true,
      en: ['Scan relics 🔍', 'When you get close to a relic, press E to scan and discover it.'],
      bn: ['রেলিক স্ক্যান করো 🔍', 'কোনো রেলিকের কাছে গেলে E চাপো, স্ক্যান করে আবিষ্কার করো।']
    },
    {
      target: ['#open-missions-btn', '#scanner-panel'],
      en: ['Missions 📋', 'See your mission list and progress here.'],
      bn: ['মিশন 📋', 'তোমার মিশনের তালিকা আর অগ্রগতি এখানে।']
    },
    {
      target: '#cam-orbit',
      en: ['Camera views 🎥', 'Switch between orbit, rover and top-down cameras.'],
      bn: ['ক্যামেরা ভিউ 🎥', 'অরবিট, রোভার আর উপর থেকে দেখার ক্যামেরা বদলাও।']
    },
    {
      target: '#btn-exit-fullscreen-floating',
      en: ['Exit fullscreen ⛶', 'Show all the control panels again. Shortcut: press F.'],
      bn: ['ফুলস্ক্রিন বন্ধ ⛶', 'সব কন্ট্রোল প্যানেল আবার দেখাও। শর্টকাট: F চাপো।']
    },
    {
      target: '#btn-in-game-back-to-hub',
      en: ['Back to Hub ⬅', 'Return to the Game Hub whenever you like.'],
      bn: ['হাবে ফেরো ⬅', 'যখন খুশি গেম হাবে ফিরে যাও।']
    },
    {
      target: '#game-tips-btn',
      en: ['Tips any time 💡', 'Forgot something? Tap here to see these tips again.'],
      bn: ['যেকোনো সময় টিপস 💡', 'কিছু ভুলে গেছ? এখানে চাপলে টিপস আবার দেখবে।']
    }
  ],

  'modal:missions-modal-backdrop': [
    {
      target: '#missions-list-container',
      en: ['Mission list 🗺️', 'Each card is a mission. Tap one to start it!'],
      bn: ['মিশনের তালিকা 🗺️', 'প্রতিটা কার্ড একটা মিশন। চাপ দিয়ে শুরু করো!']
    },
    ...MODAL_CLOSE_STEPS
  ],
  'modal:minigame-modal-backdrop': [
    {
      target: '#minigame-workbench-container',
      en: ['Science workbench 🧪', 'Follow the steps, use the real NASA tools, and earn gems!'],
      bn: ['বিজ্ঞানের ওয়ার্কবেঞ্চ 🧪', 'ধাপগুলো মেনে নাসার আসল যন্ত্র ব্যবহার করো আর জেম জেতো!']
    },
    ...MODAL_CLOSE_STEPS
  ],
  'modal:quiz-modal-backdrop': [
    {
      target: '#quiz-modal-container',
      en: ['Space quiz 🏆', 'Answer questions to earn XP and climb the leaderboard.'],
      bn: ['স্পেস কুইজ 🏆', 'প্রশ্নের উত্তর দিয়ে XP জেতো আর লিডারবোর্ডে ওঠো।']
    },
    ...MODAL_CLOSE_STEPS
  ],
  'modal:robot-customizer-backdrop': [
    {
      target: '#robot-preview-pod',
      en: ['Your robot buddy 🤖', 'Pick colours and a personality. Watch it change here!'],
      bn: ['তোমার রোবট বন্ধু 🤖', 'রং আর স্বভাব বেছে নাও, এখানে বদলে যেতে দেখো!']
    },
    {
      target: '#btn-save-robot-config',
      en: ['Save it 💾', 'Happy with your robot? Save to keep it.'],
      bn: ['সেভ করো 💾', 'রোবট পছন্দ হয়েছে? সেভ করে রেখে দাও।']
    },
    ...MODAL_CLOSE_STEPS
  ]
};

// Any other modal gets just the shared Back/✕ explanation (shown once overall)
const DEFAULT_MODAL_TOUR = MODAL_CLOSE_STEPS;

const UI = {
  en: { tip: 'TIP', next: 'Next ➔', done: 'Got it! ✓', back: '⬅ Back', skip: 'Skip', off: "🔕 Don't show tips again", on: '🔔 Turn tips back on',
        toastOff: 'Tips are off. Tap 💡 any time to see them.', toastSkip: 'Tap 💡 any time to see tips again.', toastOn: 'Tips are back on!' },
  bn: { tip: 'টিপ', next: 'পরের ➔', done: 'বুঝেছি! ✓', back: '⬅ আগের', skip: 'বাদ দাও', off: '🔕 আর টিপস দেখিও না', on: '🔔 টিপস আবার চালু করো',
        toastOff: 'টিপস বন্ধ। যেকোনো সময় 💡 চাপলে দেখবে।', toastSkip: 'যেকোনো সময় 💡 চাপলে টিপস আবার দেখবে।', toastOn: 'টিপস আবার চালু হয়েছে!' }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isShown(el) {
  if (!el || !el.isConnected) return false;
  if (typeof el.checkVisibility === 'function') {
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
  } else {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    }
  }
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return false;
  // Panels slid off the side (fullscreen retraction) don't count; below-the-fold does (we scroll to it)
  return r.right > 0 && r.left < window.innerWidth;
}

function firstShown(selectors) {
  for (const sel of [].concat(selectors || [])) {
    for (const el of document.querySelectorAll(sel)) if (isShown(el)) return el;
  }
  return null;
}

const byId = (id) => document.getElementById(id);
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
export class CoachmarkGuide {
  constructor({ getProfileId = () => null, getLang = () => 'en', getBotId = () => 'echo', playSound = () => {} } = {}) {
    this.getProfileId = getProfileId;
    this.getLang = getLang;
    this.getBotId = getBotId;
    this.playSound = playSound;

    this.active = null; // { page, steps, index, el }
    this.pendingPage = null;
    this.pendingSince = 0;
    this.raf = 0;

    this.buildDom();
    this.bindGlobal();
    this.pollTimer = setInterval(() => this.poll(), POLL_MS);
  }

  // ---------------- persistence (per cadet profile) ----------------
  readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  profileState() {
    const all = this.readStore();
    const key = this.getProfileId() || 'guest';
    const st = all[key] || {};
    return { all, key, st: { off: !!st.off, seen: st.seen || {}, once: st.once || {} } };
  }
  saveProfileState(mutator) {
    const { all, key, st } = this.profileState();
    mutator(st);
    all[key] = st;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(all)); } catch (e) {}
  }
  get tipsOff() { return this.profileState().st.off; }

  setTipsOff(off) {
    this.saveProfileState((st) => { st.off = off; });
  }

  // ---------------- page detection ----------------
  currentPage() {
    if (isShown(byId('aqua-splash-screen'))) return null;
    if (byId('aqua-guided-modal-backdrop')?.classList.contains('active')) return null;
    if (isShown(byId('cadet-profile-switcher-modal'))) return null;
    if (byId('hub-drawer-sidebar')?.classList.contains('active')) return null;

    const modals = [...document.querySelectorAll('.modal-backdrop.active')].filter(isShown);
    if (modals.length > 1) return null;
    if (modals.length === 1) return modals[0].id ? `modal:${modals[0].id}` : null;

    if (isShown(byId('game-hub-screen'))) return 'hub';
    if (isShown(byId('btn-in-game-back-to-hub'))) return 'game';
    return null;
  }

  stepsFor(page) {
    if (TOURS[page]) return TOURS[page];
    if (page?.startsWith('modal:')) return DEFAULT_MODAL_TOUR;
    return [];
  }

  poll() {
    this.syncGameTipsButton();
    const page = this.currentPage();

    if (this.active) {
      // Page changed under us (user used the highlighted button, a modal popped up...): get out of the way
      if (page !== this.active.page) this.end({ silent: true });
      return;
    }

    if (page !== this.pendingPage) {
      this.pendingPage = page;
      this.pendingSince = Date.now();
      return;
    }
    if (!page || Date.now() - this.pendingSince < SETTLE_MS) return;

    const { st } = this.profileState();
    if (st.off || st.seen[page]) return;
    this.start(page);
  }

  // ---------------- public API ----------------
  /** Start the tour for `page` (defaults to the current page). `force` ignores seen/off (💡 buttons). */
  start(page = this.currentPage(), { force = false } = {}) {
    if (!page) return false;
    if (this.active) this.end({ silent: true });

    const { st } = this.profileState();
    const steps = this.stepsFor(page).filter((s) => force || !s.once || !st.once[s.once]);
    const live = steps.filter((s) => s.center || firstShown(s.target));
    if (!live.length) {
      // Nothing to show here right now; don't keep re-checking this page
      if (!force) this.saveProfileState((s) => { s.seen[page] = true; });
      return false;
    }

    // Mark as seen up front: if the tour gets interrupted it won't keep popping back
    this.saveProfileState((s) => {
      s.seen[page] = true;
      live.forEach((step) => { if (step.once) s.once[step.once] = true; });
    });

    this.active = { page, steps: live, index: 0, el: null, forced: force };
    this.root.hidden = false;
    this.root.classList.toggle('coach-reduced', !!reducedMotion());
    requestAnimationFrame(() => this.root.classList.add('coach-visible'));
    this.playSound('open');
    this.showStep(0);
    this.loop();
    return true;
  }

  /** Clear "seen" for this cadet so every page shows its tips again, and turn tips on. */
  resetAll() {
    this.saveProfileState((st) => { st.seen = {}; st.once = {}; st.off = false; });
  }

  end({ silent = false, toast = null } = {}) {
    if (!this.active) return;
    this.active = null;
    cancelAnimationFrame(this.raf);
    this.root.classList.remove('coach-visible');
    const hide = () => { if (!this.active) this.root.hidden = true; };
    if (reducedMotion()) hide(); else setTimeout(hide, 220);
    if (!silent) this.playSound('close');
    if (toast) this.toast(toast);
  }

  // ---------------- DOM ----------------
  buildDom() {
    const root = document.createElement('div');
    root.className = 'coach-root';
    root.id = 'coach-root';
    root.hidden = true;
    root.innerHTML = `
      <div class="coach-shield" data-side="top"></div>
      <div class="coach-shield" data-side="bottom"></div>
      <div class="coach-shield" data-side="left"></div>
      <div class="coach-shield" data-side="right"></div>
      <div class="coach-spot" aria-hidden="true"></div>
      <div class="coach-tip" role="dialog" aria-modal="false" aria-labelledby="coach-tip-title" aria-describedby="coach-tip-text">
        <div class="coach-arrow" aria-hidden="true"></div>
        <div class="coach-tip-head">
          <span class="coach-bot" aria-hidden="true"></span>
          <div class="coach-tip-heading">
            <span class="coach-count"></span>
            <h4 class="coach-title" id="coach-tip-title"></h4>
          </div>
        </div>
        <p class="coach-text" id="coach-tip-text"></p>
        <div class="coach-dots" aria-hidden="true"></div>
        <div class="coach-actions">
          <button type="button" class="coach-btn coach-skip"></button>
          <span class="coach-spacer"></span>
          <button type="button" class="coach-btn coach-back"></button>
          <button type="button" class="coach-btn coach-next"></button>
        </div>
        <button type="button" class="coach-off"></button>
      </div>
      <div class="coach-toast" role="status" aria-live="polite"></div>`;
    document.body.appendChild(root);

    this.root = root;
    this.shields = [...root.querySelectorAll('.coach-shield')];
    this.spot = root.querySelector('.coach-spot');
    this.tip = root.querySelector('.coach-tip');
    this.arrow = root.querySelector('.coach-arrow');
    this.toastEl = root.querySelector('.coach-toast');
    // Toast must be visible even when the tour itself is closed
    document.body.appendChild(this.toastEl);

    root.querySelector('.coach-next').addEventListener('click', () => this.next());
    root.querySelector('.coach-back').addEventListener('click', () => this.prev());
    root.querySelector('.coach-skip').addEventListener('click', () => this.skip());
    root.querySelector('.coach-off').addEventListener('click', () => this.toggleOff());
    // Clicking the dimmed area doesn't kill the tour (kids tap everywhere), it just nudges the Next button
    this.shields.forEach((s) => s.addEventListener('click', () => this.nudge()));
  }

  bindGlobal() {
    // Capture phase so the game's own Esc / arrow / F / M shortcuts don't also fire while a tip is open
    window.addEventListener('keydown', (e) => {
      if (!this.active || e.target?.matches?.('input, textarea')) return;
      const k = e.key;
      // Enter on a focused tip button (Back / Skip / ...) should press that button, not jump ahead
      if (k === 'Enter' && this.root.contains(document.activeElement)) return;
      if (k === 'Escape') this.skip();
      else if (k === 'ArrowRight' || k === 'Enter') this.next();
      else if (k === 'ArrowLeft') this.prev();
      else return;
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);

    // Using the highlighted button = "got it": advance (or the page change closes the tour)
    document.addEventListener('click', (e) => {
      if (!this.active?.el || this.root.contains(e.target)) return;
      if (this.active.el.contains(e.target)) {
        const idx = this.active.index;
        setTimeout(() => { if (this.active && this.active.index === idx) this.next(); }, 260);
      }
    }, true);

    window.addEventListener('resize', () => this.active && this.position());

    byId('hub-tips-btn')?.addEventListener('click', () => this.replay());
    byId('game-tips-btn')?.addEventListener('click', () => this.replay());
  }

  replay() {
    const page = this.currentPage();
    if (!this.start(page, { force: true })) this.toast(this.ui().toastSkip);
  }

  ui() { return UI[this.getLang() === 'bn' ? 'bn' : 'en']; }

  // ---------------- step rendering ----------------
  showStep(index) {
    const a = this.active;
    if (!a) return;
    // Re-resolve: a step's button may have disappeared since the tour started
    let i = index;
    const dir = index >= a.index ? 1 : -1;
    while (i >= 0 && i < a.steps.length && !(a.steps[i].center || firstShown(a.steps[i].target))) i += dir;
    if (i < 0) i = a.index;
    if (i >= a.steps.length) { this.end(); return; }

    a.index = i;
    const step = a.steps[i];
    a.el = firstShown(step.target);
    const ui = this.ui();
    const [title, text] = step[this.getLang() === 'bn' ? 'bn' : 'en'];
    const last = i === a.steps.length - 1;

    this.tip.querySelector('.coach-bot').textContent = BOT_EMOJI[this.getBotId()] || BOT_EMOJI.echo;
    this.tip.querySelector('.coach-count').textContent = `${ui.tip} ${i + 1} / ${a.steps.length}`;
    this.tip.querySelector('.coach-title').textContent = title;
    this.tip.querySelector('.coach-text').textContent = text;
    this.tip.querySelector('.coach-dots').innerHTML = a.steps
      .map((_, d) => `<span class="${d === i ? 'on' : d < i ? 'done' : ''}"></span>`).join('');

    const back = this.tip.querySelector('.coach-back');
    back.textContent = ui.back;
    back.hidden = i === 0;
    const next = this.tip.querySelector('.coach-next');
    next.textContent = last ? ui.done : ui.next;
    const skip = this.tip.querySelector('.coach-skip');
    skip.textContent = ui.skip;
    skip.hidden = last;
    this.tip.querySelector('.coach-off').textContent = this.tipsOff ? ui.on : ui.off;

    // Bring below-the-fold targets into view before measuring
    if (a.el) {
      const r = a.el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        a.el.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
    }

    this.tip.classList.remove('coach-pop');
    void this.tip.offsetWidth; // restart the pop animation
    this.tip.classList.add('coach-pop');
    this.position();
    next.focus({ preventScroll: true });
  }

  next() {
    if (!this.active) return;
    if (this.active.index >= this.active.steps.length - 1) { this.end(); return; }
    this.playSound('step');
    this.showStep(this.active.index + 1);
  }

  prev() {
    if (!this.active || this.active.index === 0) return;
    this.playSound('step');
    this.showStep(this.active.index - 1);
  }

  skip() {
    const firstSkip = !this.profileState().st.once.__skipToast;
    if (firstSkip) this.saveProfileState((st) => { st.once.__skipToast = true; });
    this.end({ toast: firstSkip ? this.ui().toastSkip : null });
  }

  toggleOff() {
    const nowOff = !this.tipsOff;
    this.setTipsOff(nowOff);
    if (nowOff) this.end({ toast: this.ui().toastOff });
    else {
      this.tip.querySelector('.coach-off').textContent = this.ui().off;
      this.toast(this.ui().toastOn);
    }
  }

  nudge() {
    const btn = this.tip.querySelector('.coach-next');
    btn.classList.remove('coach-nudge');
    void btn.offsetWidth;
    btn.classList.add('coach-nudge');
  }

  toast(msg) {
    if (!msg) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastEl.classList.remove('show'), 3200);
  }

  loop() {
    cancelAnimationFrame(this.raf);
    const tick = () => {
      if (!this.active) return;
      this.position();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  // ---------------- geometry ----------------
  position() {
    const a = this.active;
    if (!a) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const M = 12; // viewport margin
    const PAD = 8; // spotlight padding around the target
    const GAP = 16; // distance between spotlight and bubble (room for the arrow)

    let hole = null;
    if (a.el && a.el.isConnected) {
      const r = a.el.getBoundingClientRect();
      const left = Math.max(4, r.left - PAD);
      const top = Math.max(4, r.top - PAD);
      const right = Math.min(vw - 4, r.right + PAD);
      const bottom = Math.min(vh - 4, r.bottom + PAD);
      if (right - left > 4 && bottom - top > 4) hole = { left, top, right, bottom, w: right - left, h: bottom - top };
    }

    // Spotlight (its huge box-shadow does the dimming); a zero-size centred spot dims everything
    const s = this.spot.style;
    if (hole) {
      s.left = `${hole.left}px`; s.top = `${hole.top}px`; s.width = `${hole.w}px`; s.height = `${hole.h}px`;
      this.spot.classList.remove('coach-spot-none');
    } else {
      s.left = `${vw / 2}px`; s.top = `${vh / 2}px`; s.width = '0px'; s.height = '0px';
      this.spot.classList.add('coach-spot-none');
    }

    // Click shields around the hole (the hole itself stays clickable)
    const h = hole || { left: vw / 2, top: vh / 2, right: vw / 2, bottom: vh / 2 };
    const set = (el, l, t, w, ht) => Object.assign(el.style, { left: `${l}px`, top: `${t}px`, width: `${Math.max(0, w)}px`, height: `${Math.max(0, ht)}px` });
    const [top, bottom, left, right] = this.shields;
    set(top, 0, 0, vw, h.top);
    set(bottom, 0, h.bottom, vw, vh - h.bottom);
    set(left, 0, h.top, h.left, h.bottom - h.top);
    set(right, h.right, h.top, vw - h.right, h.bottom - h.top);

    // Bubble placement
    const tw = this.tip.offsetWidth;
    const th = this.tip.offsetHeight;
    let x; let y; let side = 'none';
    if (!hole) {
      x = (vw - tw) / 2; y = (vh - th) / 2;
    } else {
      const cx = hole.left + hole.w / 2;
      const cy = hole.top + hole.h / 2;
      const fits = {
        bottom: hole.bottom + GAP + th <= vh - M,
        top: hole.top - GAP - th >= M,
        right: hole.right + GAP + tw <= vw - M,
        left: hole.left - GAP - tw >= M
      };
      side = ['bottom', 'top', 'right', 'left'].find((k) => fits[k]) || 'over';
      if (side === 'bottom' || side === 'top') {
        x = cx - tw / 2;
        y = side === 'bottom' ? hole.bottom + GAP : hole.top - GAP - th;
      } else if (side === 'right' || side === 'left') {
        x = side === 'right' ? hole.right + GAP : hole.left - GAP - tw;
        y = cy - th / 2;
      } else {
        // Huge target (e.g. a whole panel): sit inside it, near the bottom
        x = cx - tw / 2;
        y = Math.min(hole.bottom - th - M, vh - th - M);
      }
      x = Math.min(Math.max(M, x), vw - tw - M);
      y = Math.min(Math.max(M, y), vh - th - M);

      // Arrow points at the target centre, clamped to the bubble's edge
      const A = this.arrow.style;
      if (side === 'bottom' || side === 'top') {
        A.left = `${Math.min(Math.max(18, cx - x), tw - 18)}px`;
        A.top = '';
      } else if (side === 'right' || side === 'left') {
        A.top = `${Math.min(Math.max(18, cy - y), th - 18)}px`;
        A.left = '';
      }
    }
    this.tip.dataset.side = side;
    this.tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  // In-game 💡 button sits right next to the in-game "Back to Hub" button
  syncGameTipsButton() {
    const tipsBtn = byId('game-tips-btn');
    const backBtn = byId('btn-in-game-back-to-hub');
    if (!tipsBtn) return;
    const show = isShown(backBtn);
    tipsBtn.style.display = show ? 'inline-flex' : 'none';
    if (show) {
      const r = backBtn.getBoundingClientRect();
      tipsBtn.style.left = `${Math.round(r.right + 10)}px`;
      tipsBtn.style.top = `${Math.round(r.top + (r.height - tipsBtn.offsetHeight) / 2)}px`;
    }
  }
}
