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

    modalBody.innerHTML = `
      <!-- Quiz Navigation Tabs: Difficulty Layers + Leaderboard Switcher -->
      <div class="quiz-top-nav-bar">
        <div class="quiz-tier-selector">
          <button class="quiz-tier-btn ${this.currentTier === 'junior' ? 'active' : ''}" data-tier="junior">
            🟢 ${isBn ? 'জুনিয়র' : 'Junior'}
          </button>
          <button class="quiz-tier-btn ${this.currentTier === 'intermediate' ? 'active' : ''}" data-tier="intermediate">
            🟡 ${isBn ? 'ইন্টারমিডিয়েট' : 'Intermediate'}
          </button>
          <button class="quiz-tier-btn ${this.currentTier === 'senior' ? 'active' : ''}" data-tier="senior">
            🟠 ${isBn ? 'সিনিয়র' : 'Senior'}
          </button>
          <button class="quiz-tier-btn ${this.currentTier === 'expert' ? 'active' : ''}" data-tier="expert">
            🔴 ${isBn ? 'এক্সপার্ট' : 'Expert'}
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
    const playerXP = this.questManager ? this.questManager.userXP : 1250;
    const playerBadges = this.questManager ? this.questManager.completedMissions.size : 0;

    // Update player rank dynamically in the leaderboard
    const updatedBoard = this.leaderboard.map(item => {
      if (item.name.includes("You")) {
        return {
          ...item,
          xp: playerXP,
          badges: playerBadges,
          title: playerXP >= 1500 ? "Cosmic Commander" : playerXP >= 1000 ? "Senior Specialist" : "Junior Cadet"
        };
      }
      return item;
    }).sort((a, b) => b.xp - a.xp);

    container.innerHTML = `
      <div class="leaderboard-view-container">
        <div class="leaderboard-header-row">
          <div>
            <h3 class="lb-title">🏆 ${isBn ? 'গ্লোবাল স্পেস ক্যাডেট লিডারবোর্ড' : 'Global Space Cadet Leaderboard'}</h3>
            <p class="lb-sub">${isBn ? 'কুইজ ও মিশন সম্পন্ন করে শীর্ষস্থান অর্জন করো!' : 'Answer quizzes and complete missions to climb the ranks!'}</p>
          </div>
          <button class="lb-back-btn" id="btn-back-to-quiz">
            🧩 ${isBn ? 'কুইজে ফিরুন' : 'Back to Quiz'}
          </button>
        </div>

        <div class="leaderboard-table-wrap">
          <div class="lb-table-head">
            <span class="col-rank">${isBn ? 'র‍্যাংক' : 'Rank'}</span>
            <span class="col-cadet">${isBn ? 'ক্যাডেট' : 'Cadet'}</span>
            <span class="col-title">${isBn ? 'পদমর্যাদা' : 'Title'}</span>
            <span class="col-badges">${isBn ? 'ব্যাজ' : 'Badges'}</span>
            <span class="col-xp">${isBn ? 'এক্সপি' : 'XP Points'}</span>
          </div>

          <div class="lb-table-body">
            ${updatedBoard.map((item, index) => {
              const isPlayer = item.name.includes("You");
              return `
                <div class="lb-row ${isPlayer ? 'player-row' : ''} rank-${index + 1}">
                  <span class="col-rank">
                    ${index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
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
  }

  bindQuizEvents() {
    document.querySelectorAll('.quiz-tier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTier(btn.dataset.tier);
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
