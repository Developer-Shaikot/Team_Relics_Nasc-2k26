import confetti from 'canvas-confetti';
import { KIDS_MISSIONS_MARS, KIDS_MISSIONS_MOON, FUN_FACTS, COMPANION_BOT_LINES, LEVEL_BADGES_SHOWCASE } from '../data/kidsContent.js';
import { martianAudio } from './audio.js';

export class MissionQuestManager {
  constructor(updateUICallback) {
    this.completedMissions = new Set();
    this.currentLanguage = 'en'; // 'en' or 'bn'
    this.currentPlanet = 'mars'; // 'mars' or 'moon'
    this.userXP = 0;
    this.userGems = 10;
    this.userLevel = 1;
    this.updateUI = updateUICallback;
    this.currentFunFactIndex = 0;
    this.currentViewMode = 'roadmap'; // 'roadmap' | 'list'
    this.selectedMissionId = 'mission_locate';
    this.onMissionActionCallback = null;
    this.onXPChangeCallback = null;
    this.onPlanetChangeCallback = null;

    // Load saved XP from localStorage if available (reset legacy default 1250/1758)
    try {
      const savedXP = localStorage.getItem('nasa_cadet_xp');
      if (savedXP && savedXP !== '1250' && savedXP !== '1758') {
        this.userXP = parseInt(savedXP, 10);
      } else {
        this.userXP = 0;
        localStorage.setItem('nasa_cadet_xp', '0');
      }

      const savedGems = localStorage.getItem('nasa_cadet_gems');
      if (savedGems && savedGems !== '120') {
        this.userGems = parseInt(savedGems, 10);
      } else {
        this.userGems = 10;
        localStorage.setItem('nasa_cadet_gems', '10');
      }

      this.userLevel = Math.max(1, Math.floor(this.userXP / 500) + 1);

      const savedCompleted = localStorage.getItem('nasa_completed_missions');
      if (savedCompleted) {
        JSON.parse(savedCompleted).forEach(id => this.completedMissions.add(id));
      }
    } catch (e) {}

    // Record a badge baseline on first run so the very first new badge gets its pop-up
    try {
      if (localStorage.getItem('nasa_seen_badges') === null) this.resetBadgeBaseline();
    } catch (e) {}
  }

  get activeMissionsList() {
    return this.currentPlanet === 'moon' ? KIDS_MISSIONS_MOON : KIDS_MISSIONS_MARS;
  }

  openRoadmapForPlanet(planet) {
    // If holographic history billboard is active, do not display roadmap modal in the background!
    if (window.__isBillboardActive) return;
    if (planet) this.setPlanet(planet);
    this.renderMissionsList();
    const modal = document.getElementById('missions-modal-backdrop');
    if (modal) modal.classList.add('active');
    martianAudio.playUiSwitch?.();
  }

  playNextLevel() {
    const missions = this.activeMissionsList;
    const nextUncompleted = missions.find(m => !this.completedMissions.has(m.id));
    if (nextUncompleted) {
      if (this.onMissionActionCallback) {
        this.onMissionActionCallback(nextUncompleted.id);
      }
    } else {
      this.openRoadmapForPlanet(this.currentPlanet);
    }
  }

  setPlanet(planet) {
    this.currentPlanet = planet;
    const missions = this.activeMissionsList;
    const firstUncompleted = missions.find(m => !this.completedMissions.has(m.id));
    this.selectedMissionId = firstUncompleted ? firstUncompleted.id : missions[0].id;
    this.renderMissionsList();
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    this.renderMissionsList();
    this.renderFunFact();
    this.updateCompanionBotText();
    this.renderBadgesShowcase();
  }

  addXP(amount) {
    this.userXP += amount;
    this.userGems += Math.floor(amount / 50);

    // Level based on XP: every 500 XP is 1 level (same rule as profile/hub/badges)
    this.userLevel = Math.max(1, Math.floor(this.userXP / 500) + 1);

    try {
      localStorage.setItem('nasa_cadet_xp', this.userXP.toString());
      localStorage.setItem('nasa_cadet_gems', this.userGems.toString());
      localStorage.setItem('nasa_completed_missions', JSON.stringify([...this.completedMissions]));

      // Accrue points to the selected commander
      const activeCmdr = localStorage.getItem('jdsn_selected_commander') || 'asha';
      const storageKey = `jdsn_${activeCmdr}_points`;
      const curPts = parseInt(localStorage.getItem(storageKey) || (activeCmdr === 'asha' ? '3250' : '3410'), 10);
      localStorage.setItem(storageKey, (curPts + amount).toString());
      window.dispatchEvent(new CustomEvent('commanderPointsUpdated'));
    } catch (e) {}

    // Update Top & Hub UI bars
    this.updateXPDisplays();
    window.profileManager?.syncProgressFromGame();
    this.checkNewBadges(); // XP may unlock rank badges (and saved quiz badges)
    if (this.onXPChangeCallback) {
      this.onXPChangeCallback(this.userXP, this.userLevel, this.userGems);
    }
  }

  updateXPDisplays() {
    const xpFill = document.getElementById('hub-xp-fill');
    const xpLabel = document.querySelector('.hub-xp-label');
    const rankLabel = document.getElementById('lbl-hub-rank');
    const gemsVal = document.getElementById('hub-gems-val');
    const dustVal = document.getElementById('hub-dust-val');

    const nextLevelXP = this.userLevel * 500;
    const prevLevelXP = (this.userLevel - 1) * 500;
    const progressInLvl = this.userXP - prevLevelXP;
    const pct = Math.min(100, Math.max(10, Math.round((progressInLvl / 500) * 100)));

    if (xpFill) xpFill.style.width = `${pct}%`;
    if (xpLabel) xpLabel.innerText = `${this.userXP} / ${nextLevelXP} XP`;
    if (gemsVal) gemsVal.innerText = this.userGems.toLocaleString();
    if (dustVal) {
      const storedCoins = localStorage.getItem('jdsn_cosmic_dust');
      dustVal.innerText = storedCoins ? parseInt(storedCoins, 10).toLocaleString() : '1,000';
    }

    if (rankLabel) {
      const isBn = this.currentLanguage === 'bn';
      const rankTitle = this.userLevel >= 6
        ? (isBn ? 'লেভেল ৬ গ্র্যান্ড মাস্টার' : 'LVL 6 GRAND MASTER')
        : this.userLevel >= 4
          ? (isBn ? 'লেভেল ৪ প্রত্নতাত্ত্বিক' : 'LVL 4 ARCHAEOLOGIST')
          : (isBn ? `লেভেল ${this.userLevel} স্পেস ক্যাডেট` : `LVL ${this.userLevel} SPACE CADET`);
      rankLabel.innerText = rankTitle;
    }
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    this.renderMissionsList();
  }

  setSelectedMission(missionId) {
    this.selectedMissionId = missionId;
    this.renderMissionsList();
  }

