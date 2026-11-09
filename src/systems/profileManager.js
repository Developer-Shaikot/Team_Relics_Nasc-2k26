/**
 * NASA Space Apps Challenge 2026 - Multi-Cadet Profile & Navigation State Manager
 * 
 * Features:
 * 1. Multi-Profile Storage: Independent profiles each with their own name, age, companion bot,
 *    cosmic dust coins, completed missions, XP, telemetry gems, and unlocked achievements.
 * 2. Log Out & Profile Switcher: Switching profiles preserves all progress of the previous character.
 * 3. Page Reload Persistence: Reloading (F5) restores the exact active screen (3D exploration,
 *    Hub, Roadmap, Minigames, Quiz) instead of throwing the user back to the splash page.
 * 4. Comprehensive Back Navigation: History tracking and unified goBack() handler across all pages.
 */

const STORAGE_PROFILES_KEY = 'nasa_cadet_profiles_db';
const STORAGE_ACTIVE_ID_KEY = 'nasa_active_profile_id';
const STORAGE_SCREEN_KEY = 'nasa_active_screen_state';

export class CadetProfileManager {
  constructor() {
    this.profiles = {};
    this.activeProfile = null;
    this.navigationStack = [];
    this.questManager = null;
    this.coinsManager = null;
    this.kittyCompanion = null;
    this.onStateRestoreCallback = null;

    this.init();
  }

  init() {
    try {
      const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
      if (raw) {
        this.profiles = JSON.parse(raw) || {};
      }
    } catch (e) {
      console.warn('Error reading cadet profiles from localStorage:', e);
      this.profiles = {};
    }

    // Automatic cleanup of accidental empty default duplicates:
    // If an empty unplayed default "Cadet Explorer" (0 XP, 0 missions) exists alongside a played profile, remove it
    const all = Object.values(this.profiles);
    if (all.length > 1) {
      const played = all.find(p => (p.userXP || 0) > 0 || (p.completedMissions || []).length > 0);
      if (played) {
        all.forEach(p => {
          if (p.id !== played.id && (p.name.trim().toUpperCase() === 'CADET EXPLORER') && (p.userXP || 0) === 0 && (p.completedMissions || []).length === 0) {
            delete this.profiles[p.id];
          }
        });
        this.saveDB();
      }
    }

    // Remove accidental duplicates of the same name (older builds made a new "Cadet Explorer"
    // every time someone logged out and pressed Start). Per name, keep the active profile,
    // else the one with the most progress; only delete copies with no progress at all.
    {
      const activeIdNow = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      const progress = p => (p.userXP || 0) + (p.completedMissions || []).length * 1000;
      const groups = {};
      Object.values(this.profiles).forEach(p => {
        const key = (p.name || '').trim().replace(/\s+/g, ' ').toUpperCase();
        (groups[key] = groups[key] || []).push(p);
      });
      let removed = false;
      Object.values(groups).forEach(list => {
        if (list.length < 2) return;
        const keep = list.slice().sort((a, b) =>
          (b.id === activeIdNow) - (a.id === activeIdNow) || progress(b) - progress(a) || (b.lastPlayed || 0) - (a.lastPlayed || 0)
        )[0];
        list.forEach(p => {
          if (p.id !== keep.id && progress(p) === 0) { delete this.profiles[p.id]; removed = true; }
        });
      });
      if (removed) this.saveDB();
    }

    // Check if user has explicitly logged out
    const isExplicitlyLoggedOut = localStorage.getItem('nasa_user_logged_out') === 'true';

    // Load active profile ID
    const activeId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    if (!isExplicitlyLoggedOut) {
      if (activeId && this.profiles[activeId]) {
        this.activeProfile = this.profiles[activeId];
      } else {
        const remaining = Object.values(this.profiles);
        if (remaining.length > 0) {
          const sorted = remaining.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
          this.activeProfile = sorted[0];
          localStorage.setItem(STORAGE_ACTIVE_ID_KEY, this.activeProfile.id);
        } else {
          this.activeProfile = null;
        }
      }
    } else {
      this.activeProfile = null;
    }

    // Attach global reference
    window.profileManager = this;
    window.cadetProfileManager = this;
  }

