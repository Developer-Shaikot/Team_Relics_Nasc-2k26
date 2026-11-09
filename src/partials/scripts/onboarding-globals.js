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
  document.body.classList.add('hub-active', 'hub-open');
  var radarHud = document.getElementById('rover-radar-hud');
  if (radarHud) {
    radarHud.style.display = 'none';
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
    var on = parseInt(pill.getAttribute('data-age'), 10) === a;
    pill.classList.toggle('active', on);
    pill.setAttribute('aria-pressed', String(on));
  });
  var badge = document.getElementById('aqua-age-profile-badge');
  var profileTitle = document.getElementById('aqua-age-profile-title');
  var profileDesc = document.getElementById('aqua-age-profile-desc');
  var isBn = window.__currentWizardLang === 'bn';
  var junior = a <= 10;
  if (badge) {
    badge.classList.toggle('junior', junior);
    badge.classList.toggle('senior', !junior);
  }
  if (junior) {
    if (profileTitle) profileTitle.innerText = isBn ? 'জুনিয়র এক্সপ্লোরার (বয়স ৬–১০)' : 'Junior Explorer (Ages 6–10)';
    if (profileDesc) profileDesc.innerText = isBn ? 'সহজ রোভার চালনা, বড় আইকন ও বন্ধুত্বপূর্ণ দিকনির্দেশনা!' : 'Visual hints, friendly bot guidance & easy rover controls!';
  } else {
    if (profileTitle) profileTitle.innerText = isBn ? 'সিনিয়র স্পেস ক্যাডেট (বয়স ১১–১৬)' : 'Space Cadet (Ages 11–16)';
    if (profileDesc) profileDesc.innerText = isBn ? 'আসল নাসার বৈজ্ঞানিক যন্ত্রপাতি, রেডিও সিগন্যাল ও রকেট ফিজিক্স!' : 'Real NASA science tools, deep space signals & rocket physics!';
  }
};