  markMissionCompleted(missionId, showDiscoveryModal = false, { suppressCertificate = false } = {}) {
    if (this.completedMissions.has(missionId)) return;
    this.completedMissions.add(missionId);

    try {
      const activeCmdr = localStorage.getItem('jdsn_selected_commander') || 'asha';
      const missionKey = `jdsn_${activeCmdr}_missions`;
      const curMissions = parseInt(localStorage.getItem(missionKey) || (activeCmdr === 'asha' ? '8' : '9'), 10);
      localStorage.setItem(missionKey, (curMissions + 1).toString());
      window.dispatchEvent(new CustomEvent('commanderPointsUpdated'));
    } catch (e) {}

    const mission = [...KIDS_MISSIONS_MARS, ...KIDS_MISSIONS_MOON].find(m => m.id === missionId);
    const xpReward = mission?.rewardXP || 150;
    this.addXP(xpReward);

    // Audio fanfare & celebratory confetti
    martianAudio.playTelemetryTransmission();
    this.triggerConfetti();

    // Show celebratory Discovery Popup Dialog if explicitly requested
    if (showDiscoveryModal) {
      this.showMissionDiscoveryModal(mission);
    }

    // Show bot notification
    const botText = this.currentLanguage === 'bn' ? COMPANION_BOT_LINES.mission_done_bn : COMPANION_BOT_LINES.mission_done_en;
    this.showBotDialogue(botText, true);

    const missions = this.activeMissionsList;
    const nextUncompleted = missions.find(m => !this.completedMissions.has(m.id));
    if (nextUncompleted) {
      this.selectedMissionId = nextUncompleted.id;
    } else {
      this.selectedMissionId = 'node_finish';
    }

    this.renderMissionsList();
    this.renderBadgesShowcase();

    const allMarsDone = KIDS_MISSIONS_MARS.every(m => this.completedMissions.has(m.id));
    const allMoonDone = KIDS_MISSIONS_MOON.every(m => this.completedMissions.has(m.id));
    const isCurrentWorldDone = this.currentPlanet === 'moon'
      ? allMoonDone
      : (this.currentPlanet === 'deepspace'
         ? this.completedMissions.has('mission_blackbox')
         : allMarsDone);

    if (isCurrentWorldDone && !suppressCertificate) {
      setTimeout(() => {
        const winText = this.currentLanguage === 'bn' ? COMPANION_BOT_LINES.all_completed_bn : COMPANION_BOT_LINES.all_completed_en;
        this.showBotDialogue(winText, true);
        this.triggerBigConfetti();
        this.showCertificateModal();
      }, 1800);
    }
  }

  showMissionDiscoveryModal(mission) {
    if (!mission) return;
    const isBn = this.currentLanguage === 'bn';

    const discModal = document.getElementById('mission-discovery-modal-backdrop');
    const discBadge = document.getElementById('disc-modal-badge');
    const discTitle = document.getElementById('disc-modal-title');
    const discDesc = document.getElementById('disc-modal-desc');
    const discFact = document.getElementById('disc-modal-fact');
    const discXp = document.getElementById('disc-modal-xp');
    const discDust = document.getElementById('disc-modal-dust');
    const discGems = document.getElementById('disc-modal-gems');
    const discIcon = document.getElementById('disc-modal-icon');

    if (mission.level === 1) {
      if (discBadge) discBadge.innerText = isBn ? 'মিশন ১ সম্পন্ন! 🌟' : 'MISSION 1 COMPLETE! 🌟';
      if (discTitle) discTitle.innerText = isBn ? 'দারুণ করেছ, মহাকাশ অভিযাত্রী! 🌟' : 'Awesome work, Space Explorer! 🌟';
      if (discDesc) discDesc.innerText = isBn ? 'তুমি পেরেছ! তোমার প্রথম Mission সম্পন্ন হয়েছে। এবার আরও কিছু আবিষ্কার করতে প্রস্তুত?' : 'You did it! Your first mission is complete. Ready to explore more?';
    } else {
      if (discBadge) discBadge.innerText = isBn ? `মিশন ${mission.level} সম্পন্ন!` : 'GREAT JOB! MISSION COMPLETED!';
      if (discTitle) discTitle.innerText = isBn ? mission.title_bn : mission.title_en;
      if (discDesc) discDesc.innerText = isBn ? mission.desc_bn : mission.desc_en;
    }
    const homeBtnText = document.getElementById('disc-home-btn-text');
    if (homeBtnText) {
      homeBtnText.innerText = isBn ? '🏠 হোমপেজে যাও' : '🏠 GO TO HOMEPAGE';
    }
    const nextBtnText = document.getElementById('disc-next-btn-text');
    if (nextBtnText) {
      nextBtnText.innerText = isBn ? '🚀 আরও এক্সপ্লোর করো ➔' : '🚀 EXPLORE MORE MISSIONS ➔';
    }
    if (discTitle) discTitle.innerText = isBn ? mission.title_bn : mission.title_en;
    if (discDesc) discDesc.innerText = isBn ? mission.desc_bn : mission.desc_en;
    if (discFact) discFact.innerText = isBn ? (mission.discoveryFact_bn || '') : (mission.discoveryFact_en || '');
    if (discXp) discXp.innerText = `+${mission.rewardXP || 150} XP`;
    if (discDust) discDust.innerText = `+${mission.rewardXP || 150}`;
    if (discGems) discGems.innerText = `+2`;
    if (discIcon) discIcon.innerText = mission.badge || '🏅';

    if (discModal) discModal.classList.add('active');
  }