  attachGameManagers({ questManager, coinsManager, kittyCompanion, onStateRestore }) {
    this.questManager = questManager;
    this.coinsManager = coinsManager;
    this.kittyCompanion = kittyCompanion;
    this.onStateRestoreCallback = onStateRestore;

    if (this.activeProfile) {
      this.syncActiveProfileToGame();
    }
  }

  saveDB() {
    try {
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(this.profiles));
    } catch (e) {
      console.error('Failed to save profiles to localStorage:', e);
    }
  }

  getAllProfiles() {
    return Object.values(this.profiles).sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
  }

  getActiveProfile() {
    return this.activeProfile;
  }

  /** Case- and space-insensitive name lookup ("Cadet Explorer" == "CADET  EXPLORER"). */
  findProfileByName(name) {
    const key = (name || '').trim().replace(/\s+/g, ' ').toUpperCase();
    if (!key) return null;
    return Object.values(this.profiles).find(p => (p.name || '').trim().replace(/\s+/g, ' ').toUpperCase() === key) || null;
  }

  createProfile({ name, age, botId = 'echo', commander = 'asha' }) {
    const trimmedName = (name || 'Cadet Explorer').trim();
    // 6-16 are the quick-pick ages in the wizard; any other age (3-99) can be typed in
    const validAge = Math.max(3, Math.min(99, parseInt(age, 10) || 10));
    const validBot = ['echo', 'nova', 'orion'].includes(botId) ? botId : 'echo';

    // One cadet at a time: while someone is signed in, no new cadet can be created or switched to.
    // (The wizard's answers just update the signed-in cadet.)
    if (this.activeProfile) {
      this.updateActiveProfile({ name: trimmedName, age: validAge, botId: validBot });
      return this.activeProfile;
    }

    // Same name already on this device? That's the same cadet coming back: switch to them
    // (keeping their progress) instead of making a duplicate profile.
    const existing = this.findProfileByName(trimmedName);
    if (existing) {
      if (this.activeProfile && this.activeProfile.id !== existing.id) this.syncProgressFromGame();
      localStorage.removeItem('nasa_user_logged_out');
      existing.age = validAge;
      existing.botId = validBot;
      existing.lastPlayed = Date.now();
      this.activeProfile = existing;
      this.saveDB();
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, existing.id);
      this.syncActiveProfileToLegacyStorage();
      this.syncActiveProfileToGame();
      this.updateUI();
      return existing;
    }

    const id = 'cadet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newProfile = {
      id,
      name: trimmedName,
      age: validAge,
      botId: validBot,
      commander,
      completedMissions: [],
      userXP: 0,
      userGems: 10,
      cosmicDust: 1000,
      currentPlanet: 'mars',
      lastScreen: { screen: 'game-hub', params: { tab: 'home' } },
      createdAt: Date.now(),
      lastPlayed: Date.now()
    };

    localStorage.removeItem('nasa_user_logged_out');
    this.profiles[id] = newProfile;
    this.activeProfile = newProfile;
    this.saveDB();
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);

    // Sync to legacy storage keys for backwards compatibility
    this.syncActiveProfileToLegacyStorage();
    this.syncActiveProfileToGame();
    this.updateUI();

    return newProfile;
  }

  updateActiveProfile(updates = {}) {
    if (!this.activeProfile) return;
    Object.assign(this.activeProfile, updates);
    this.activeProfile.lastPlayed = Date.now();
    this.profiles[this.activeProfile.id] = this.activeProfile;
    this.saveDB();
    this.syncActiveProfileToLegacyStorage();
    this.updateUI();
  }

  syncActiveProfileToLegacyStorage() {
    if (!this.activeProfile) return;
    const p = this.activeProfile;
    try {
      localStorage.setItem('nasa_player_callsign', p.name);
      localStorage.setItem('nasa_player_age', p.age.toString());
      localStorage.setItem('nasa_selected_bot', p.botId);
      localStorage.setItem('nasa_selected_companion', p.botId);
      localStorage.setItem('nasa_cadet_xp', p.userXP.toString());
      localStorage.setItem('nasa_cadet_gems', p.userGems.toString());
      localStorage.setItem('jdsn_cosmic_dust', p.cosmicDust.toString());
      localStorage.setItem('nasa_completed_missions', JSON.stringify(p.completedMissions));
    } catch (e) {}
  }

  syncActiveProfileToGame() {
    if (!this.activeProfile) return;
    const p = this.activeProfile;

    // 1. Sync Quest Manager
    if (this.questManager) {
      this.questManager.completedMissions = new Set(p.completedMissions || []);
      this.questManager.userXP = p.userXP || 0;
      this.questManager.userGems = p.userGems || 10;
      this.questManager.userLevel = Math.max(1, Math.floor((p.userXP || 0) / 500) + 1);
      this.questManager.renderMissionsList?.();
      this.questManager.resetBadgeBaseline?.();
    }

    // 2. Sync Coins Manager
    if (this.coinsManager) {
      this.coinsManager.balance = p.cosmicDust || 1000;
      this.coinsManager.updateDomBalance?.();
    }

    // 3. Sync Companion Bot
    if (this.kittyCompanion && p.botId) {
      this.kittyCompanion.selectCompanion?.(p.botId);
    }

    // 4. Update UI labels
    this.updateUI();
  }

  syncProgressFromGame() {
    if (!this.activeProfile) return;
    let changed = false;

    if (this.questManager) {
      const completedArray = Array.from(this.questManager.completedMissions);
      if (JSON.stringify(completedArray) !== JSON.stringify(this.activeProfile.completedMissions)) {
        this.activeProfile.completedMissions = completedArray;
        changed = true;
      }
      if (this.questManager.userXP !== this.activeProfile.userXP) {
        this.activeProfile.userXP = this.questManager.userXP;
        changed = true;
      }
      if (this.questManager.userGems !== this.activeProfile.userGems) {
        this.activeProfile.userGems = this.questManager.userGems;
        changed = true;
      }
    }

    if (this.coinsManager) {
      if (this.coinsManager.balance !== this.activeProfile.cosmicDust) {
        this.activeProfile.cosmicDust = this.coinsManager.balance;
        changed = true;
      }
    }

    if (changed) {
      this.activeProfile.lastPlayed = Date.now();
      this.profiles[this.activeProfile.id] = this.activeProfile;
      this.saveDB();
      this.syncActiveProfileToLegacyStorage();
      this.updateUI();
    }
  }

  selectProfile(id) {
    if (!this.profiles[id]) return false;
    // One cadet at a time: while someone is signed in, nobody else can get in until they log out
    if (this.activeProfile && this.activeProfile.id !== id) {
      console.warn('Another cadet is signed in. Log out first to switch cadet.');
      return false;
    }
    this.syncProgressFromGame(); // Save whatever current character did

    localStorage.removeItem('nasa_user_logged_out');
    this.activeProfile = this.profiles[id];
    this.activeProfile.lastPlayed = Date.now();
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
    this.saveDB();

    this.syncActiveProfileToLegacyStorage();
    this.syncActiveProfileToGame();

    // Close Profile Switcher Modal if open
    this.closeProfileSwitcherModal();

    // Restore that profile's last screen
    const last = this.activeProfile.lastScreen;
    if (last && last.screen) {
      this.restoreScreen(last.screen, last.params);
    } else {
      window.openGameHub?.();
    }

    return true;
  }

  deleteProfile(id) {
    if (!this.profiles[id]) return;
    delete this.profiles[id];
    this.saveDB();

    if (this.activeProfile && this.activeProfile.id === id) {
      // The signed-in cadet was deleted: back to the start screen (never auto sign-in someone else)
      this.activeProfile = null;
      localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
      this.logout();
    } else {
      this.renderProfileSwitcherModal();
    }
  }

    logout() {
    // 1. Save all progress of currently active character
    this.syncProgressFromGame();

    // 2. Clear active session & set explicit logged out flag
    this.activeProfile = null;
    localStorage.setItem('nasa_user_logged_out', 'true');
    localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
    localStorage.removeItem(STORAGE_SCREEN_KEY);

    // 3. Reset in-game managers to clean fresh 0 state for new player
    if (this.questManager) {
      this.questManager.completedMissions = new Set();
      this.questManager.userXP = 0;
      this.questManager.userGems = 10;
      this.questManager.userLevel = 1;
      this.questManager.renderMissionsList?.();
      this.questManager.updateXPDisplays?.();
    }
    if (this.coinsManager) {
      this.coinsManager.balance = 1000;
      this.coinsManager.updateDomBalance?.();
    }
    try {
      localStorage.setItem('nasa_player_callsign', 'Cadet Explorer');
      localStorage.setItem('nasa_player_age', '10');
      localStorage.setItem('nasa_selected_bot', 'echo');
      localStorage.setItem('nasa_selected_companion', 'echo');
      localStorage.setItem('nasa_cadet_xp', '0');
      localStorage.setItem('nasa_cadet_gems', '10');
      localStorage.setItem('nasa_completed_missions', '[]');
      localStorage.setItem('jdsn_cosmic_dust', '1000');
    } catch (e) {}

    // Reset wizard input fields
    const nameInput = document.getElementById('aqua-cadet-name-input');
    if (nameInput) nameInput.value = '';
    window.setCadetAge?.(10);
    window.selectWizardBot?.('echo');
    window.setAquaStep?.(1);

    // 4. Close profile modal and all active game modals
    this.closeProfileSwitcherModal();
    document.querySelectorAll('.modal-backdrop.active, .aqua-guided-modal-backdrop.active').forEach(m => {
      m.classList.remove('active');
      if (m.id === 'aqua-guided-modal-backdrop') m.style.display = 'none';
    });

    // 5. Close Game Hub
    window.closeGameHub?.();

    // 6. Show the Start Game Screen (aqua-splash-screen) as requested!
    const splash = document.getElementById('aqua-splash-screen');
    if (splash) {
      splash.style.display = 'flex';
      splash.style.pointerEvents = 'auto';
      splash.classList.remove('fading-out');
      splash.classList.add('active');
    }
    window.__isSplashActive = true;

    console.log('🚪 Logged out successfully! Start game screen displayed with 0/0 fresh state.');
  }

  updateUI() {
    if (!this.activeProfile) return;
    const p = this.activeProfile;

    // Hub Labels
    const nameEl = document.getElementById('lbl-hub-user-name');
    if (nameEl) nameEl.innerText = p.name.toUpperCase();

    // Drawer "CALL SIGN / NAME" field, HUD call sign, certificate name (main.js owns these)
    window.syncCallSignUI?.(p.name);

    const rankEl = document.getElementById('lbl-hub-rank');
    if (rankEl) {
      const lvl = Math.max(1, Math.floor((p.userXP || 0) / 500) + 1);
      rankEl.innerText = `LVL ${lvl} SPACE CADET`;
    }

    const xpFill = document.getElementById('hub-xp-fill');
    if (xpFill) {
      const pct = Math.min(100, Math.max(5, ((p.userXP || 0) % 500) / 5));
      xpFill.style.width = `${pct}%`;
    }

    const xpLabel = document.querySelector('.hub-xp-label');
    if (xpLabel) {
      xpLabel.innerText = `${p.userXP || 0} / 500 XP`;
    }

    const dustEl = document.getElementById('hub-dust-val');
    if (dustEl) dustEl.innerText = (p.cosmicDust || 0).toLocaleString();

    const gemsEl = document.getElementById('hub-gems-val');
    if (gemsEl) gemsEl.innerText = (p.userGems || 0).toString();

    // Drawer labels
    const drawerName = document.getElementById('drawer-cadet-name-display');
    if (drawerName) drawerName.innerText = p.name.toUpperCase();

    const drawerRank = document.getElementById('drawer-cadet-rank-display');
    if (drawerRank) {
      const lvl = Math.max(1, Math.floor((p.userXP || 0) / 500) + 1);
      drawerRank.innerText = `LEVEL ${lvl} SPACE EXPLORER`;
    }

    // Avatar
    const avatarEl = document.getElementById('hub-profile-avatar-icon');
    if (avatarEl) {
      avatarEl.innerText = p.botId === 'nova' ? '🐱' : (p.botId === 'orion' ? '🛸' : '🤖');
    }
  }

  // =========================================================================
  // SCREEN ROUTING & RELOAD PERSISTENCE
  // =========================================================================

  recordScreen(screen, params = {}) {
    const state = { screen, params, timestamp: Date.now() };
    try {
      localStorage.setItem(STORAGE_SCREEN_KEY, JSON.stringify(state));
    } catch (e) {}

    if (this.activeProfile) {
      this.activeProfile.lastScreen = state;
      this.profiles[this.activeProfile.id] = this.activeProfile;
      this.saveDB();
    }

    // Add to navigation history stack (avoid consecutive duplicates)
    const last = this.navigationStack[this.navigationStack.length - 1];
    if (!last || last.screen !== screen || JSON.stringify(last.params) !== JSON.stringify(params)) {
      this.navigationStack.push(state);
      if (this.navigationStack.length > 20) this.navigationStack.shift();
    }
  }

  getSavedScreen() {
    if (this.activeProfile?.lastScreen?.screen) {
      return this.activeProfile.lastScreen;
    }
    try {
      const raw = localStorage.getItem(STORAGE_SCREEN_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  restoreScreen(screen, params = {}) {
    if (!screen) return;
    console.log(`[Navigation] Restoring screen: ${screen}`, params);

    // Close any lingering modals
    document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));

    // Suppress splash screen permanently for active sessions
    const splash = document.getElementById('aqua-splash-screen');
    if (splash) {
      splash.style.display = 'none';
      splash.classList.remove('active');
    }
    window.__isSplashActive = false;

    switch (screen) {
      case 'game-3d': {
        const hub = document.getElementById('game-hub-screen');
        if (hub) {
          hub.style.display = 'none';
          hub.classList.remove('active');
        }
        const wizard = document.getElementById('aqua-guided-modal-backdrop');
        if (wizard) {
          wizard.style.display = 'none';
          wizard.classList.remove('active');
        }
        if (params.planet && window.switchCelestialBody) {
          window.switchCelestialBody(params.planet, false);
        }
        if (params.mode && window.setMode) {
          window.setMode(params.mode);
        }
        break;
      }
      case 'game-hub': {
        window.openGameHub?.();
        break;
      }
      case 'missions-roadmap': {
        window.openGameHub?.();
        const p = params.planet || this.activeProfile?.currentPlanet || 'mars';
        this.questManager?.openRoadmapForPlanet?.(p);
        break;
      }
      case 'quiz': {
        window.openGameHub?.();
        window.quizManager?.render?.();
        const qm = document.getElementById('quiz-modal-backdrop');
        if (qm) qm.classList.add('active');
        break;
      }
      case 'badges': {
        window.openGameHub?.();
        this.questManager?.renderBadgesShowcase?.();
        const bm = document.getElementById('badges-modal-backdrop');
        if (bm) bm.classList.add('active');
        break;
      }
      case 'wizard': {
        const step = params.step || 1;
        window.openAquaGuidedModal?.(step);
        break;
      }
      default: {
        window.openGameHub?.();
        break;
      }
    }
  }

  goBack() {
    // If a modal is open, close it and return to current screen
    const openModals = Array.from(document.querySelectorAll('.modal-backdrop.active, .aqua-guided-modal-backdrop.active'));
    if (openModals.length > 0) {
      openModals.forEach(m => {
        m.classList.remove('active');
        if (m.id === 'aqua-guided-modal-backdrop') m.style.display = 'none';
      });
      return;
    }

    // Pop the current state
    if (this.navigationStack.length > 1) {
      this.navigationStack.pop(); // remove current
      const prevState = this.navigationStack[this.navigationStack.length - 1];
      if (prevState) {
        this.restoreScreen(prevState.screen, prevState.params);
        return;
      }
    }

    // Default fallback: Return to Game Hub
    window.openGameHub?.();
  }

  // =========================================================================
  // PROFILE SWITCHER MODAL UI
  // =========================================================================

  openProfileSwitcherModal() {
    let modal = document.getElementById('cadet-profile-switcher-modal');
    if (!modal) {
      this.createProfileSwitcherModalDOM();
      modal = document.getElementById('cadet-profile-switcher-modal');
    }
    this.renderProfileSwitcherModal();
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
    }
  }

  closeProfileSwitcherModal() {
    const modal = document.getElementById('cadet-profile-switcher-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  }

  createProfileSwitcherModalDOM() {
    const div = document.createElement('div');
    div.id = 'cadet-profile-switcher-modal';
    div.className = 'cadet-profile-modal-backdrop';
    div.innerHTML = `
      <div class="cadet-profile-modal-card">
        <div class="cadet-profile-modal-header">
          <div class="cadet-profile-header-badge">
            <span class="badge-dot"></span>
            <span>JDSN CADET REGISTRY • PROFILE MANAGEMENT</span>
          </div>
          <button class="cadet-profile-modal-close" id="btn-close-profile-modal" aria-label="Close">✕</button>
        </div>

        <div class="cadet-profile-modal-body">
          <div class="cadet-profile-title-area">
            <h2>🚀 Choose or Switch Space Cadet</h2>
            <p>Select an existing cadet profile to resume where you left off, or create a new profile with independent mission achievements!</p>
          </div>

          <div class="cadet-profiles-list" id="cadet-profiles-list-container">
            <!-- Dynamically populated -->
          </div>
        </div>

        <div class="cadet-profile-modal-footer">
          <button type="button" class="btn-logout-to-splash" id="btn-modal-logout" title="Log out current cadet and return to Start Game screen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Log Out to Start Screen</span>
          </button>
          <button type="button" class="btn-create-new-cadet" id="btn-register-new-cadet">
            <span>➕ Register New Space Cadet</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    // Event listeners
    document.getElementById('btn-close-profile-modal')?.addEventListener('click', () => {
      if (this.activeProfile) {
        this.closeProfileSwitcherModal();
      } else {
        // Nobody signed in: closing "who's playing?" goes back to the start screen
        // (it used to silently sign in as whichever cadet happened to be first in the list)
        const all = this.getAllProfiles();
        if (all.length > 0) {
          this.logout();
        } else {
          this.closeProfileSwitcherModal();
          window.openAquaGuidedModal?.(1);
        }
      }
    });

    document.getElementById('btn-modal-logout')?.addEventListener('click', () => {
      this.logout();
    });

    document.getElementById('btn-register-new-cadet')?.addEventListener('click', () => {
      this.closeProfileSwitcherModal();
      window.__isRegisteringNewCadet = true;
      // Open Wizard Step 1 for fresh registration
      const nameInput = document.getElementById('aqua-cadet-name-input');
      if (nameInput) nameInput.value = '';
      window.setAquaStep?.(1);
      window.openAquaGuidedModal?.(1);
    });
  }

  renderProfileSwitcherModal() {
    const container = document.getElementById('cadet-profiles-list-container');
    if (!container) return;

    // One cadet at a time: while someone is signed in, only they are listed (Continue / Log Out),
    // and registering a new cadet is hidden. Everyone else shows up again after Log Out.
    const signedIn = this.activeProfile && this.profiles[this.activeProfile.id] ? this.activeProfile : null;
    const allProfiles = signedIn ? [signedIn] : this.getAllProfiles();
    const titleEl = document.querySelector('#cadet-profile-switcher-modal .cadet-profile-title-area h2');
    const introEl = document.querySelector('#cadet-profile-switcher-modal .cadet-profile-title-area p');
    const registerBtn = document.getElementById('btn-register-new-cadet');
    const footerLogout = document.getElementById('btn-modal-logout');
    if (titleEl) titleEl.textContent = signedIn ? `🧑‍🚀 Signed in as ${signedIn.name}` : "🚀 Who's playing?";
    if (introEl) {
      introEl.textContent = signedIn
        ? 'Only one cadet can play at a time. To play as someone else or register a new cadet, log out first.'
        : 'Pick your cadet to continue where you left off, or register a new cadet with their own missions and badges.';
    }
    if (registerBtn) registerBtn.style.display = signedIn ? 'none' : '';
    if (footerLogout) footerLogout.style.display = signedIn ? '' : 'none';

    if (allProfiles.length === 0) {
      container.innerHTML = `
        <div class="cadet-profile-empty">
          <div class="empty-icon">🧑‍🚀</div>
          <h3>No Space Cadet Profiles Found</h3>
          <p>Click below to register your first Space Cadet profile!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = allProfiles.map(p => {
      const isActive = this.activeProfile && this.activeProfile.id === p.id;
      const botEmoji = p.botId === 'nova' ? '🐱' : (p.botId === 'orion' ? '🛸' : '🤖');
      const botName = p.botId === 'nova' ? 'Cyber-Kitty Nova' : (p.botId === 'orion' ? 'Rover-Drone Orion' : 'Astro-Bot Echo');
      const missionCount = (p.completedMissions || []).length;
      const lvl = Math.max(1, Math.floor((p.userXP || 0) / 500) + 1);

      return `
        <div class="cadet-profile-item ${isActive ? 'active-profile-card' : ''}" data-profile-id="${p.id}">
          <div class="profile-item-avatar">${botEmoji}</div>
          <div class="profile-item-details">
            <div class="profile-item-header">
              <span class="profile-item-name">${p.name.toUpperCase()}</span>
              <span class="profile-item-age">Age: ${p.age}</span>
              ${isActive ? '<span class="profile-active-tag">ACTIVE NOW</span>' : ''}
            </div>
            <div class="profile-item-sub">
              <span>Companion: <strong>${botName}</strong></span>
              <span>•</span>
              <span>Rank: <strong>Level ${lvl} Cadet</strong></span>
            </div>
            <div class="profile-item-stats">
              <span class="stat-pill">🪙 ${(p.cosmicDust || 0).toLocaleString()} Dust</span>
              <span class="stat-pill">🌟 ${p.userXP || 0} XP</span>
              <span class="stat-pill">🎯 ${missionCount} / 6 Missions</span>
              <span class="stat-pill">💎 ${p.userGems || 10} Gems</span>
            </div>
          </div>
          <div class="profile-item-actions">
            <button type="button" class="btn-resume-profile" data-action="resume" data-profile-id="${p.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>${isActive ? 'Continue' : 'Sign In &amp; Play'}</span>
            </button>
            ${isActive ? `
            <button type="button" class="btn-logout-profile" data-action="card-logout" data-profile-id="${p.id}" title="Log out this cadet and return to Start Game screen">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Log Out</span>
            </button>
            ` : ''}
            <button type="button" class="btn-delete-profile" data-action="delete" data-profile-id="${p.id}" title="Delete cadet profile">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    container.querySelectorAll('[data-action="card-logout"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.logout();
      });
    });

    container.querySelectorAll('[data-action="resume"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-profile-id');
        this.selectProfile(id);
      });
    });

    container.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-profile-id');
        const prof = this.profiles[id];
        if (!prof) return;
        if (confirm(`Are you sure you want to delete profile "${prof.name}"? All progress for this character will be permanently removed.`)) {
          this.deleteProfile(id);
        }
      });
    });
  }
}

// Global Singleton
export const profileManager = new CadetProfileManager();
window.gameNavigation = {
  push: (screen, params) => profileManager.recordScreen(screen, params),
  goBack: () => profileManager.goBack()
};

