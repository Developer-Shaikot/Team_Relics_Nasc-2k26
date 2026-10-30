import { CADET_QUIZ_LEVELS } from '../data/kidsContent.js';
import { SPACE_CADET_LEADERBOARD } from '../data/missionsDatabase.js';
import { martianAudio } from './audio.js';

export class QuizLeaderboardManager {
  constructor(questManager) {
    this.questManager = questManager;
    this.currentTier = 'junior'; // 'junior', 'intermediate', 'senior', 'expert'
    this.currentQuestionIdx = 0;
    this.currentScore = 0;
    this.currentLanguage = 'en';
    this.activeTab = 'quiz'; // 'quiz' or 'leaderboard'
    this.leaderboard = [...SPACE_CADET_LEADERBOARD];

    // Load custom player name if saved
    this.playerName = "Cadet You (Player)";
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    this.render();
  }

  setTier(tier) {
    this.currentTier = tier;
    this.currentQuestionIdx = 0;
    this.currentScore = 0;
    this.render();
  }

  get currentQuestionList() {
    return CADET_QUIZ_LEVELS[this.currentTier] || CADET_QUIZ_LEVELS.junior;
  }

  isTierUnlocked(tier) {
    const xp = this.questManager ? this.questManager.userXP : 0;
    if (tier === 'junior') return true;
    if (tier === 'intermediate') return xp >= 500;
    if (tier === 'senior') return xp >= 1000;
    if (tier === 'expert') return xp >= 1500;
    return true;
  }

  getTierLockMessage(tier) {
    if (tier === 'intermediate') return "🔒 Level 2 (500+ XP) Required! Complete Moon & Mars levels to unlock.";
    if (tier === 'senior') return "🔒 Level 3 (1,000+ XP) Required! Solve science labs to unlock.";
    if (tier === 'expert') return "🔒 Level 4 (1,500+ XP) Required! Master all historical relics to unlock.";
    return "";
  }