  triggerConfetti() {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.7 },
        colors: ['#ff5e28', '#00e5ff', '#ffb700', '#ffffff', '#10b981']
      });
    } catch (e) {}
  }

  triggerBigConfetti() {
    try {
      confetti({
        particleCount: 250,
        spread: 140,
        origin: { y: 0.55 },
        colors: ['#ff5e28', '#00e5ff', '#ffb700', '#10b981', '#ec4899', '#38bdf8']
      });
    } catch (e) {}
  }

  renderMissionsList() {
    const container = document.getElementById('missions-list-container');
    const badgeCounter = document.getElementById('badges-earned-counter');
    const progressBar = document.getElementById('missions-progress-bar');
    const topCount = document.getElementById('top-badge-count');
    if (!container) return;

    const missions = this.activeMissionsList;
    const total = missions.length;
    const completedCount = missions.filter(m => this.completedMissions.has(m.id)).length;

    if (badgeCounter) badgeCounter.innerText = `${completedCount} / ${total}`;
    if (topCount) topCount.innerText = `${completedCount}/${total}`;
    if (progressBar) progressBar.style.width = `${(completedCount / total) * 100}%`;

    const isBn = this.currentLanguage === 'bn';

    if (this.currentViewMode === 'roadmap') {
      this.renderRoadmapView(container, isBn, completedCount, total);
    } else {
      this.renderListView(container, isBn, completedCount, total);
    }

    this.attachEventListeners(container);
  }

  renderRoadmapView(container, isBn, completedCount, total) {
    const missions = this.activeMissionsList;
    const isMars = this.currentPlanet === 'mars';

    // Build milestone nodes list for the current world
    const coordsList = [
      { left: '22%', top: '69%' }, // Level 1
      { left: '39%', top: '79%' }, // Level 2
      { left: '58%', top: '67%' }, // Level 3
      { left: '76%', top: '77%' }, // Level 4
      { left: '91%', top: '48%' }, // Level 5
      { left: '66%', top: '25%' }  // Level 6
    ];

    const startNode = isMars ? {
      id: 'node_start',
      type: 'start',
      levelLabel: isBn ? 'শুরু' : 'Start',
      title: isBn ? 'মঙ্গলে অবতরণ' : 'Eagle Crater Base',
      year: '2004',
      icon: '🚀',
      coords: { left: '8%', top: '81%' },
      isDone: true,
      isActive: false,
      isLocked: false,
      badgeName: isBn ? 'লঞ্চপ্যাড ব্যাজ' : 'Launchpad Milestone',
      desc: isBn ? '২০০৪ সালে মঙ্গলের মেরিডিয়ানি প্লেনামে অপরচুনিটি রোভারের ঐতিহাসিক অবতরণ।' : 'Opportunity successfully touches down inside Eagle Crater on Meridiani Planum, Mars.',
      hint: isBn ? 'অভিযান শুরু হয়ে গেছে! পরবর্তী মিশন নোডগুলোতে ক্লিক করো।' : 'The historic voyage began here. Click on the next mission nodes!'
    } : {
      id: 'node_start',
      type: 'start',
      levelLabel: isBn ? 'শুরু' : 'Start',
      title: isBn ? 'শান্ত সাগরে অবতরণ' : 'Tranquility Base',
      year: '1969',
      icon: '🚀',
      coords: { left: '8%', top: '81%' },
      isDone: true,
      isActive: false,
      isLocked: false,
      badgeName: isBn ? 'লুনার লঞ্চপ্যাড ব্যাজ' : 'Lunar Pioneer Milestone',
      desc: isBn ? '১৯৬৯ সালে অ্যাপোলো ১১ মিশনে মানবজাতির প্রথম সফল চন্দ্র অবতরণ।' : 'Apollo 11 touches down at Mare Tranquillitatis: "The Eagle has landed."',
      hint: isBn ? 'চন্দ্র অভিযান শুরু! পরবর্তী মিশন নোডগুলোতে ক্লিক করো।' : 'The historic lunar voyage began here. Click on the next mission nodes!'
    };

    const missionNodes = missions.map((m, idx) => {
      const isDone = this.completedMissions.has(m.id);
      const isNext = !isDone && (idx === 0 || this.completedMissions.has(missions[idx - 1].id));

      return {
        id: m.id,
        type: 'mission',
        levelNumber: m.level,
        levelLabel: isBn ? `লেভেল ${m.level}` : `Level ${m.level}`,
        title: isBn ? m.shortTitle_bn : m.shortTitle_en,
        fullTitle: isBn ? m.title_bn : m.title_en,
        year: m.stationYear,
        icon: m.icon || m.badge,
        coords: coordsList[idx] || { left: `${20 + idx * 12}%`, top: '50%' },
        isDone: isDone,
        isActive: isNext,
        isLocked: !isDone && !isNext,
        badgeName: isBn ? m.badgeName_bn : m.badgeName_en,
        desc: isBn ? m.desc_bn : m.desc_en,
        hint: isBn ? m.hint_bn : m.hint_en,
        badge: m.badge,
        rewardXP: m.rewardXP || 150
      };
    });

    const finishNode = isMars ? {
      id: 'node_finish',
      type: 'finish',
      levelLabel: isBn ? 'চূড়ান্ত লক্ষ্য' : 'Goal',
      title: isBn ? 'মাস্টার সার্টিফিকেট' : 'Master Certificate',
      year: '2085',
      icon: '🎓',
      coords: { left: '28%', top: '23%' },
      isDone: completedCount === total,
      isActive: completedCount === total,
      isLocked: completedCount < total,
      badgeName: isBn ? 'মার্স আর্কিওলজিস্ট মাস্টার সার্টিফিকেট' : 'Mars Planetary Master Certificate',
      desc: isBn ? 'সকল ৬টি মার্স মিশন সফলভাবে সম্পন্ন করে নাসার স্বীকৃতিপ্রাপ্ত সম্মাননা সার্টিফিকেট আনলক করো!' : 'Complete all 6 Mars exploration missions to unlock your official NASA Master Certificate!',
      hint: isBn ? 'সবগুলো মিশন সম্পন্ন হলে এখানে ক্লিক করে সার্টিফিকেট প্রিন্ট করো।' : 'Complete all previous levels to claim your certificate.'
    } : {
      id: 'node_finish',
      type: 'finish',
      levelLabel: isBn ? 'চূড়ান্ত লক্ষ্য' : 'Goal',
      title: isBn ? 'আর্টেমিস মাস্টার' : 'Artemis Master',
      year: '2026',
      icon: '🎓',
      coords: { left: '28%', top: '23%' },
      isDone: completedCount === total,
      isActive: completedCount === total,
      isLocked: completedCount < total,
      badgeName: isBn ? 'লুনার এক্সপ্লোরার গ্র্যান্ড মাস্টার সার্টিফিকেট' : 'Lunar Exploration Grand Master Certificate',
      desc: isBn ? 'সকল ৬টি লুনার মিশন সম্পন্ন করে নাসার চন্দ্র অভিযাত্রী সম্মাননা সার্টিফিকেট আনলক করো!' : 'Complete all 6 Moon exploration missions to unlock your official NASA Master Certificate!',
      hint: isBn ? 'সবগুলো মিশন সম্পন্ন হলে এখানে ক্লিক করে সার্টিফিকেট প্রিন্ট করো।' : 'Complete all previous levels to claim your certificate.'
    };

    const nodes = [startNode, ...missionNodes, finishNode];

    // Find currently selected node data
    let selectedNode = nodes.find(n => n.id === this.selectedMissionId);
    if (!selectedNode) {
      selectedNode = nodes[1]; // fallback to Level 1
      this.selectedMissionId = selectedNode.id;
    }

    const roadmapSuperTitle = isMars
      ? `🪐 ${isBn ? 'মার্স এক্সপেডিশন রোডম্যাপ' : 'MARTIAN EXPEDITION ROADMAP'}`
      : `🌕 ${isBn ? 'লুনার এক্সপেডিশন রোডম্যাপ' : 'LUNAR EXPEDITION ROADMAP'}`;

    container.innerHTML = `
      <div class="roadmap-wrapper">
        <!-- Dual Planet Toggle Selector Tabs -->
        <div class="roadmap-planet-toggle-row">
          <button class="planet-toggle-btn ${isMars ? 'active' : ''}" id="btn-toggle-mars-roadmap">
            🔴 ${isBn ? 'মঙ্গল এক্সপ্লোরেশন রোডম্যাপ' : 'Mars Exploration Roadmap'}
          </button>
          <button class="planet-toggle-btn ${!isMars ? 'active' : ''}" id="btn-toggle-moon-roadmap">
            🌕 ${isBn ? 'চাঁদ এক্সপ্লোরেশন রোডম্যাপ' : 'Moon Exploration Roadmap'}
          </button>
        </div>

        <!-- View Toggle & Header Bar -->
        <div class="roadmap-nav-header">
          <div class="roadmap-title-box">
            <span class="roadmap-super-title">${roadmapSuperTitle}</span>
            <span class="roadmap-sub-badge">${completedCount} / ${total} ${isBn ? 'লেভেল সম্পন্ন' : 'Levels Completed'}</span>
          </div>
          <div class="roadmap-view-switcher">
            <button class="view-switch-btn active" id="btn-view-roadmap">🗺️ ${isBn ? 'রোডম্যাপ' : 'Roadmap'}</button>
            <button class="view-switch-btn" id="btn-view-list">📋 ${isBn ? 'তালিকা' : 'List'}</button>
          </div>
        </div>

        <!-- Space Canvas Area with Animated Dashed Path -->
        <div class="space-roadmap-canvas" id="space-roadmap-canvas">
          <!-- Deep Space Starfield & Cosmic Flares -->
          <div class="space-stars-bg">
            <div class="cosmic-flare flare-center"></div>
            <div class="cosmic-flare flare-top-right"></div>
            <div class="cosmic-nebula ${isMars ? 'nebula-purple' : 'nebula-cyan'}"></div>
            <div class="cosmic-nebula ${isMars ? 'nebula-cyan' : 'nebula-purple'}"></div>
            ${Array.from({ length: 32 }).map((_, i) => {
              const top = Math.floor(Math.sin(i * 13) * 45 + 50);
              const left = Math.floor(Math.cos(i * 17) * 45 + 50);
              const size = (i % 3) + 1.5;
              const delay = (i * 0.3).toFixed(1);
              return `<span class="cosmic-star" style="top:${top}%; left:${left}%; width:${size}px; height:${size}px; animation-delay:${delay}s;"></span>`;
            }).join('')}
          </div>

          <!-- SVG Winding Curved Dashed Road Track -->
          <svg class="roadmap-svg-track" viewBox="0 0 1000 480" preserveAspectRatio="none">
            <defs>
              <linearGradient id="roadGlowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.8"/>
                <stop offset="50%" stop-color="#7c3aed" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#10b981" stop-opacity="0.9"/>
              </linearGradient>
            </defs>

            <!-- Ambient Glow Track -->
            <path 
              d="M 80 390 C 140 390, 160 330, 220 330 C 290 330, 320 380, 390 380 C 470 380, 500 320, 580 320 C 660 320, 690 370, 760 370 C 850 370, 910 320, 910 230 C 910 150, 780 120, 660 120 C 500 120, 400 110, 280 110" 
              fill="none" 
              stroke="rgba(0, 229, 255, 0.25)" 
              stroke-width="8" 
              stroke-linecap="round"
            />

            <!-- Dashed Cosmic Path -->
            <path 
              class="roadmap-dashed-line"
              d="M 80 390 C 140 390, 160 330, 220 330 C 290 330, 320 380, 390 380 C 470 380, 500 320, 580 320 C 660 320, 690 370, 760 370 C 850 370, 910 320, 910 230 C 910 150, 780 120, 660 120 C 500 120, 400 110, 280 110" 
              fill="none" 
              stroke="#9bb5d9" 
              stroke-width="4.5" 
              stroke-dasharray="10 12" 
              stroke-linecap="round"
            />
          </svg>

          <!-- Interactive Node Stations along the S-Curve -->
          <div class="roadmap-nodes-layer">
            ${nodes.map(n => {
              const isSelected = n.id === this.selectedMissionId;
              let stateClass = n.isDone ? 'state-completed' : n.isActive ? 'state-active' : 'state-locked';
              let badgeIconHtml = '';

              if (n.isDone) {
                badgeIconHtml = '<span class="node-state-badge done-badge">✓</span>';
              } else if (n.isActive) {
                badgeIconHtml = '<span class="node-state-badge active-badge">▶</span>';
              } else {
                badgeIconHtml = '<span class="node-state-badge lock-badge">🔒</span>';
              }

              return `
                <div 
                  class="roadmap-station-node ${stateClass} ${isSelected ? 'selected' : ''}" 
                  style="left: ${n.coords.left}; top: ${n.coords.top};"
                  data-node-id="${n.id}"
                  role="button"
                  tabindex="0"
                >
                  <!-- Floating Dome & Base Pedestal -->
                  <div class="station-dome-wrapper">
                    ${badgeIconHtml}
                    <div class="station-dome">
                      <span class="station-icon">${n.icon}</span>
                    </div>
                    <div class="station-pedestal"></div>
                  </div>

                  <!-- Level Tag & Title -->
                  <div class="station-labels">
                    <span class="station-level-tag">${n.levelLabel}</span>
                    <span class="station-title-text">${n.title}</span>
                    ${n.year ? `<span class="station-year-text">${n.year}</span>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Animated Flying Rocket between Roadmap Levels -->
          <div class="roadmap-flying-rocket" id="roadmap-flying-rocket" style="display: none;">
            <div class="rocket-sprite">🚀</div>
            <div class="rocket-thruster-fire"></div>
          </div>

          <!-- Toast Banner for Level Progression -->
          <div class="roadmap-level-advance-toast" id="roadmap-level-advance-toast" style="display: none;"></div>
        </div>

        <!-- Selected Mission HUD Details Panel -->
        <div class="roadmap-details-hud">
          <div class="hud-card-header">
            <div class="hud-header-left">
              <span class="hud-level-pill">${selectedNode.levelLabel || (isBn ? 'মিশন বিবরণ' : 'MISSION BRIEF')}</span>
              <h3 class="hud-mission-title">${selectedNode.fullTitle || selectedNode.title}</h3>
            </div>
            <div class="hud-status-badge ${selectedNode.isDone ? 'done' : selectedNode.isActive ? 'active' : 'locked'}">
              ${selectedNode.isDone ? (isBn ? '✓ সম্পন্ন' : '✓ COMPLETED') : selectedNode.isActive ? (isBn ? '⚡ সক্রিয় লেভেল' : '⚡ ACTIVE LEVEL') : (isBn ? '🔒 লক করা' : '🔒 LOCKED')}
            </div>
          </div>

          <p class="hud-description-text">${selectedNode.desc}</p>

          <div class="hud-meta-row">
            <div class="hud-hint-pill">
              💡 <strong>${isBn ? 'ক্লু' : 'Hint'}:</strong> ${selectedNode.hint}
            </div>
            <div class="hud-reward-pill">
              🏆 ${selectedNode.badgeName}
            </div>
          </div>

          <div class="hud-action-row">
            ${selectedNode.id === 'node_finish' ? `
              <button class="hud-action-btn primary-btn" id="btn-claim-cert" ${selectedNode.isLocked ? 'disabled' : ''}>
                🎓 ${isBn ? 'মাস্টার সার্টিফিকেট দেখুন' : 'VIEW MASTER CERTIFICATE'}
              </button>
            ` : selectedNode.id === 'node_start' ? `
              <button class="hud-action-btn secondary-btn" id="btn-focus-rover">
                🚀 ${isBn ? 'অবতরণ অবস্থানে যান' : (isMars ? 'FOCUS OPPORTUNITY ROVER' : 'FOCUS APOLLO 11 BASE')}
              </button>
            ` : `
              <button class="hud-action-btn primary-btn" id="btn-launch-mission" data-mission-id="${selectedNode.id}">
                ${selectedNode.isDone ? (isBn ? '🔍 পুনরায় ডায়াগনস্টিক স্ক্যান' : '🔍 RE-SCAN TARGET') : (isBn ? '⚡ মিশন শুরু / স্ক্যান করো' : '⚡ LAUNCH MISSION / SCAN')}
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  renderListView(container, isBn, completedCount, total) {
    const missions = this.activeMissionsList;
    const isMars = this.currentPlanet === 'mars';
    const roadmapSuperTitle = isMars
      ? `🪐 ${isBn ? 'মার্স মিশন তালিকা' : 'MARS MISSION OBJECTIVES'}`
      : `🌕 ${isBn ? 'লুনার মিশন তালিকা' : 'MOON MISSION OBJECTIVES'}`;

    container.innerHTML = `
      <div class="roadmap-wrapper">
        <!-- Dual Planet Toggle Selector Tabs -->
        <div class="roadmap-planet-toggle-row">
          <button class="planet-toggle-btn ${isMars ? 'active' : ''}" id="btn-toggle-mars-roadmap">
            🔴 ${isBn ? 'মঙ্গল এক্সপ্লোরেশন রোডম্যাপ' : 'Mars Exploration Roadmap'}
          </button>
          <button class="planet-toggle-btn ${!isMars ? 'active' : ''}" id="btn-toggle-moon-roadmap">
            🌕 ${isBn ? 'চাঁদ এক্সপ্লোরেশন রোডম্যাপ' : 'Moon Exploration Roadmap'}
          </button>
        </div>

        <div class="roadmap-nav-header">
          <div class="roadmap-title-box">
            <span class="roadmap-super-title">${roadmapSuperTitle}</span>
            <span class="roadmap-sub-badge">${completedCount} / ${total} ${isBn ? 'সম্পন্ন' : 'Completed'}</span>
          </div>
          <div class="roadmap-view-switcher">
            <button class="view-switch-btn" id="btn-view-roadmap">🗺️ ${isBn ? 'রোডম্যাপ' : 'Roadmap'}</button>
            <button class="view-switch-btn active" id="btn-view-list">📋 ${isBn ? 'তালিকা' : 'List'}</button>
          </div>
        </div>

        <div class="missions-vertical-list">
          ${missions.map((m) => {
            const isDone = this.completedMissions.has(m.id);
            const title = isBn ? m.title_bn : m.title_en;
            const desc = isBn ? m.desc_bn : m.desc_en;
            const badgeName = isBn ? m.badgeName_bn : m.badgeName_en;
            const hint = isBn ? m.hint_bn : m.hint_en;

            return `
              <div class="mission-card ${isDone ? 'completed' : ''}" data-mission-id="${m.id}">
                <div class="mission-badge-icon ${isDone ? 'unlocked' : 'locked'}">
                  ${m.badge}
                </div>
                <div class="mission-info">
                  <div class="mission-title-row">
                    <span class="m-title">Level ${m.level}: ${title}</span>
                    ${isDone ? '<span class="status-tag done">✓ COMPLETED</span>' : '<span class="status-tag active">ACTIVE</span>'}
                  </div>
                  <p class="m-desc">${desc}</p>
                  <div class="m-hint">💡 <strong>${isBn ? 'ক্লু' : 'Hint'}:</strong> ${hint}</div>
                  <div class="m-reward-tag">🏆 ${badgeName} (+${m.rewardXP || 150} XP)</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  attachEventListeners(container) {
    // Planet Toggle Listeners in Roadmap Modal
    const toggleMars = container.querySelector('#btn-toggle-mars-roadmap');
    if (toggleMars) {
      toggleMars.addEventListener('click', () => {
        this.setPlanet('mars');
        if (this.onPlanetChangeCallback) this.onPlanetChangeCallback('mars');
      });
    }

    const toggleMoon = container.querySelector('#btn-toggle-moon-roadmap');
    if (toggleMoon) {
      toggleMoon.addEventListener('click', () => {
        this.setPlanet('moon');
        if (this.onPlanetChangeCallback) this.onPlanetChangeCallback('moon');
      });
    }

    // Switch to Roadmap View
    const roadmapBtn = container.querySelector('#btn-view-roadmap');
    if (roadmapBtn) {
      roadmapBtn.addEventListener('click', () => {
        this.setViewMode('roadmap');
      });
    }

    // Switch to List View
    const listBtn = container.querySelector('#btn-view-list');
    if (listBtn) {
      listBtn.addEventListener('click', () => {
        this.setViewMode('list');
      });
    }

    // Station Node Clicks on Roadmap
    container.querySelectorAll('.roadmap-station-node').forEach(nodeEl => {
      nodeEl.addEventListener('click', () => {
        const nodeId = nodeEl.dataset.nodeId;
        martianAudio.playScannerBeep(false);
        this.setSelectedMission(nodeId);
      });
    });

    // List View Mission Card Clicks
    container.querySelectorAll('.mission-card').forEach(cardEl => {
      cardEl.addEventListener('click', () => {
        const mId = cardEl.dataset.missionId;
        this.setSelectedMission(mId);
        this.setViewMode('roadmap');
      });
    });

    // Action button: Launch Mission / Scan
    const launchBtn = container.querySelector('#btn-launch-mission');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        const missionId = launchBtn.dataset.missionId;
        this.executeMissionAction(missionId);
      });
    }

    // Action button: Focus Rover / Landing base
    const focusRoverBtn = container.querySelector('#btn-focus-rover');
    if (focusRoverBtn) {
      focusRoverBtn.addEventListener('click', () => {
        const firstMission = this.activeMissionsList[0]?.id || 'mission_locate';
        this.executeMissionAction(firstMission);
      });
    }

    // Action button: View Certificate
    const claimCertBtn = container.querySelector('#btn-claim-cert');
    if (claimCertBtn) {
      claimCertBtn.addEventListener('click', () => {
        const missionsModal = document.getElementById('missions-modal-backdrop');
        if (missionsModal) missionsModal.classList.remove('active');
        this.showCertificateModal(this.currentPlanet === 'moon' ? 'moon' : 'mars');
      });
    }
  }

  executeMissionAction(missionId) {
    // Close missions modal
    const missionsModal = document.getElementById('missions-modal-backdrop');
    if (missionsModal) missionsModal.classList.remove('active');

    // If external callback provided from main.js, execute it
    if (this.onMissionActionCallback) {
      this.onMissionActionCallback(missionId);
    }
  }

  // ---------------------------------------------------------------------------
  // SINGLE SOURCE OF TRUTH FOR ALL BADGES (rank / mission / quiz)
  // Used by the Trophy Room (Cadet Explorer click), unlock toasts and leaderboard.
  // ---------------------------------------------------------------------------
  getQuizResults() {
    try {
      return JSON.parse(localStorage.getItem('nasa_quiz_results') || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  getAllBadges() {
    const isBn = this.currentLanguage === 'bn';
    const quiz = this.getQuizResults();
    const tiers = [
      { tier: 'junior', icon: '🟢', en: 'Junior Quiz Star', bn: 'জুনিয়র কুইজ তারকা' },
      { tier: 'intermediate', icon: '🟡', en: 'Intermediate Quiz Ace', bn: 'ইন্টারমিডিয়েট কুইজ এস' },
      { tier: 'senior', icon: '🟠', en: 'Senior Quiz Scholar', bn: 'সিনিয়র কুইজ স্কলার' },
      { tier: 'expert', icon: '🔴', en: 'Expert Quiz Legend', bn: 'এক্সপার্ট কুইজ লিজেন্ড' }
    ];

    const rank = LEVEL_BADGES_SHOWCASE.map(b => ({
      id: b.id,
      type: 'rank',
      icon: b.icon,
      color: b.color,
      name: isBn ? b.name_bn : (b.name_en || b.name),
      label: isBn ? b.tier_bn : b.tier,
      cond: isBn ? b.unlockCondition_bn : b.unlockCondition_en,
      minXP: b.minXP,
      earned: this.userXP >= b.minXP,
      progress: `${Math.min(this.userXP, b.minXP)} / ${b.minXP} XP`
    }));

    const missions = [...KIDS_MISSIONS_MARS, ...KIDS_MISSIONS_MOON].map(m => ({
      id: `mission:${m.id}`,
      type: 'mission',
      icon: m.badge || m.icon || '🏅',
      color: m.planet === 'moon' ? '#cbd5e1' : '#ff5e28',
      name: isBn ? (m.badgeName_bn || m.badgeName_en) : m.badgeName_en,
      label: `${m.planet === 'moon' ? (isBn ? 'চাঁদ' : 'Moon') : (isBn ? 'মঙ্গল' : 'Mars')} • ${isBn ? 'লেভেল' : 'Level'} ${m.level}`,
      cond: isBn ? m.title_bn : m.title_en,
      earned: this.completedMissions.has(m.id),
      progress: this.completedMissions.has(m.id) ? (isBn ? 'সম্পন্ন' : 'Completed') : (isBn ? 'মিশন বাকি' : 'Mission not done')
    }));

    const quizBadges = tiers.map(t => {
      const r = quiz[t.tier];
      const total = r?.total || 4;
      const need = Math.ceil(total / 2);
      return {
        id: `quiz:${t.tier}`,
        type: 'quiz',
        icon: t.icon,
        color: '#a855f7',
        name: isBn ? t.bn : t.en,
        label: isBn ? 'কুইজ ব্যাজ' : 'Quiz Badge',
        cond: isBn ? `${need}+ সঠিক উত্তর দিয়ে কুইজ শেষ করো` : `Finish this quiz with ${need}+ right answers`,
        earned: !!r && (r.right || 0) >= need,
        progress: r ? `✓ ${r.right} · ✗ ${r.wrong}` : (isBn ? 'খেলা হয়নি' : 'Not played')
      };
    });

    return { rank, missions, quiz: quizBadges };
  }

  getEarnedBadgeCount() {
    const all = this.getAllBadges();
    return [...all.rank, ...all.missions, ...all.quiz].filter(b => b.earned).length;
  }

  // Show a pop-up for every badge earned since last check. First call only records
  // the current state (so old badges don't spam toasts on load).
  checkNewBadges() {
    const all = this.getAllBadges();
    const earned = [...all.rank, ...all.missions, ...all.quiz].filter(b => b.earned);
    let seen = null;
    try { seen = JSON.parse(localStorage.getItem('nasa_seen_badges') || 'null'); } catch (e) {}
    const seenSet = new Set(seen || []);
    const fresh = seen ? earned.filter(b => !seenSet.has(b.id)) : [];
    try { localStorage.setItem('nasa_seen_badges', JSON.stringify(earned.map(b => b.id))); } catch (e) {}
    fresh.forEach((b, i) => setTimeout(() => this.showBadgeToast(b), i * 900));
    this.updateBadgeCountChip(earned.length);
  }

  // After loading/switching a profile: treat its current badges as already seen (no toast spam)
  resetBadgeBaseline() {
    const all = this.getAllBadges();
    const earned = [...all.rank, ...all.missions, ...all.quiz].filter(b => b.earned);
    try { localStorage.setItem('nasa_seen_badges', JSON.stringify(earned.map(b => b.id))); } catch (e) {}
    this.updateBadgeCountChip(earned.length);
  }

  updateBadgeCountChip(count) {
    document.querySelectorAll('.js-earned-badge-count').forEach(el => { el.textContent = String(count); });
  }

  showBadgeToast(badge) {
    const isBn = this.currentLanguage === 'bn';
    const toast = document.createElement('button');
    toast.type = 'button';
    toast.className = 'badge-unlock-toast';
    toast.innerHTML = `
      <span class="but-icon">${badge.icon}</span>
      <span class="but-text">
        <small>🏅 ${isBn ? 'ব্যাজ আনলক হয়েছে!' : 'BADGE UNLOCKED!'}</small>
        <strong>${badge.name}</strong>
        <em>${isBn ? 'দেখতে ক্লিক করো' : 'Tap to see it in your Trophy Room'}</em>
      </span>`;
    toast.addEventListener('click', () => {
      toast.remove();
      this.openTrophyRoom();
    });
    document.body.appendChild(toast);
    martianAudio.playScannerBeep?.(true);
    setTimeout(() => toast.classList.add('leaving'), 4800);
    setTimeout(() => toast.remove(), 5400);
  }

  openTrophyRoom() {
    this.renderBadgesShowcase();
    document.getElementById('badges-modal-backdrop')?.classList.add('active');
  }

  renderBadgesShowcase() {
    const container = document.getElementById('badges-showcase-container');
    if (!container) return;

    const isBn = this.currentLanguage === 'bn';
    const allBadges = this.getAllBadges();
    const earnedCount = [...allBadges.rank, ...allBadges.missions, ...allBadges.quiz].filter(b => b.earned).length;
    const totalCount = allBadges.rank.length + allBadges.missions.length + allBadges.quiz.length;
    // Earned badges first in each section
    const byEarned = list => [...list].sort((a, b) => Number(b.earned) - Number(a.earned));
    const badgeCard = b => `
      <div class="badge-tier-card ${b.earned ? 'unlocked' : 'locked'}">
        <div class="badge-icon-wrap" style="box-shadow: 0 0 16px ${b.color}40;">
          <span class="b-icon">${b.icon}</span>
          ${b.earned ? '<span class="b-check">✓</span>' : '<span class="b-lock">🔒</span>'}
        </div>
        <div class="badge-meta">
          <span class="badge-tier-label" style="color: ${b.color}">${b.label}</span>
          <h4 class="badge-name">${b.name}</h4>
          <p class="badge-cond">${b.cond}</p>
          <div class="badge-xp-req">
            <span>${b.progress}</span>
            <span class="badge-status-tag ${b.earned ? 'earned' : ''}">${b.earned ? (isBn ? 'অর্জিত 🏆' : 'UNLOCKED') : (isBn ? 'লক' : 'LOCKED')}</span>
          </div>
        </div>
      </div>`;

    const marsDone = KIDS_MISSIONS_MARS.filter(m => this.completedMissions.has(m.id)).length;
    const moonDone = KIDS_MISSIONS_MOON.filter(m => this.completedMissions.has(m.id)).length;
    const voyagerDone = this.completedMissions.has('mission_blackbox');
    const certs = [
      { kind: 'mars', icon: '🔴', name: isBn ? 'মঙ্গল মাস্টার সার্টিফিকেট' : 'Mars Master Certificate', done: marsDone, total: KIDS_MISSIONS_MARS.length },
      { kind: 'moon', icon: '🌕', name: isBn ? 'চাঁদ মাস্টার সার্টিফিকেট' : 'Moon Master Certificate', done: moonDone, total: KIDS_MISSIONS_MOON.length },
      { kind: 'deepspace', icon: '📀', name: isBn ? 'ইন্টারস্টেলার সার্টিফিকেট' : 'Interstellar Certificate', done: voyagerDone ? 1 : 0, total: 1 },
      { kind: 'grand', icon: '🏆', name: isBn ? 'গ্র্যান্ড মাস্টার সার্টিফিকেট' : 'Grand Master Certificate', done: marsDone + moonDone, total: KIDS_MISSIONS_MARS.length + KIDS_MISSIONS_MOON.length }
    ];

    container.innerHTML = `
      <div class="trophy-summary">
        🏅 ${isBn ? 'অর্জিত ব্যাজ' : 'Badges earned'}: <strong>${earnedCount}</strong> / ${totalCount}
        <span class="trophy-xp">⚡ ${this.userXP} XP</span>
      </div>
      <h3 class="cert-shelf-title">🎓 ${isBn ? 'আমার সার্টিফিকেট' : 'My Certificates'}</h3>
      <div class="cert-shelf">
        ${certs.map(c => {
          const unlocked = c.done >= c.total;
          return `
            <div class="cert-shelf-card ${unlocked ? 'unlocked' : 'locked'}">
              <span class="cert-shelf-icon">${c.icon}</span>
              <span class="cert-shelf-name">${c.name}</span>
              <span class="cert-shelf-progress">${c.done} / ${c.total} ${isBn ? 'মিশন' : 'missions'}</span>
              <button class="cert-shelf-btn" type="button" data-cert-kind="${c.kind}" ${unlocked ? '' : 'disabled'}>
                ${unlocked ? (isBn ? 'দেখুন' : 'VIEW') : '🔒 ' + (isBn ? 'লক করা' : 'LOCKED')}
              </button>
            </div>
          `;
        }).join('')}
      </div>
      <h3 class="cert-shelf-title">⚡ ${isBn ? 'র‍্যাংক ব্যাজ (XP)' : 'Rank Badges (XP)'}</h3>
      <div class="badges-grid-layout">${allBadges.rank.map(badgeCard).join('')}</div>
      <h3 class="cert-shelf-title">🧩 ${isBn ? 'কুইজ ব্যাজ' : 'Quiz Badges'}</h3>
      <div class="badges-grid-layout">${byEarned(allBadges.quiz).map(badgeCard).join('')}</div>
      <h3 class="cert-shelf-title">🚀 ${isBn ? 'মিশন ব্যাজ' : 'Mission Badges'}</h3>
      <div class="badges-grid-layout">${byEarned(allBadges.missions).map(badgeCard).join('')}</div>
    `;
    this.updateBadgeCountChip(earnedCount);

    container.querySelectorAll('.cert-shelf-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('badges-modal-backdrop')?.classList.remove('active');
        this.showCertificateModal(btn.dataset.certKind);
      });
    });
  }

  renderFunFact() {
    const isBn = this.currentLanguage === 'bn';
    const fact = FUN_FACTS[this.currentFunFactIndex % FUN_FACTS.length];
    const factTitle = document.getElementById('fun-fact-title');
    const factText = document.getElementById('fun-fact-text');

    if (factTitle) factTitle.innerText = `✨ ${isBn ? fact.title_bn : fact.title_en}`;
    if (factText) factText.innerText = isBn ? fact.text_bn : fact.text_en;
  }

  nextFunFact() {
    this.currentFunFactIndex++;
    this.renderFunFact();
    martianAudio.playScannerBeep(false);
  }

  updateCompanionBotText() {
    const isBn = this.currentLanguage === 'bn';
    const text = isBn ? COMPANION_BOT_LINES.welcome_bn : COMPANION_BOT_LINES.welcome_en;
    this.showBotDialogue(text, false);
  }

  showBotDialogue(text, autoOpen = false) {
    const bubble = document.getElementById('bot-speech-bubble');
    const textElem = document.getElementById('bot-speech-text');
    if (!bubble || !textElem) return;

    textElem.innerText = text;
    if (autoOpen) {
      bubble.classList.add('visible');
      setTimeout(() => {
        bubble.classList.remove('visible');
      }, 7000);
    }
  }

  // kind: 'mars' | 'moon' | 'deepspace' | 'grand'. When omitted, it is derived from
  // the current world and progress (used by the end-of-world celebrations).
  showCertificateModal(kind) {
    const modal = document.getElementById('certificate-modal-backdrop');
    if (!modal) return;

    const isBn = this.currentLanguage === 'bn';
    const allMarsDone = KIDS_MISSIONS_MARS.every(m => this.completedMissions.has(m.id));
    const allMoonDone = KIDS_MISSIONS_MOON.every(m => this.completedMissions.has(m.id));

    if (!kind) {
      if (this.currentPlanet === 'deepspace') kind = 'deepspace';
      else if (allMarsDone && allMoonDone) kind = 'grand';
      else if (this.currentPlanet === 'moon') kind = 'moon';
      else kind = 'mars';
    }

    const titleEl = modal.querySelector('.cert-title');
    const tagEl = modal.querySelector('.cert-nasa-tag');
    const nameEl = document.getElementById('cert-player-name');
    const descEl = document.getElementById('cert-player-desc');
    const dismissBtn = document.getElementById('cert-dismiss-btn');
    const sigCmdrEl = document.getElementById('cert-sig-commander');

    const activeCmdr = localStorage.getItem('jdsn_selected_commander') || 'asha';
    const isAsha = activeCmdr === 'asha';
    const cmdrTitle = isAsha ? (isBn ? 'কমান্ডার আশা' : 'COMMANDER ASHA') : (isBn ? 'কমান্ডার লিও' : 'COMMANDER LEO');
    const customCall = localStorage.getItem('nasa_player_callsign');
    const recipientName = customCall && customCall !== 'CADET EXPLORER'
      ? `${customCall} (${cmdrTitle})`
      : cmdrTitle;

    if (sigCmdrEl) {
      sigCmdrEl.innerText = cmdrTitle;
    }

    if (kind === 'deepspace') {
      if (tagEl) tagEl.innerText = isBn ? 'নাসা স্পেস অ্যাপস • ইন্টারস্টেলার একাডেমি' : 'NASA SPACE APPS • INTERSTELLAR MISSION ACADEMY';
      if (titleEl) titleEl.innerText = isBn ? 'ইন্টারস্টেলার এক্সপেডিশন মাস্টার সার্টিফিকেট' : 'INTERSTELLAR EXPEDITION MASTER CERTIFICATE';
      if (nameEl) nameEl.innerText = `${recipientName} • ${isBn ? 'ইন্টারস্টেলার মাস্টার পায়োনিয়ার' : 'INTERSTELLAR MASTER PIONEER'}`;
      if (descEl) {
        descEl.innerText = isBn
          ? `${cmdrTitle} মহাবিশ্বের ২৪.৩ বিলিয়ন কিলোমিটার (১৬২ এইউ) দূরে হেলিওপজ অতিক্রমকারী ভয়েজার ১ মহাকাশযানের পিউ-২৩৮ নিউক্লিয়ার ব্যাটারি ব্যালেন্স করে এবং ২২ ঘণ্টা ৩৪ মিনিটের রেডিও লিঙ্ক অতিক্রম করে গোল্ডেন রেকর্ড হ্যান্ডশেক সফলভাবে সম্পন্ন করেছেন!`
          : `certifies that ${cmdrTitle} has successfully mastered the Interstellar Expedition across 24.3 billion kilometers (162 AU)—balancing Voyager 1's decaying Pu-238 RTG nuclear power, establishing the 22h 34m light-speed radio link past the Heliopause, and broadcasting the Golden Record across the cosmos!`;
      }
    } else if (kind === 'moon') {
      if (tagEl) tagEl.innerText = isBn ? 'নাসা স্পেস অ্যাপস • চন্দ্রাভিযান একাডেমি' : 'NASA SPACE APPS • LUNAR EXPEDITION ACADEMY';
      if (titleEl) titleEl.innerText = isBn ? 'লুনার এক্সপেডিশন মাস্টার সার্টিফিকেট' : 'LUNAR EXPEDITION MASTER CERTIFICATE';
      if (nameEl) nameEl.innerText = `${recipientName} • ${isBn ? 'মাস্টার লুনার এক্সপ্লোরার' : 'MASTER LUNAR EXPLORER'}`;
      if (descEl) {
        descEl.innerText = isBn
          ? `${cmdrTitle} শান্ত সাগর ও চন্দ্রপৃষ্ঠের সার্ভেয়ার ১, অ্যাপোলো ১১ শান্ত সাগর ট্রাঙ্কুইলিটি বেস, সার্ভেয়ার ৩ রিট্রিভাল, এলআরভি বাগি রান, এলক্রস মেরু বরফ এবং আর্টেমিস বেস ক্যাম্প—সবকটি লুনার প্রত্নতাত্ত্বিক মিশন সফলভাবে সম্পন্ন করে এই মাস্টার সার্টিফিকেট অর্জন করেছেন।`
          : `certifies that ${cmdrTitle} has successfully mastered all 6 Lunar Archaeology Missions—touching down with Surveyor 1, preserving Tranquility Base with Apollo 11, retrieving historic hardware with Surveyor 3, navigating the LRV Buggy, confirming Cabeus polar ice with LCROSS, and establishing Artemis Base Camp!`;
      }
    } else if (kind === 'mars') {
      if (tagEl) tagEl.innerText = isBn ? 'নাসা স্পেস অ্যাপস • মঙ্গল অভিযান একাডেমি' : 'NASA SPACE APPS • MARS EXPEDITION ACADEMY';
      if (titleEl) titleEl.innerText = isBn ? 'মার্টিয়ান এক্সপেডিশন মাস্টার সার্টিফিকেট' : 'MARTIAN EXPEDITION MASTER CERTIFICATE';
      if (nameEl) nameEl.innerText = `${recipientName} • ${isBn ? 'মাস্টার মার্টিয়ান এক্সপ্লোরার' : 'MASTER MARTIAN EXPLORER'}`;
      if (descEl) {
        descEl.innerText = isBn
          ? `${cmdrTitle} পারসিভেরেন্স ভ্যালিতে অপরচুনিটি রোভার অনুসন্ধান, হেমাটাইট ব্লুবেরি এপিএক্সএস স্পেকট্রোস্কোপি, ডায়মন্ড র‍্যাট ড্রিলিং, ইনসাইট সেইসমোলজি মার্সকোয়েক এবং সল ৫১১১ ধূলিঝড়—সবকটি মঙ্গল প্রত্নতাত্ত্বিক মিশন সফলভাবে সম্পন্ন করে এই মাস্টার সার্টিফিকেট অর্জন করেছেন।`
          : `certifies that ${cmdrTitle} has successfully mastered all 6 Martian Archaeology Missions—locating Opportunity at Perseverance Valley, proving past hydrology with APXS Hematite Blueberries, drilling with the diamond RAT, triangulating Marsquake waves with InSight SEIS, surviving the fateful Sol 5111 dust storm, and unlocking Voyager 1's Golden Record in deep space!`;
      }
    } else {
      if (tagEl) tagEl.innerText = isBn ? 'নাসা স্পেস অ্যাপস • জুনিয়র ডিপ স্পেস নেটওয়ার্ক' : 'NASA SPACE APPS • JUNIOR DEEP SPACE NETWORK';
      if (titleEl) titleEl.innerText = isBn ? 'গ্র্যান্ড মাস্টার সার্টিফিকেট' : 'GRAND MASTER CERTIFICATE';
      if (nameEl) nameEl.innerText = `${recipientName} • ${isBn ? 'গ্র্যান্ড মাস্টার এক্সপ্লোরার' : 'GRAND MASTER EXPLORER'}`;
      if (descEl) {
        descEl.innerText = isBn
          ? `${cmdrTitle} চাঁদ ও মঙ্গলের সকল ঐতিহাসিক নাসা জেপিএল প্রত্নতাত্ত্বিক মিশন সাফল্যের সাথে সম্পন্ন করে মহাবিশ্বের ২৪.৩ বিলিয়ন কিলোমিটার দূরের ভয়েজার ১-এর সাথে গোল্ডেন রেকর্ড হ্যান্ডশেক সম্পন্ন করেছেন।`
          : `certifies that ${cmdrTitle} has successfully mastered the complete NASA Moon & Mars Expedition roadmaps across both worlds and completed the Interstellar Handshake with Voyager 1 across 24.3 billion kilometers!`;
      }
    }

    if (dismissBtn) {
      dismissBtn.innerText = isBn ? 'অভিনন্দন! মিশন হাবে ফিরে যান ➔' : 'CONGRATULATIONS! RETURN TO HUB ➔';
    }

    const closeBtn = document.getElementById('cert-close-btn') || modal.querySelector('.modal-close-btn');
    if (closeBtn && this.onCloseCertificate) {
      closeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onCloseCertificate();
      };
    }
    if (dismissBtn && this.onCloseCertificate) {
      dismissBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onCloseCertificate();
      };
    }

    modal.classList.add('active');
    martianAudio.playTelemetryTransmission?.();
    this.triggerBigConfetti();
  }

  animateRocketProgression(fromId, toId, onComplete) {
    const canvas = document.querySelector('.space-roadmap-canvas');
    if (!canvas) {
      if (onComplete) onComplete();
      return;
    }

    const fromNode = canvas.querySelector(`.roadmap-station-node[data-node-id="${fromId}"]`) ||
                     canvas.querySelector('.roadmap-station-node[data-node-id="node_start"]') ||
                     canvas.querySelector('.roadmap-station-node');
    const toNode = canvas.querySelector(`.roadmap-station-node[data-node-id="${toId}"]`);

    if (!fromNode || !toNode) {
      if (onComplete) onComplete();
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const fromRect = fromNode.getBoundingClientRect();
    const toRect = toNode.getBoundingClientRect();

    const startX = (fromRect.left + fromRect.width / 2) - canvasRect.left;
    const startY = (fromRect.top + fromRect.height / 2) - canvasRect.top;

    const endX = (toRect.left + toRect.width / 2) - canvasRect.left;
    const endY = (toRect.top + toRect.height / 2) - canvasRect.top;

    const rocket = document.getElementById('roadmap-flying-rocket');
    if (!rocket) {
      if (onComplete) onComplete();
      return;
    }

    // Flight angle
    const angleRad = Math.atan2(endY - startY, endX - startX);
    const angleDeg = (angleRad * 180 / Math.PI) + 45; // rotate rocket icon to face flight vector

    rocket.style.display = 'flex';
    rocket.style.transition = 'none';
    rocket.style.left = `${startX}px`;
    rocket.style.top = `${startY}px`;
    rocket.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;

    // Thruster ignition audio
    martianAudio.playRocketIgnition?.(2.0);

    setTimeout(() => {
      rocket.style.transition = 'left 1.9s cubic-bezier(0.25, 1, 0.45, 1), top 1.9s cubic-bezier(0.25, 1, 0.45, 1), transform 0.4s ease';
      rocket.style.left = `${endX}px`;
      rocket.style.top = `${endY}px`;
    }, 60);

    setTimeout(() => {
      martianAudio.playTelemetryTransmission?.();
      this.triggerConfetti();

      // Visually unlock toNode
      toNode.classList.remove('locked');
      toNode.classList.add('active', 'active-unlocked-pulse');
      const badgeIcon = toNode.querySelector('.station-badge-icon');
      if (badgeIcon) {
        badgeIcon.className = 'station-badge-icon pulse';
        badgeIcon.innerText = '▶';
      }

      const nextMission = this.activeMissionsList.find(m => m.id === toId);
      const toast = document.getElementById('roadmap-level-advance-toast');
      const isBn = this.currentLanguage === 'bn';

      if (toast && nextMission) {
        toast.style.display = 'flex';
        toast.innerHTML = `
          <div class="toast-content" style="display:flex; flex-direction:column; gap:2px;">
            <span class="advance-toast-text" style="color:#ffb700; font-size:12px; font-weight:800;">
              🚀 ${isBn ? `লেভেল ${nextMission.level} আনলক!` : `LEVEL ${nextMission.level} UNLOCKED!`} — ${isBn ? nextMission.title_bn : nextMission.title_en}
            </span>
            <span class="toast-countdown" id="launch-countdown-text" style="color:#94a3b8; font-size:10px; font-family:var(--font-mono);">
              ${isBn ? '৩ সেকেন্ডে মিশন শুরু হচ্ছে...' : 'LAUNCHING LEVEL IN 3s...'}
            </span>
          </div>
          <button class="advance-toast-start-btn glow-gold pulse" id="toast-btn-launch-now">
            ${isBn ? 'এখনই শুরু করো ➔' : 'START NOW ➔'}
          </button>
        `;

        let secondsLeft = 3;
        let timer = null;
        const doLaunch = () => {
          if (timer) clearInterval(timer);
          timer = null;
          toast.style.display = 'none';
          rocket.style.display = 'none';
          const modal = document.getElementById('missions-modal-backdrop');
          if (modal) modal.classList.remove('active');
          if (onComplete) onComplete();
        };

        document.getElementById('toast-btn-launch-now')?.addEventListener('click', (e) => {
          e.stopPropagation();
          doLaunch();
        });

        timer = setInterval(() => {
          secondsLeft--;
          const countElem = document.getElementById('launch-countdown-text');
          if (countElem) {
            countElem.innerText = isBn ? `${secondsLeft} সেকেন্ডে মিশন শুরু হচ্ছে...` : `LAUNCHING LEVEL IN ${secondsLeft}s...`;
          }
          if (secondsLeft <= 0) {
            doLaunch();
          }
        }, 1000);
      } else {
        setTimeout(() => {
          rocket.style.display = 'none';
          const modal = document.getElementById('missions-modal-backdrop');
          if (modal) modal.classList.remove('active');
          if (onComplete) onComplete();
        }, 1200);
      }
    }, 2050);
  }
}
