// Onboarding & navigation globals (Aqua splash, guided wizard, homepage tour, hub open/close).
//
// Inlined into index.html as a classic <script> at build time (via
// the include marker in index.html), exactly like the original inline
// script, so the inline onclick handlers work immediately, even while the large 3D
// bundle is still downloading. Plain script: no import/export.
// When main.js finishes loading it replaces several of these
// (openGameHub, dismissAquaSplash, setAquaStep, ...) with fuller versions that add
// sounds, profile tracking and 3D sync; the inline onclicks pick those up
// automatically because they always call window.<name>.

window.__currentWizardLang = localStorage.getItem('nasa_lang') || 'en';
window.__currentWizardStep = 1;
window.__currentVideoSlide = 1;
window.__currentTourStep = 1;
window.__selectedBotId = localStorage.getItem('nasa_selected_bot') || 'echo';

window.setAquaStep = function (step) {
  var currentStep = Math.max(1, Math.min(5, step));
  window.__currentWizardStep = currentStep;
  for (var i = 1; i <= 5; i++) {
    var node = document.getElementById('aqua-step-indicator-' + i);
    var panel = document.getElementById('aqua-step-' + i + '-panel');
    if (node) {
      node.classList.toggle('active', i === currentStep);
      node.classList.toggle('completed', i < currentStep);
    }
    if (panel) {
      panel.classList.toggle('active', i === currentStep);
    }
  }
  for (var c = 1; c <= 4; c++) {
    var conn = document.getElementById('aqua-step-conn-' + c);
    if (conn) conn.classList.toggle('filled', currentStep > c);
  }
  if (currentStep === 3) {
    window.startVideoPlayback && window.startVideoPlayback();
  }
};

window.openGameHub = function () {
  var modal = document.getElementById('aqua-guided-modal-backdrop');
  if (modal) {
    modal.classList.remove('active');
    modal.style.setProperty('display', 'none', 'important');
  }
  var splash = document.getElementById('aqua-splash-screen');
  if (splash) {
    splash.classList.remove('active');
    splash.classList.add('fading-out');
    splash.style.setProperty('display', 'none', 'important');
    splash.style.pointerEvents = 'none';
  }
  window.__isSplashActive = false;

  var hub = document.getElementById('game-hub-screen');
  if (hub) {
    hub.style.setProperty('display', 'grid', 'important');
    hub.classList.add('active');
  }
  var inGameBack = document.getElementById('btn-in-game-back-to-hub');
  if (inGameBack) inGameBack.style.display = 'none';
  document.querySelectorAll('.modal-backdrop.active').forEach(function (m) {
    m.classList.remove('active');
  });
  window.profileManager?.recordScreen('game-hub', { tab: 'home' });
};

window.completeOnboardingToHub = function () {
  try {
    var nameInput = document.getElementById('aqua-cadet-name-input');
    var val = (nameInput && nameInput.value.trim()) || 'Cadet Explorer';
    var curAge = parseInt(localStorage.getItem('nasa_player_age'), 10) || 10;
    var chosenBot = localStorage.getItem('nasa_selected_bot') || window.__selectedBotId || 'echo';

    if (window.__isRegisteringNewCadet || !window.profileManager?.getActiveProfile()) {
      window.profileManager?.createProfile({
        name: val,
        age: curAge,
        botId: chosenBot
      });
      window.__isRegisteringNewCadet = false;
    } else {
      window.profileManager?.updateActiveProfile({
        name: val,
        age: curAge,
        botId: chosenBot
      });
    }
    localStorage.removeItem('nasa_user_logged_out');
    window.setGameCompanion && window.setGameCompanion(chosenBot);
  } catch (e) { }
  window.openGameHub();
};

window.closeGameHub = function () {
  var hub = document.getElementById('game-hub-screen');
  if (hub) {
    hub.classList.remove('active');
    hub.style.display = 'none';
  }
};

window.closeAquaGuidedModal = function () {
  var modal = document.getElementById('aqua-guided-modal-backdrop');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
  var hub = document.getElementById('game-hub-screen');
  if (hub) {
    hub.style.display = 'grid';
    hub.classList.add('active');
  }
};