  render() {
    const modalBody = document.getElementById('quiz-modal-container');
    if (!modalBody) return;

    const isBn = this.currentLanguage === 'bn';

    if (this.activeTab === 'leaderboard') {
      this.renderLeaderboard(modalBody);
      return;
    }

    const questions = this.currentQuestionList;
    const qData = questions[this.currentQuestionIdx];

    const interLocked = !this.isTierUnlocked('intermediate');
    const seniorLocked = !this.isTierUnlocked('senior');
    const expertLocked = !this.isTierUnlocked('expert');

    modalBody.innerHTML = `
      <!-- Quiz Navigation Tabs: Difficulty Layers + Leaderboard Switcher -->
      <div class="quiz-top-nav-bar">
        <div class="quiz-tier-selector">
          <button class="quiz-tier-btn ${this.currentTier === 'junior' ? 'active' : ''}" data-tier="junior" title="Open to all cadets">
            🟢 ${isBn ? 'জুনিয়র' : 'Junior'}
          </button>
          <button class="quiz-tier-btn ${this.currentTier === 'intermediate' ? 'active' : ''} ${interLocked ? 'locked' : ''}" data-tier="intermediate" title="${interLocked ? 'Unlocks at Level 2 (500 XP)' : 'Intermediate Level'}">
            ${interLocked ? '🔒' : '🟡'} ${isBn ? 'ইন্টারমিডিয়েট' : 'Intermediate'}
          </button>
          <button class="quiz-tier-btn ${this.currentTier === 'senior' ? 'active' : ''} ${seniorLocked ? 'locked' : ''}" data-tier="senior" title="${seniorLocked ? 'Unlocks at Level 3 (1,000 XP)' : 'Senior Level'}">
            ${seniorLocked ? '🔒' : '🟠'} ${isBn ? 'সিনিয়র' : 'Senior'}
          </button>
          <button class="quiz-tier-btn ${this.currentTier === 'expert' ? 'active' : ''} ${expertLocked ? 'locked' : ''}" data-tier="expert" title="${expertLocked ? 'Unlocks at Level 4 (1,500 XP)' : 'Expert Level'}">
            ${expertLocked ? '🔒' : '🔴'} ${isBn ? 'এক্সপার্ট' : 'Expert'}
          </button>
        </div>

        <button class="quiz-leaderboard-toggle-btn" id="btn-show-leaderboard">
          🏆 ${isBn ? 'লিডারবোর্ড' : 'Leaderboard'}
        </button>
      </div>

      <!-- Live XP & Question Step Header -->
      <div class="quiz-status-line">
        <span class="quiz-step-tag">
          ${isBn ? `প্রশ্ন ${this.currentQuestionIdx + 1} / ${questions.length}` : `Question ${this.currentQuestionIdx + 1} of ${questions.length}`}
        </span>
        <span class="quiz-live-xp-gain">
          ⚡ ${isBn ? 'বর্তমান স্কোর:' : 'Score:'} ${this.currentScore} / ${questions.length} (+${this.currentScore * 50} XP)
        </span>
      </div>

      <!-- Question Text -->
      <div class="quiz-question-box">
        <p class="quiz-q-text">${isBn ? qData.question_bn : qData.question_en}</p>
      </div>

      <!-- Options Buttons -->
      <div class="quiz-options-list" id="quiz-options-list">
        ${(isBn ? qData.options_bn : qData.options_en).map((opt, i) => `
          <button class="quiz-opt-btn" data-opt-idx="${i}">
            <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
            <span class="opt-text">${opt}</span>
          </button>
        `).join('')}
      </div>

      <!-- Feedback Box -->
      <div class="quiz-feedback-box" id="quiz-feedback-box" style="display: none;">
        <p id="quiz-feedback-text"></p>
      </div>

      <!-- Modal Footer with Next Button -->
      <div class="quiz-modal-footer">
        <button class="quiz-next-action-btn" id="quiz-next-btn" style="display: none;">
          ${this.currentQuestionIdx === questions.length - 1
            ? (isBn ? 'ফলাফল ও সার্টিফিকেট দেখুন 🏆' : 'COMPLETE QUIZ & VIEW RESULT 🏆')
            : (isBn ? 'পরবর্তী প্রশ্ন ➔' : 'NEXT QUESTION ➔')}
        </button>
      </div>
    `;

    this.bindQuizEvents();
  }

