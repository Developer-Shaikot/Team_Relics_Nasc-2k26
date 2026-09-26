import confetti from 'canvas-confetti';
import { KIDS_MISSIONS, FUN_FACTS, CADET_QUIZ, COMPANION_BOT_LINES } from '../data/kidsContent.js';
import { martianAudio } from './audio.js';

export class MissionQuestManager {
  constructor(updateUICallback) {
    this.completedMissions = new Set();
    this.currentLanguage = 'en'; // 'en' or 'bn'
    this.updateUI = updateUICallback;
    this.currentFunFactIndex = 0;
    this.currentViewMode = 'roadmap'; // 'roadmap' | 'list'
    this.selectedMissionId = 'mission_locate';
    this.onMissionActionCallback = null;
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    this.renderMissionsList();
    this.renderFunFact();
    this.updateCompanionBotText();
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    this.renderMissionsList();
  }

  setSelectedMission(missionId) {
    this.selectedMissionId = missionId;
    this.renderMissionsList();
  }

  markMissionCompleted(missionId) {
    if (this.completedMissions.has(missionId)) return;
    this.completedMissions.add(missionId);

    // Audio fanfare & celebratory confetti
    martianAudio.playTelemetryTransmission();
    this.triggerConfetti();

    // Show bot notification
    const botText = this.currentLanguage === 'bn' ? COMPANION_BOT_LINES.mission_done_bn : COMPANION_BOT_LINES.mission_done_en;
    this.showBotDialogue(botText, true);

    // Automatically advance selected mission to next uncompleted mission if available
    const nextUncompleted = KIDS_MISSIONS.find(m => !this.completedMissions.has(m.id));
    if (nextUncompleted) {
      this.selectedMissionId = nextUncompleted.id;
    } else {
      this.selectedMissionId = 'node_finish';
    }

    this.renderMissionsList();

    if (this.completedMissions.size === KIDS_MISSIONS.length) {
      setTimeout(() => {
        const winText = this.currentLanguage === 'bn' ? COMPANION_BOT_LINES.all_completed_bn : COMPANION_BOT_LINES.all_completed_en;
        this.showBotDialogue(winText, true);
        this.triggerBigConfetti();
        this.showCertificateModal();
      }, 1500);
    }
  }