// User dismissed the wizard (✕ / Escape): always return to the Game Hub, never drop into the 3D game.
window.dismissAquaGuidedModal = function () {
  window.openGameHub();
};

window.openAquaGuidedModal = function (step) {
  window.setAquaStep(step || 1);
  var modal = document.getElementById('aqua-guided-modal-backdrop');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
};

// Age Selector (6 to 16)
window.setCadetAge = function (age) {
  var a = parseInt(age, 10) || 10;
  a = Math.max(6, Math.min(16, a));
  try {
    localStorage.setItem('nasa_player_age', a);
  } catch (e) { }
  document.querySelectorAll('.aqua-age-pill').forEach(function (pill) {
    pill.classList.toggle('active', parseInt(pill.getAttribute('data-age'), 10) === a);
  });
  var profileTitle = document.getElementById('aqua-age-profile-title');
  var profileDesc = document.getElementById('aqua-age-profile-desc');
  var isBn = window.__currentWizardLang === 'bn';
  if (a <= 10) {
    if (profileTitle) profileTitle.innerText = isBn ? '🌟 জুনিয়র এক্সপ্লোরার (বয়স ৬–১০)' : '🌟 Junior Explorer (Ages 6–10)';
    if (profileDesc) profileDesc.innerText = isBn ? 'সহজ রোভার চালনা, বড় আইকন ও বন্ধুত্বপূর্ণ দিকনির্দেশনা!' : 'Visual hints, friendly bot guidance & easy rover controls!';
  } else {
    if (profileTitle) profileTitle.innerText = isBn ? '🚀 সিনিয়র স্পেস ক্যাডেট (বয়স ১১–১৬)' : '🚀 Senior Space Cadet (Ages 11–16)';
    if (profileDesc) profileDesc.innerText = isBn ? 'আসল নাসার বৈজ্ঞানিক যন্ত্রপাতি, রেডিও সিগন্যাল ও রকেট ফিজিক্স!' : 'Authentic JPL spectrometers, deep space telemetry & orbital delta-v physics!';
  }
};

// Bot Selection: Echo (Astro-Bot), Nova (Cyber-Kitty), Orion (Rover-Drone)
window.selectWizardBot = function (botId) {
  window.__selectedBotId = botId;
  try {
    localStorage.setItem('nasa_selected_bot', botId);
    localStorage.setItem('nasa_selected_companion', botId);
  } catch (e) { }
  ['echo', 'nova', 'orion'].forEach(function (id) {
    var card = document.getElementById('aqua-bot-card-' + id);
    var ind = document.getElementById('aqua-bot-ind-' + id);
    var isActive = (id === botId);
    if (card) card.classList.toggle('active', isActive);
    if (ind) {
      var isBn = window.__currentWizardLang === 'bn';
      ind.innerText = isActive ? (isBn ? '✓ নির্বাচিত সঙ্গী' : '✓ SELECTED BUDDY') : (isBn ? 'এই বটটি বেছে নাও' : 'CHOOSE THIS BOT');
    }
  });
  if (typeof window.setGameCompanion === 'function') {
    window.setGameCompanion(botId);
  }
};

// Backward compatibility for commander cards if referenced
window.selectAquaCommander = function (char) {
  window.selectWizardBot(char === 'asha' ? 'echo' : 'nova');
};

// Exploration Video Presentation Logic
window.setVideoSlide = function (slideNum) {
  window.__currentVideoSlide = Math.max(1, Math.min(3, slideNum));
  for (var s = 1; s <= 3; s++) {
    var slide = document.getElementById('aqua-video-slide-' + s);
    var dot = document.getElementById('aqua-video-dot-' + s);
    if (slide) slide.style.display = (s === window.__currentVideoSlide) ? 'block' : 'none';
    if (dot) dot.classList.toggle('active', s === window.__currentVideoSlide);
  }
  var fill = document.getElementById('aqua-video-progress-fill');
  if (fill) fill.style.width = (window.__currentVideoSlide * 33.33) + '%';
};