  renderLeaderboard(container) {
    const isBn = this.currentLanguage === 'bn';
    const playerXP = this.questManager ? this.questManager.userXP : 0;
    const playerBadges = this.questManager ? this.questManager.completedMissions.size : 0;
    const customCallSign = localStorage.getItem('nasa_player_callsign') || 'Cadet Shaikot';
    const activeCommander = localStorage.getItem('jdsn_selected_commander') || 'asha';

    const ashaXP = parseInt(localStorage.getItem('jdsn_asha_points') || '3250', 10);
    const leoXP = parseInt(localStorage.getItem('jdsn_leo_points') || '3410', 10);
    const ashaMissions = parseInt(localStorage.getItem('jdsn_asha_missions') || '8', 10);
    const leoMissions = parseInt(localStorage.getItem('jdsn_leo_missions') || '9', 10);
    const totalDuelXP = Math.max(1, ashaXP + leoXP);
    const ashaPercent = Math.round((ashaXP / totalDuelXP) * 100);
    const leoPercent = 100 - ashaPercent;

    const leaderDiffText = ashaXP === leoXP
      ? (isBn ? 'উভয়ে সমানে সমান!' : 'Tied for 1st Place!')
      : ashaXP > leoXP
      ? (isBn ? `আশা ${(ashaXP - leoXP).toLocaleString()} পয়েন্টে এগিয়ে!` : `Asha leads by ${(ashaXP - leoXP).toLocaleString()} pts!`)
      : (isBn ? `লিও ${(leoXP - ashaXP).toLocaleString()} পয়েন্টে এগিয়ে!` : `Leo leads by ${(leoXP - ashaXP).toLocaleString()} pts!`);

    // Update player and commander scores dynamically in the leaderboard
    const updatedBoard = this.leaderboard.map(item => {
      if (item.name.includes("You") || item.name.includes("Player")) {
        const cmdrLabel = activeCommander === 'asha' ? 'Asha' : 'Leo';
        return {
          ...item,
          name: `${customCallSign} • ${cmdrLabel} (You)`,
          avatar: activeCommander === 'asha' ? '👩‍🚀' : '👨‍🚀',
          xp: playerXP,
          badges: playerBadges,
          title: playerXP >= 1500 ? "Cosmic Commander" : playerXP >= 1000 ? "Senior Specialist" : playerXP >= 500 ? "Field Archaeologist" : "Junior Space Cadet"
        };
      }
      if (item.name.includes("Asha Rahman")) {
        return {
          ...item,
          xp: ashaXP,
          badges: ashaMissions
        };
      }
      if (item.name.includes("Leo Vance")) {
        return {
          ...item,
          xp: leoXP,
          badges: leoMissions
        };
      }
      return item;
    }).sort((a, b) => b.xp - a.xp);

    const top1 = updatedBoard[0];
    const top2 = updatedBoard[1];
    const top3 = updatedBoard[2];

    container.innerHTML = `
      <div class="leaderboard-view-container">
        <div class="leaderboard-header-row">
          <div>
            <h3 class="lb-title">🏆 ${isBn ? 'গ্লোবাল স্পেস ক্যাডেট লিডারবোর্ড' : 'Global Space Cadet Leaderboard'}</h3>
            <p class="lb-sub">${isBn ? 'কুইজ ও মিশন সম্পন্ন করে শীর্ষস্থান অর্জন করো!' : 'Top 50 global explorers — complete missions & quizzes to climb the ranks!'}</p>
          </div>
          <div class="lb-header-controls">
            <input type="text" id="lb-search-input" class="lb-search-field" placeholder="Search cadet or station...">
            <button class="lb-back-btn" id="btn-back-to-quiz">
              🧩 ${isBn ? 'কুইজে ফিরুন' : 'Back to Quiz'}
            </button>
          </div>
        </div>

        <!-- COMMANDER POINTS SHOWDOWN & DUAL LEADERBOARD -->
        <div class="cmd-showdown-card">
          <div class="cmd-showdown-header">
            <div>
              <span class="showdown-badge">⚡ ${isBn ? 'মিশন কমান্ডার পয়েন্ট লড়াই' : 'MISSION COMMANDERS POINTS SHOWDOWN'}</span>
              <h4 class="showdown-title">${isBn ? 'কে বেশি পয়েন্ট সংগ্রহ করেছে?' : 'Who Collected More Points Across the Cosmos?'}</h4>
            </div>
            <span class="showdown-live-tag">LIVE STANDINGS</span>
          </div>

          <div class="cmd-showdown-duel-grid">
            <!-- Asha Card -->
            <div class="duel-character-card asha-duel ${activeCommander === 'asha' ? 'is-active-commander' : ''}">
              <div class="duel-avatar-col">
                <span class="duel-avatar">👩‍🚀</span>
                ${activeCommander === 'asha' ? `<span class="your-cmdr-badge">${isBn ? 'আপনার লিড' : 'YOUR LEAD'}</span>` : ''}
              </div>
              <div class="duel-info-col">
                <div class="duel-name-row">
                  <strong>COMMANDER ASHA</strong>
                  <span class="duel-rank-pill ${ashaXP >= leoXP ? 'leader' : ''}">${ashaXP >= leoXP ? (isBn ? '👑 ১ম স্থান' : '👑 RANK #1') : (isBn ? '🥈 ২য় স্থান' : '🥈 RANK #2')}</span>
                </div>
                <small class="duel-location">Dhaka Ground Station • JDSN 1</small>
                <div class="duel-score-row">
                  <span class="duel-points-total">${ashaXP.toLocaleString()} XP</span>
                  <span class="duel-missions-tag">${ashaMissions} ${isBn ? 'মিশন সম্পন্ন' : 'Missions'}</span>
                </div>
              </div>
            </div>

            <!-- VS Divider -->
            <div class="duel-vs-divider">
              <span class="vs-text">VS</span>
            </div>

            <!-- Leo Card -->
            <div class="duel-character-card leo-duel ${activeCommander === 'leo' ? 'is-active-commander' : ''}">
              <div class="duel-avatar-col">
                <span class="duel-avatar">👨‍🚀</span>
                ${activeCommander === 'leo' ? `<span class="your-cmdr-badge">${isBn ? 'আপনার লিড' : 'YOUR LEAD'}</span>` : ''}
              </div>
              <div class="duel-info-col">
                <div class="duel-name-row">
                  <strong>COMMANDER LEO</strong>
                  <span class="duel-rank-pill ${leoXP > ashaXP ? 'leader' : ''}">${leoXP > ashaXP ? (isBn ? '👑 ১ম স্থান' : '👑 RANK #1') : (isBn ? '🥈 ২য় স্থান' : '🥈 RANK #2')}</span>
                </div>
                <small class="duel-location">Cape Canaveral • Florida KSC</small>
                <div class="duel-score-row">
                  <span class="duel-points-total">${leoXP.toLocaleString()} XP</span>
                  <span class="duel-missions-tag">${leoMissions} ${isBn ? 'মিশন সম্পন্ন' : 'Missions'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Points Comparison Meter Bar -->
          <div class="cmd-points-meter-wrap">
            <div class="points-meter-bar">
              <div class="meter-fill asha-fill" style="width: ${ashaPercent}%;"></div>
              <div class="meter-fill leo-fill" style="width: ${leoPercent}%;"></div>
            </div>
            <div class="meter-labels-row">
              <span class="meter-lbl asha-lbl">👩‍🚀 Asha: ${ashaXP.toLocaleString()} XP (${ashaPercent}%)</span>
              <span class="meter-lbl diff-lbl">${leaderDiffText}</span>
              <span class="meter-lbl leo-lbl">👨‍🚀 Leo: ${leoXP.toLocaleString()} XP (${leoPercent}%)</span>
            </div>
          </div>
        </div>

        <!-- TOP 3 PODIUM CARDS WITH CROWNS & GLOW -->
        <div class="lb-podium-grid">
          <!-- 2nd Place -->
          <div class="podium-card rank-2-silver">
            <div class="podium-crown-badge silver">🥈 2ND PLACE</div>
            <div class="podium-avatar-ring silver-glow">
              <span class="podium-emoji">${top2.avatar}</span>
            </div>
            <h4 class="podium-name">${top2.name}</h4>
            <span class="podium-title">${top2.title}</span>
            <small class="podium-region">${top2.region}</small>
            <div class="podium-score"><strong>${top2.xp.toLocaleString()}</strong> XP</div>
          </div>

          <!-- 1st Place (Center / Taller) -->
          <div class="podium-card rank-1-gold">
            <div class="podium-crown-badge gold">👑 1ST CHAMPION</div>
            <div class="podium-avatar-ring gold-glow">
              <span class="podium-emoji">${top1.avatar}</span>
            </div>
            <h4 class="podium-name">${top1.name}</h4>
            <span class="podium-title">${top1.title}</span>
            <small class="podium-region">${top1.region}</small>
            <div class="podium-score"><strong>${top1.xp.toLocaleString()}</strong> XP</div>
          </div>

          <!-- 3rd Place -->
          <div class="podium-card rank-3-bronze">
            <div class="podium-crown-badge bronze">🥉 3RD PLACE</div>
            <div class="podium-avatar-ring bronze-glow">
              <span class="podium-emoji">${top3.avatar}</span>
            </div>
            <h4 class="podium-name">${top3.name}</h4>
            <span class="podium-title">${top3.title}</span>
            <small class="podium-region">${top3.region}</small>
            <div class="podium-score"><strong>${top3.xp.toLocaleString()}</strong> XP</div>
          </div>
        </div>

        <!-- TOP 50 TABLE SCROLL -->
        <div class="leaderboard-table-wrap">
          <div class="lb-table-head">
            <span class="col-rank">${isBn ? 'র‍্যাংক' : 'Rank'}</span>
            <span class="col-cadet">${isBn ? 'ক্যাডেট' : 'Cadet'}</span>
            <span class="col-title">${isBn ? 'পদমর্যাদা' : 'Title'}</span>
            <span class="col-badges">${isBn ? 'ব্যাজ' : 'Badges'}</span>
            <span class="col-xp">${isBn ? 'এক্সপি' : 'XP Points'}</span>
          </div>

          <div class="lb-table-body" id="lb-table-rows">
            ${updatedBoard.map((item, index) => {
              const isPlayer = item.name.includes("You");
              return `
                <div class="lb-row ${isPlayer ? 'player-row' : ''} rank-${index + 1}" data-name="${item.name.toLowerCase()}" data-region="${item.region.toLowerCase()}">
                  <span class="col-rank">
                    ${index === 0 ? '👑 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                  </span>
                  <div class="col-cadet cadet-info">
                    <span class="cadet-avatar">${item.avatar}</span>
                    <div class="cadet-name-wrap">
                      <strong>${item.name}</strong>
                      <small>${item.region}</small>
                    </div>
                  </div>
                  <span class="col-title">${item.title}</span>
                  <span class="col-badges">${item.badges} 🏅</span>
                  <span class="col-xp"><strong>${item.xp.toLocaleString()}</strong> XP</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-back-to-quiz')?.addEventListener('click', () => {
      this.activeTab = 'quiz';
      this.render();
    });