  triggerConfetti() {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#ff5e28', '#00e5ff', '#ffb700', '#ffffff']
      });
    } catch (e) {
      console.log('Confetti triggered');
    }
  }

  triggerBigConfetti() {
    try {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#ff5e28', '#00e5ff', '#ffb700', '#10b981', '#ec4899']
      });
    } catch (e) {}
  }

  renderMissionsList() {
    const container = document.getElementById('missions-list-container');
    const badgeCounter = document.getElementById('badges-earned-counter');
    const progressBar = document.getElementById('missions-progress-bar');
    if (!container) return;

    const total = KIDS_MISSIONS.length;
    const completedCount = this.completedMissions.size;

    if (badgeCounter) badgeCounter.innerText = `${completedCount} / ${total}`;
    if (progressBar) progressBar.style.width = `${(completedCount / total) * 100}%`;

    const lang = this.currentLanguage;
    const isBn = lang === 'bn';

    if (this.currentViewMode === 'roadmap') {
      this.renderRoadmapView(container, isBn, completedCount, total);
    } else {
      this.renderListView(container, isBn, completedCount, total);
    }

    this.attachEventListeners(container);
  }

  renderRoadmapView(container, isBn, completedCount, total) {
    // All milestones on the path
    const nodes = [
      {
        id: 'node_start',
        type: 'start',
        levelLabel: isBn ? 'শুরু' : 'Start',
        title: isBn ? 'মঙ্গলে অবতরণ' : 'Landing Base',
        year: '2004',
        icon: '🚀',
        coords: { left: '8%', top: '81%' },
        isDone: true,
        isActive: false,
        isLocked: false,
        badgeName: isBn ? 'লঞ্চপ্যাড ব্যাজ' : 'Launchpad Milestone',
        desc: isBn ? '২০০৪ সালে মঙ্গলের মেরিডিয়ানি প্লেনামে অপরচুনিটি রোভারের ঐতিহাসিক অবতরণ।' : 'Opportunity successfully touches down inside Eagle Crater on Meridiani Planum, Mars.',
        hint: isBn ? 'অভিযান শুরু হয়ে গেছে! পরবর্তী লেভেলগুলোতে ক্লিক করো।' : 'The historic voyage began here. Click on the next mission nodes!'
      },
      ...KIDS_MISSIONS.map((m, idx) => {
        const isDone = this.completedMissions.has(m.id);
        // Next uncompleted mission is active
        const isNext = !isDone && (idx === 0 || this.completedMissions.has(KIDS_MISSIONS[idx - 1].id));
        const coordsList = [
          { left: '22%', top: '69%' }, // Level 1
          { left: '39%', top: '79%' }, // Level 2
          { left: '58%', top: '67%' }, // Level 3
          { left: '76%', top: '77%' }, // Level 4
          { left: '91%', top: '48%' }, // Level 5
          { left: '66%', top: '25%' }  // Level 6
        ];

        return {
          id: m.id,
          type: 'mission',
          levelNumber: m.level,
          levelLabel: isBn ? `লেভেল ${m.level}` : `Level ${m.level}`,
          title: isBn ? m.shortTitle_bn : m.shortTitle_en,
          fullTitle: isBn ? m.title_bn : m.title_en,
          year: m.stationYear,
          icon: m.icon || m.badge,
          coords: coordsList[idx],
          isDone: isDone,
          isActive: isNext,
          isLocked: !isDone && !isNext,
          badgeName: isBn ? m.badgeName_bn : m.badgeName_en,
          desc: isBn ? m.desc_bn : m.desc_en,
          hint: isBn ? m.hint_bn : m.hint_en,
          badge: m.badge
        };
      }),
      {
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
        badgeName: isBn ? 'প্ল্যানেটারি আর্কিওলজিস্ট অনারারি সার্টিফিকেট' : 'Planetary Archaeologist Certificate',
        desc: isBn ? 'সকল ৬টি মিশন সফলভাবে সম্পন্ন করে নাসার স্বীকৃতিপ্রাপ্ত সম্মাননা সার্টিফিকেট আনলক করো!' : 'Complete all 6 exploration missions to unlock your official NASA Master Certificate!',
        hint: isBn ? 'সবগুলো মিশন সম্পন্ন হলে এখানে ক্লিক করে সার্টিফিকেট প্রিন্ট করো।' : 'Complete all previous levels to claim your certificate.'
      }
    ];

    // Find currently selected node data
    let selectedNode = nodes.find(n => n.id === this.selectedMissionId);
    if (!selectedNode) {
      selectedNode = nodes[1]; // fallback to Level 1
      this.selectedMissionId = selectedNode.id;
    }

    container.innerHTML = `
      <div class="roadmap-wrapper">
        <!-- View Toggle & Header Bar -->
        <div class="roadmap-nav-header">
          <div class="roadmap-title-box">
            <span class="roadmap-super-title">🪐 ${isBn ? 'মিশন এক্সপেডিশন রোডম্যাপ' : 'MARTIAN EXPEDITION ROADMAP'}</span>
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
            <div class="cosmic-nebula nebula-cyan"></div>
            <div class="cosmic-nebula nebula-purple"></div>
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
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
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
                🚀 ${isBn ? 'রোভার অবস্থানে যান' : 'FOCUS OPPORTUNITY ROVER'}
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
    container.innerHTML = `
      <div class="roadmap-nav-header">
        <div class="roadmap-title-box">
          <span class="roadmap-super-title">🪐 ${isBn ? 'মিশন তালিকা' : 'MISSION OBJECTIVES'}</span>
          <span class="roadmap-sub-badge">${completedCount} / ${total} ${isBn ? 'সম্পন্ন' : 'Completed'}</span>
        </div>
        <div class="roadmap-view-switcher">
          <button class="view-switch-btn" id="btn-view-roadmap">🗺️ ${isBn ? 'রোডম্যাপ' : 'Roadmap'}</button>
          <button class="view-switch-btn active" id="btn-view-list">📋 ${isBn ? 'তালিকা' : 'List'}</button>
        </div>
      </div>

      <div class="missions-vertical-list">
        ${KIDS_MISSIONS.map((m) => {
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
                <div class="m-reward-tag">🏆 ${badgeName}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  attachEventListeners(container) {
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

    // Action button: Focus Rover
    const focusRoverBtn = container.querySelector('#btn-focus-rover');
    if (focusRoverBtn) {
      focusRoverBtn.addEventListener('click', () => {
        this.executeMissionAction('mission_locate');
      });
    }

    // Action button: View Certificate
    const claimCertBtn = container.querySelector('#btn-claim-cert');
    if (claimCertBtn) {
      claimCertBtn.addEventListener('click', () => {
        const missionsModal = document.getElementById('missions-modal-backdrop');
        if (missionsModal) missionsModal.classList.remove('active');
        this.showCertificateModal();
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

  renderFunFact() {
    const box = document.getElementById('fun-fact-text');
    const title = document.getElementById('fun-fact-title');
    if (!box || !title) return;

    const fact = FUN_FACTS[this.currentFunFactIndex % FUN_FACTS.length];
    title.innerText = this.currentLanguage === 'bn' ? `✨ বিজ্ঞানের মজার তথ্য: ${fact.title_bn}` : `✨ Fun Space Fact: ${fact.title_en}`;
    box.innerText = this.currentLanguage === 'bn' ? fact.text_bn : fact.text_en;
  }

  nextFunFact() {
    this.currentFunFactIndex++;
    this.renderFunFact();
  }

  showBotDialogue(text, highlight = false) {
    const bubble = document.getElementById('bot-speech-bubble');
    const msg = document.getElementById('bot-speech-text');
    if (!bubble || !msg) return;

    msg.innerText = text;
    bubble.classList.add('visible');
    if (highlight) {
      bubble.classList.add('bubble-glow');
      setTimeout(() => bubble.classList.remove('bubble-glow'), 2000);
    }
  }

  updateCompanionBotText() {
    const text = this.currentLanguage === 'bn' ? COMPANION_BOT_LINES.welcome_bn : COMPANION_BOT_LINES.welcome_en;
    this.showBotDialogue(text);
  }

  showCertificateModal() {
    const modal = document.getElementById('certificate-modal-backdrop');
    if (modal) modal.classList.add('active');
  }
}