window.advanceVideoSlide = function () {
  if (window.__currentVideoSlide < 3) {
    window.setVideoSlide(window.__currentVideoSlide + 1);
  } else {
    window.setAquaStep(4);
  }
};

window.replayVideo = function () {
  window.setVideoSlide(1);
};

window.skipVideo = function () {
  window.setAquaStep(4);
};

window.startVideoPlayback = function () {
  window.setVideoSlide(1);
};

// Language Toggle (English <-> Bengali)
window.toggleWizardLanguage = function () {
  var next = (window.__currentWizardLang === 'en') ? 'bn' : 'en';
  window.applyWizardLanguage(next);
  if (typeof window.setGlobalGameLanguage === 'function') {
    window.setGlobalGameLanguage(next);
  }
};

window.applyWizardLanguage = function (lang) {
  window.__currentWizardLang = lang;
  try { localStorage.setItem('nasa_lang', lang); } catch (e) { }
  var isBn = lang === 'bn';
  // Screen readers / fonts / hyphenation follow the page language
  document.documentElement.lang = isBn ? 'bn' : 'en';
  var langLabel = document.getElementById('aqua-lang-label');
  if (langLabel) langLabel.innerText = isBn ? 'English (EN)' : 'বাংলা (BN)';

  // Update text nodes across the wizard
  document.querySelectorAll('[data-i18n-en]').forEach(function (el) {
    var txt = isBn ? el.getAttribute('data-i18n-bn') : el.getAttribute('data-i18n-en');
    if (txt) el.innerText = txt;
  });
  document.querySelectorAll('[data-i18n-placeholder-en]').forEach(function (el) {
    var ph = isBn ? el.getAttribute('data-i18n-placeholder-bn') : el.getAttribute('data-i18n-placeholder-en');
    if (ph) el.placeholder = ph;
  });
  var curAge = parseInt(localStorage.getItem('nasa_player_age'), 10) || 10;
  window.setCadetAge(curAge);
  window.selectWizardBot(window.__selectedBotId || 'echo');
};

// Direct Launch First Mission -> Opens Game Hub
window.launchFirstMission = function () {
  var nameInput = document.getElementById('aqua-cadet-name-input');
  var nameVal = (nameInput && nameInput.value.trim()) || 'Cadet Explorer';
  try {
    localStorage.setItem('nasa_player_callsign', nameVal);
    localStorage.setItem('nasa_selected_bot', window.__selectedBotId || 'echo');
    localStorage.removeItem('nasa_user_logged_out');
  } catch (e) { }

  window.openGameHub();
};

window.launchAquaMission = function (dest, missionId) {
  window.closeAquaGuidedModal();

  var splash = document.getElementById('aqua-splash-screen');
  if (splash) {
    splash.classList.remove('active');
    splash.style.display = 'none';
  }

  var hub = document.getElementById('game-hub-screen');
  if (hub) {
    hub.classList.remove('active');
    hub.style.display = 'none';
  }

  var modal = document.getElementById('aqua-guided-modal-backdrop');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }

  if (typeof window.launchMissionDirect === 'function') {
    window.launchMissionDirect(dest, missionId);
  }
};

// Fail-safe immediate handler for Start Game button
window.dismissAquaSplash = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  try {
    if (window.martianAudio) {
      window.martianAudio.unlock();
      window.martianAudio.playUiConfirm?.();
    }
  } catch (err) { }
  const splash = document.getElementById('aqua-splash-screen');
  if (splash) {
    splash.classList.add('fading-out');
    splash.classList.remove('active');
    splash.style.pointerEvents = 'none';
    splash.style.display = 'none';
  }
  window.__isSplashActive = false;
  window.openAquaGuidedModal(1);
};
window.startGame = window.dismissAquaSplash;
window.handleStartGameClick = window.dismissAquaSplash;

// Guided Homepage Tour Handlers (Section 8 & ৮)
window.startHomepageTour = function () {
  window.__currentTourStep = 1;
  var tour = document.getElementById('aqua-tour-backdrop');
  if (tour) {
    tour.classList.add('active');
    tour.style.display = 'flex';
    window.renderTourStep(1);
  }
};