    // Real-time table search
    const searchInput = document.getElementById('lb-search-input');
    searchInput?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('#lb-table-rows .lb-row').forEach(row => {
        const name = row.dataset.name || '';
        const region = row.dataset.region || '';
        if (!q || name.includes(q) || region.includes(q)) {
          row.style.display = 'flex';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  bindQuizEvents() {
    document.querySelectorAll('.quiz-tier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tier = btn.dataset.tier;
        if (!this.isTierUnlocked(tier)) {
          const lockMsg = this.getTierLockMessage(tier);
          alert(lockMsg);
          martianAudio.playClick();
          return;
        }
        this.setTier(tier);
      });
    });

    document.getElementById('btn-show-leaderboard')?.addEventListener('click', () => {
      this.activeTab = 'leaderboard';
      this.render();
    });

    const questions = this.currentQuestionList;
    const qData = questions[this.currentQuestionIdx];
    const optList = document.getElementById('quiz-options-list');
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const feedbackText = document.getElementById('quiz-feedback-text');
    const nextBtn = document.getElementById('quiz-next-btn');
    const isBn = this.currentLanguage === 'bn';

    if (optList) {
      optList.querySelectorAll('.quiz-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const selected = parseInt(btn.dataset.optIdx, 10);
          const isCorrect = selected === qData.correct;

          optList.querySelectorAll('.quiz-opt-btn').forEach((b, bi) => {
            b.disabled = true;
            if (bi === qData.correct) b.classList.add('correct');
            else if (bi === selected) b.classList.add('wrong');
          });

          if (isCorrect) {
            this.currentScore++;
            if (this.questManager) {
              this.questManager.addXP(50);
              this.questManager.triggerConfetti();
            }
            martianAudio.playScannerBeep(true);
          } else {
            martianAudio.playScannerBeep(false);
          }

          if (feedbackBox && feedbackText) {
            feedbackBox.style.display = 'block';
            feedbackBox.style.borderColor = isCorrect ? '#10b981' : '#ff2a4b';
            feedbackText.innerText = (isCorrect ? '✓ ' : '✗ ') + (isBn ? qData.explanation_bn : qData.explanation_en);
          }

          if (nextBtn) {
            nextBtn.style.display = 'block';
          }
        });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentQuestionIdx++;
        if (this.currentQuestionIdx < questions.length) {
          this.render();
        } else {
          // Completed current tier
          if (this.questManager) {
            this.questManager.addXP(100);
            this.questManager.triggerBigConfetti();
            document.getElementById('quiz-modal-backdrop')?.classList.remove('active');
            this.questManager.showCertificateModal();
          }
        }
      });
    }
  }
}