// "Surprise me" fun explorer names (step 1)
window.pickRandomCadetName = function () {
  var input = document.getElementById('aqua-cadet-name-input');
  if (!input) return;
  var names = window.__currentWizardLang === 'bn'
    ? ['ক্যাপ্টেন ধূমকেতু', 'চাঁদের পথিক', 'তারার শিকারি', 'রকেট রাজা', 'নোভা নিনজা', 'গ্যালাক্সি রক্ষক', 'মঙ্গলের মুসাফির', 'উল্কা উড়ুক্কু']
    : ['Captain Comet', 'Astro Ace', 'Nova Ninja', 'Rocket Rider', 'Star Seeker', 'Moon Hopper', 'Galaxy Guardian', 'Cosmo Kid', 'Meteor Max', 'Orbit Owl'];
  var pick = input.value;
  for (var i = 0; i < 6 && pick === input.value; i++) pick = names[Math.floor(Math.random() * names.length)];
  input.value = pick;
  // main.js saves the callsign on "input"
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.classList.remove('kid-pop');
  void input.offsetWidth;
  input.classList.add('kid-pop');
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

// Game Tour Video (wizard step 3): real gameplay recording with bilingual captions & chapters.
// Times match public/videos/game-tour.mp4 (57s). Captions are HTML (not burned in) so they follow the EN/BN toggle.
window.__tourCues = [
  { t: 0, chapter: null, en: 'Welcome to Relics of the Cosmic Dust!', bn: 'রেলিকস অফ দ্য কসমিক ডাস্ট-এ স্বাগতম!' },
  { t: 4.7, chapter: { en: 'Game Hub', bn: 'গেম হাব' }, en: 'This is your Game Hub. Pick the Moon, Mars or Deep Space!', bn: 'এটা তোমার গেম হাব। চাঁদ, মঙ্গল নাকি গভীর মহাকাশ বেছে নাও!' },
  { t: 11.4, chapter: { en: 'Drive on Mars', bn: 'মঙ্গলে ড্রাইভ' }, en: 'Drive your rover with W A S D toward the glowing beacon.', bn: 'W A S D দিয়ে রোভার চালাও, জ্বলজ্বলে বিকনের দিকে যাও।' },
  { t: 18.8, chapter: { en: 'Scan a Relic', bn: 'রেলিক স্ক্যান' }, en: 'Close enough? Press E to scan the relic and learn its story!', bn: 'কাছে চলে এসেছ? E চাপো, রেলিক স্ক্যান করে তার গল্প জানো!' },
  { t: 23.6, chapter: { en: 'The Moon', bn: 'চাঁদ' }, en: 'Explore the Moon, where Apollo 11 landed.', bn: 'চাঁদে ঘুরে দেখো, যেখানে অ্যাপোলো ১১ নেমেছিল।' },
  { t: 30.9, chapter: { en: 'Deep Space', bn: 'গভীর মহাকাশ' }, en: 'Fly out to Voyager 1, far away in interstellar space!', bn: 'উড়ে যাও ভয়েজার ১-এর কাছে, অনেক দূরের আন্তঃনাক্ষত্রিক মহাকাশে!' },
  { t: 37.7, chapter: { en: 'Science Labs', bn: 'সায়েন্স ল্যাব' }, en: 'Try real NASA science in the labs.', bn: 'ল্যাবে নাসার আসল বিজ্ঞান করে দেখো।' },
  { t: 44.4, chapter: { en: 'Quiz & Badges', bn: 'কুইজ ও ব্যাজ' }, en: 'Test what you learned in the Space Quiz.', bn: 'স্পেস কুইজে দেখো কতটা শিখলে।' },
  { t: 49.3, chapter: null, en: 'Collect badges and earn your certificate!', bn: 'ব্যাজ জমাও আর সার্টিফিকেট জেতো!' },
  { t: 53.4, chapter: null, en: "Ready? Let's meet your robot buddy!", bn: 'তৈরি? চলো, তোমার রোবট বন্ধুর সাথে দেখা করি!' }
];

window.initTourPlayer = function () {
  var video = document.getElementById('tour-video');
  if (!video || video.__tourReady) return video;
  video.__tourReady = true;

  var player = document.getElementById('tour-player');
  var bigPlay = document.getElementById('tour-big-play');
  var playBtn = document.getElementById('tour-play-btn');
  var scrub = document.getElementById('tour-scrub');
  var fill = document.getElementById('tour-scrub-fill');
  var marks = document.getElementById('tour-scrub-marks');
  var timeEl = document.getElementById('tour-time');
  var caption = document.getElementById('tour-caption');
  var ccBtn = document.getElementById('tour-cc-btn');
  var fsBtn = document.getElementById('tour-fs-btn');
  var chaptersEl = document.getElementById('tour-chapters');
  var cues = window.__tourCues;
  var showCaptions = true;
  var isBn = function () { return window.__currentWizardLang === 'bn'; };
  var dur = function () { return video.duration || 57; };
  var fmt = function (s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  var cueAt = function (t) { var c = cues[0]; for (var i = 0; i < cues.length; i++) if (cues[i].t <= t + 0.05) c = cues[i]; return c; };

  // Chapter chips + matching ticks on the progress bar
  var chapterCues = cues.filter(function (c) { return c.chapter; });
  chaptersEl.innerHTML = chapterCues.map(function (c, i) {
    return '<button type="button" class="tour-chapter" data-t="' + c.t + '"><span class="tour-chapter-num">' + (i + 1) + '</span><span class="tour-chapter-label"></span></button>';
  }).join('');
  var renderChapterLabels = function () {
    chaptersEl.querySelectorAll('.tour-chapter').forEach(function (b, i) {
      b.querySelector('.tour-chapter-label').textContent = isBn() ? chapterCues[i].chapter.bn : chapterCues[i].chapter.en;
    });
  };
  var renderMarks = function () {
    marks.innerHTML = chapterCues.map(function (c) { return '<span style="left:' + (c.t / dur() * 100) + '%"></span>'; }).join('');
  };
  chaptersEl.addEventListener('click', function (e) {
    var b = e.target.closest('.tour-chapter');
    if (!b) return;
    video.currentTime = parseFloat(b.getAttribute('data-t'));
    video.play().catch(function () {});
  });

  var render = function () {
    var t = video.currentTime;
    var pct = (t / dur()) * 100;
    fill.style.width = pct + '%';
    if (document.activeElement !== scrub) scrub.value = Math.round((t / dur()) * 1000);
    timeEl.textContent = fmt(t) + ' / ' + fmt(dur());
    var c = cueAt(t);
    caption.textContent = isBn() ? c.bn : c.en;
    caption.hidden = !showCaptions;
    var current = null;
    chapterCues.forEach(function (cc) { if (cc.t <= t + 0.05) current = cc; });
    chaptersEl.querySelectorAll('.tour-chapter').forEach(function (b, i) {
      var on = chapterCues[i] === current;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  };
  var syncPlaying = function () {
    var playing = !video.paused && !video.ended;
    player.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    bigPlay.setAttribute('aria-label', video.ended ? 'Replay tour video' : 'Play tour video');
    player.classList.toggle('is-ended', video.ended);
  };
  var toggle = function () { if (video.paused || video.ended) video.play().catch(function () {}); else video.pause(); };

  bigPlay.addEventListener('click', toggle);
  playBtn.addEventListener('click', toggle);
  video.addEventListener('click', toggle);
  ['play', 'pause', 'ended'].forEach(function (ev) { video.addEventListener(ev, syncPlaying); });
  video.addEventListener('timeupdate', render);
  video.addEventListener('loadedmetadata', function () { renderMarks(); render(); });
  scrub.addEventListener('input', function () { video.currentTime = (scrub.value / 1000) * dur(); render(); });
  ccBtn.addEventListener('click', function () {
    showCaptions = !showCaptions;
    ccBtn.setAttribute('aria-pressed', String(showCaptions));
    render();
  });
  var toggleFullscreen = function () {
    var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (isFs) {
      if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } else {
      var req = player.requestFullscreen || player.webkitRequestFullscreen || player.mozRequestFullScreen || player.msRequestFullscreen;
      if (req) {
        req.call(player).catch(function () {
          var stage = player.querySelector('.tour-stage');
          if (stage && stage.requestFullscreen) stage.requestFullscreen().catch(function () {});
          else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        });
      } else {
        var stage = player.querySelector('.tour-stage');
        if (stage && stage.requestFullscreen) stage.requestFullscreen().catch(function () {});
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      }
    }
  };

  fsBtn.addEventListener('click', toggleFullscreen);

  var syncFullscreenState = function () {
    var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    player.classList.toggle('is-fullscreen', isFs);
    if (isFs) {
      fsBtn.setAttribute('aria-label', 'Exit full screen');
      fsBtn.title = 'Exit full screen';
      fsBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
      fsBtn.setAttribute('aria-label', 'Full screen');
      fsBtn.title = 'Full screen';
      fsBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>';
      player.classList.remove('hide-controls');
    }
  };

  document.addEventListener('fullscreenchange', syncFullscreenState);
  document.addEventListener('webkitfullscreenchange', syncFullscreenState);
  document.addEventListener('mozfullscreenchange', syncFullscreenState);
  document.addEventListener('MSFullscreenChange', syncFullscreenState);

  // Auto-hide controls when idle in fullscreen
  var fsControlsTimer = null;
  var wakeControls = function () {
    player.classList.remove('hide-controls');
    clearTimeout(fsControlsTimer);
    var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || player.classList.contains('is-fullscreen'));
    if (isFs && !video.paused && !video.ended) {
      fsControlsTimer = setTimeout(function () {
        player.classList.add('hide-controls');
      }, 2500);
    }
  };
  player.addEventListener('mousemove', wakeControls);
  player.addEventListener('pointermove', wakeControls);
  player.addEventListener('click', wakeControls);

  video.addEventListener('dblclick', function (e) {
    e.preventDefault();
    toggleFullscreen();
  });
  // Pause whenever the player is hidden (other wizard step, wizard closed)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting && !video.paused) video.pause();
    }).observe(video);
  }

  video.__renderTour = function () { renderChapterLabels(); render(); };
  renderChapterLabels(); renderMarks(); render();
  return video;
};

window.startVideoPlayback = function () {
  var video = window.initTourPlayer();
  if (!video) return;
  if (video.ended) video.currentTime = 0;
  video.__renderTour && video.__renderTour();
  // Autoplay (muted, silent recording) unless the player asked for less motion
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) video.play().catch(function () {});
};
window.replayVideo = function () {
  var video = window.initTourPlayer();
  if (!video) return;
  video.currentTime = 0;
  video.play().catch(function () {});
};
window.skipVideo = function () {
  window.setAquaStep(4);
};
document.addEventListener('DOMContentLoaded', function () { window.initTourPlayer(); });

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
  window.selectWizardBot(window.__selectedBotId || 'echo');  var tourVideo = document.getElementById('tour-video');
  if (tourVideo && tourVideo.__renderTour) tourVideo.__renderTour();
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

// NOTE: the Start button is wired ONLY by its inline onclick. It used to also get
// click + pointerdown + touchend listeners here, so one tap ran dismissAquaSplash up
// to 4 times, and the pointerdown version hid the splash mid-press so the release
// "ghost-clicked" whatever wizard control sat underneath.