window.closeHomepageTour = function () {
  var tour = document.getElementById('aqua-tour-backdrop');
  if (tour) {
    tour.classList.remove('active');
    tour.style.display = 'none';
  }
};

window.nextTourStep = function () {
  if (window.__currentTourStep < 4) {
    window.__currentTourStep++;
    window.renderTourStep(window.__currentTourStep);
  } else {
    window.closeHomepageTour();
  }
};

window.prevTourStep = function () {
  if (window.__currentTourStep > 1) {
    window.__currentTourStep--;
    window.renderTourStep(window.__currentTourStep);
  }
};

window.renderTourStep = function (step) {
  var isBn = window.__currentWizardLang === 'bn';
  var titleEl = document.getElementById('aqua-tour-title');
  var descEl = document.getElementById('aqua-tour-desc');
  var numEl = document.getElementById('aqua-tour-step-num');
  var nextBtn = document.getElementById('aqua-tour-next-btn');
  var prevBtn = document.getElementById('aqua-tour-prev-btn');

  if (numEl) numEl.innerText = step + ' / 4';
  if (prevBtn) prevBtn.style.display = step > 1 ? 'inline-flex' : 'none';
  if (nextBtn) {
    if (step === 4) {
      nextBtn.innerText = isBn ? 'অভিযান শুরু করো! 🚀' : 'Start Exploring! 🚀';
    } else {
      nextBtn.innerText = isBn ? 'পরবর্তী অংশ ➔' : 'Next Section ➔';
    }
  }

  var tourData = [
    {
      titleEn: '1. Planetary Gateways 🪐',
      titleBn: '১. গ্রহের প্রবেশদ্বার 🪐',
      descEn: 'Choose your cosmic destination! Venture across lunar craters, navigate Martian valleys, or journey into Deep Space.',
      descBn: 'তোমার পছন্দের মহাজাগতিক গন্তব্য বেছে নাও—চাঁদের জ্বালামুখী, মঙ্গলের লাল মাটি কিংবা গভীর মহাশূন্যে পাড়ি দাও!'
    },
    {
      titleEn: '2. 3D Solar System & Orrery 🌌',
      titleBn: '২. সৌরজগতের ৩D অরারি 🌌',
      descEn: 'Inspect real-time 3D planetary orbits! Watch how worlds circle the Sun in accurate celestial mechanics.',
      descBn: 'গ্রহগুলোর বাস্তবসম্মত ৩D কক্ষপথ পর্যবেক্ষণ করো এবং কীভাবে তারা সূর্যের চারদিকে ঘোরে তা দেখো!'
    },
    {
      titleEn: '3. JPL Science & Telemetry Labs 🧪',
      titleBn: '৩. নাসার সায়েন্স ল্যাব 🧪',
      descEn: 'Calibrate real NASA instruments! Run rocket delta-v staging, decode hematite spectra, and analyze marsquakes.',
      descBn: 'নাসার আসল যন্ত্রপাতি ব্যবহার করো—রকেট সমীকরণ সমাধান করো এবং মঙ্গল-কম্পন পরিমাপ করো!'
    },
    {
      titleEn: '4. Cosmic Quizzes & Badges 🏆',
      titleBn: '৪. কুইজ ও স্পেস ব্যাজ 🏆',
      descEn: 'Test your space knowledge, climb the global cadet leaderboard, and unlock official NASA Space Apps Grand Master badges!',
      descBn: 'মহাকাশ কুইজে অংশ নিয়ে লিডারবোর্ডে এগিয়ে যাও এবং গ্র্যান্ড মাস্টার ব্যাজ অর্জন করো!'
    }
  ];

  var d = tourData[step - 1];
  if (d) {
    if (titleEl) titleEl.innerText = isBn ? d.titleBn : d.titleEn;
    if (descEl) descEl.innerText = isBn ? d.descBn : d.descEn;
  }
};

// NOTE: the Start button is wired ONLY by its inline onclick. It used to also get
// click + pointerdown + touchend listeners here, so one tap ran dismissAquaSplash up
// to 4 times, and the pointerdown version hid the splash mid-press so the release
// "ghost-clicked" whatever wizard control sat underneath.
