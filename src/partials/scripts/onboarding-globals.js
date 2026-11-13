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
  // Start downloading the story film as soon as the wizard is open, so step 3 plays without buffering
  if (window.prefetchStoryFilm) window.prefetchStoryFilm();
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
// Ages 6-16 have quick-pick bubbles; any other age from 3 to 99 can be typed into the "Another age?" box.
window.CADET_AGE_MIN = 3;
window.CADET_AGE_MAX = 99;
var toBnDigits = function (n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); };

window.setCadetAge = function (age) {
  var a = parseInt(age, 10) || 10;
  a = Math.max(window.CADET_AGE_MIN, Math.min(window.CADET_AGE_MAX, a));
  try {
    localStorage.setItem('nasa_player_age', a);
  } catch (e) { }
  document.querySelectorAll('.aqua-age-pill').forEach(function (pill) {
    var on = parseInt(pill.getAttribute('data-age'), 10) === a;
    pill.classList.toggle('active', on);
    pill.setAttribute('aria-pressed', String(on));
  });
  // A typed-in age (outside the bubbles) lights up the "Another age?" box and keeps the number in it
  var custom = a < 6 || a > 16;
  var otherGroup = document.getElementById('kid-age-other-group');
  var customInput = document.getElementById('aqua-age-custom-input');
  if (otherGroup) otherGroup.classList.toggle('active', custom);
  if (customInput && document.activeElement !== customInput) customInput.value = custom ? a : '';

  var badge = document.getElementById('aqua-age-profile-badge');
  var profileTitle = document.getElementById('aqua-age-profile-title');
  var profileDesc = document.getElementById('aqua-age-profile-desc');
  var isBn = window.__currentWizardLang === 'bn';
  var ageText = isBn ? toBnDigits(a) : String(a);
  var junior = a <= 10;
  if (badge) {
    badge.classList.toggle('junior', junior);
    badge.classList.toggle('senior', !junior);
  }
  var title, desc;
  if (a < 6) {
    title = isBn ? 'ছোট্ট এক্সপ্লোরার (বয়স ' + ageText + ')' : 'Little Explorer (Age ' + ageText + ')';
    desc = isBn ? 'বড় আইকন, বন্ধু রোবটের সাহায্য আর সহজ রোভার চালনা! বড় কেউ পাশে থাকলে আরও মজা।' : 'Big pictures, a helpful robot buddy & easy rover controls. Even more fun with a grown-up!';
  } else if (junior) {
    title = isBn ? 'জুনিয়র এক্সপ্লোরার (বয়স ৬–১০)' : 'Junior Explorer (Ages 6–10)';
    desc = isBn ? 'সহজ রোভার চালনা, বড় আইকন ও বন্ধুত্বপূর্ণ দিকনির্দেশনা!' : 'Visual hints, friendly bot guidance & easy rover controls!';
  } else if (a <= 16) {
    title = isBn ? 'সিনিয়র স্পেস ক্যাডেট (বয়স ১১–১৬)' : 'Space Cadet (Ages 11–16)';
    desc = isBn ? 'আসল নাসার বৈজ্ঞানিক যন্ত্রপাতি, রেডিও সিগন্যাল ও রকেট ফিজিক্স!' : 'Real NASA science tools, deep space signals & rocket physics!';
  } else {
    title = isBn ? 'মিশন স্পেশালিস্ট (বয়স ' + ageText + ')' : 'Mission Specialist (Age ' + ageText + ')';
    desc = isBn ? 'পুরো নাসা বিজ্ঞান, আসল মিশনের তথ্য আর সব চ্যালেঞ্জ খোলা!' : 'Full NASA science, real mission data & every challenge unlocked!';
  }
  if (profileTitle) profileTitle.innerText = title;
  if (profileDesc) profileDesc.innerText = desc;
};

// "Another age?" box. quiet = true while typing (no error until they press Enter / "Use this age").
window.setCustomCadetAge = function (quiet) {
  var input = document.getElementById('aqua-age-custom-input');
  var msg = document.getElementById('aqua-age-custom-msg');
  if (!input) return;
  var raw = String(input.value).trim();
  var v = parseInt(raw, 10);
  var ok = /^\d{1,2}$/.test(raw) && v >= window.CADET_AGE_MIN && v <= window.CADET_AGE_MAX;
  if (ok) {
    if (msg) { msg.textContent = ''; msg.classList.remove('error'); }
    input.removeAttribute('aria-invalid');
    window.setCadetAge(v);
    return;
  }
  if (quiet) {
    if (msg) { msg.textContent = ''; msg.classList.remove('error'); }
    input.removeAttribute('aria-invalid');
    return;
  }
  var isBn = window.__currentWizardLang === 'bn';
  if (msg) {
    msg.textContent = isBn ? 'অনুগ্রহ করে ৩ থেকে ৯৯-এর মধ্যে একটা বয়স লেখো।' : 'Please type an age from 3 to 99.';
    msg.classList.add('error');
  }
  input.setAttribute('aria-invalid', 'true');
  input.focus();
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

// Story film (wizard step 3): "Abandoned but not Forgotten", the true stories of NASA equipment left on the Moon and Mars.
// public/videos/relics-story.mp4 (78s) is generated by `node scripts/media/render-story-film.mjs` from scripts/media/story-film/story-film.html.
// Times match the scenes in that file. Captions are HTML (not burned in) so they follow the EN/BN toggle.
window.__tourCues = [
  { t: 0, chapter: null, en: 'Out in space, NASA left some of its machines behind…', bn: 'মহাকাশে নাসা তাদের কিছু যন্ত্র রেখে এসেছে…' },
  { t: 3.8, chapter: null, en: 'Abandoned… but not forgotten. Every one has a story.', bn: 'পরিত্যক্ত… কিন্তু ভুলে যাওয়া নয়। প্রত্যেকটার একটা গল্প আছে।' },
  { t: 7, chapter: { en: 'Apollo 11', bn: 'অ্যাপোলো ১১' }, en: 'July 1969: Apollo 11 landed on the Moon at Tranquility Base.', bn: '১৯৬৯ সালের জুলাই: অ্যাপোলো ১১ চাঁদের ট্র্যাঙ্কুইলিটি বেসে নামল।' },
  { t: 10.6, chapter: null, en: 'The top part flew the astronauts home. The bottom part is still there!', bn: 'উপরের অংশ নভোচারীদের নিয়ে ফিরে গেল। নিচের অংশটা আজও সেখানেই আছে!' },
  { t: 15, chapter: { en: 'Moon Buggies', bn: 'চাঁদের গাড়ি' }, en: 'Apollo 15, 16 and 17 drove electric buggies on the Moon…', bn: 'অ্যাপোলো ১৫, ১৬ আর ১৭ চাঁদে বৈদ্যুতিক গাড়ি চালিয়েছিল…' },
  { t: 18.5, chapter: null, en: '…and parked all three there. They are still waiting.', bn: '…আর তিনটাই সেখানে পার্ক করে রেখে এসেছে। ওরা আজও অপেক্ষা করছে।' },
  { t: 22, chapter: { en: 'Laser Mirrors', bn: 'লেজার আয়না' }, en: 'Some relics still work! Apollo astronauts left mirrors on the Moon.', bn: 'কিছু রেলিক আজও কাজ করে! অ্যাপোলোর নভোচারীরা চাঁদে আয়না রেখে এসেছেন।' },
  { t: 25.5, chapter: null, en: 'Scientists bounce lasers off them to measure how far away the Moon is.', bn: 'বিজ্ঞানীরা সেগুলোতে লেজার পাঠিয়ে মাপেন চাঁদ কত দূরে।' },
  { t: 29, chapter: { en: 'Mars Pioneers', bn: 'মঙ্গলের পথিকৃৎ' }, en: 'On Mars, little Sojourner became the first rover in 1997.', bn: 'মঙ্গলে, ছোট্ট সোজার্নার ১৯৯৭ সালে প্রথম রোভার হলো।' },
  { t: 33, chapter: null, en: 'Spirit explored for six years, until it got stuck in soft sand.', bn: 'স্পিরিট ছয় বছর ঘুরে দেখেছে, তারপর নরম বালিতে আটকে গেছে।' },
  { t: 37, chapter: { en: 'Opportunity', bn: 'অপরচুনিটি' }, en: 'Opportunity drove more than 45 km in almost 15 years.', bn: 'অপরচুনিটি প্রায় ১৫ বছরে ৪৫ কিলোমিটারের বেশি পথ চলেছে।' },
  { t: 40.5, chapter: null, en: 'In 2018 a giant dust storm hid the Sun. Its solar panels went dark.', bn: '২০১৮ সালে বিশাল ধুলোঝড় সূর্য ঢেকে দিল। এর সোলার প্যানেল অন্ধকার হয়ে গেল।' },
  { t: 44, chapter: null, en: 'Its last signal reached Earth in June 2018. We still remember it.', bn: 'এর শেষ সংকেত পৃথিবীতে এসেছিল ২০১৮ সালের জুনে। আমরা আজও তাকে মনে রাখি।' },
  { t: 46, chapter: { en: 'Ingenuity', bn: 'ইনজেনুইটি' }, en: 'Ingenuity was the first helicopter on another planet. It flew 72 times!', bn: 'ইনজেনুইটি ছিল অন্য গ্রহে প্রথম হেলিকপ্টার। এটা ৭২ বার উড়েছে!' },
  { t: 49.5, chapter: null, en: 'In 2024 a broken rotor blade grounded it. It still stands on Mars.', bn: '২০২৪ সালে রোটরের পাখা ভেঙে এর ওড়া থামল। এটা আজও মঙ্গলে দাঁড়িয়ে আছে।' },
  { t: 53, chapter: { en: 'Your Mission', bn: 'তোমার মিশন' }, en: "Now it's your turn! Drive your rover to the glowing relics.", bn: 'এবার তোমার পালা! রোভার চালিয়ে জ্বলজ্বলে রেলিকগুলোর কাছে যাও।' },
  { t: 57, chapter: null, en: 'Press E to scan each one and unlock its true story.', bn: 'E চেপে প্রতিটা স্ক্যান করো আর তার আসল গল্প খুলে ফেলো।' },
  { t: 61, chapter: null, en: 'Finish every mission, answer the quiz, earn badges and your certificate.', bn: 'সব মিশন শেষ করো, কুইজের উত্তর দাও, ব্যাজ আর সার্টিফিকেট জেতো।' },
  { t: 65, chapter: null, en: 'Every relic you find keeps its story alive.', bn: 'তোমার খুঁজে পাওয়া প্রতিটা রেলিক তার গল্পকে বাঁচিয়ে রাখে।' },
  { t: 68, chapter: null, en: 'Abandoned, but never forgotten.', bn: 'পরিত্যক্ত, কিন্তু কখনো ভুলে যাওয়া নয়।' },
  { t: 72, chapter: null, en: "Ready, explorer? Let's meet your robot buddy!", bn: 'তৈরি, অভিযাত্রী? চলো তোমার রোবট বন্ধুর সাথে দেখা করি!' }
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
  var dur = function () { return (isFinite(video.duration) && video.duration) || 78; };
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
    window.playStoryFilm();
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
    bigPlay.setAttribute('aria-label', video.ended ? 'Replay story film' : 'Play story film');
    player.classList.toggle('is-ended', video.ended);
    // While the film plays, main.js pauses the 3D scene behind the wizard so the video gets the whole GPU
    window.__storyFilmPlaying = playing;
  };
  var toggle = function () { if (video.paused || video.ended) window.playStoryFilm(); else video.pause(); };
  // Real stalls (slow network): show the loading ring until frames flow again
  video.addEventListener('waiting', function () { window.setStoryFilmLoading(true); });
  video.addEventListener('playing', function () { window.setStoryFilmLoading(false); });

  bigPlay.addEventListener('click', toggle);
  playBtn.addEventListener('click', toggle);
  // A tap on a film that is playing muted (autoplay blocked) turns the sound on instead of pausing
  video.addEventListener('click', function () { if (!(video.__unmuteIfAutoMuted && video.__unmuteIfAutoMuted())) toggle(); });
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
  // Pause whenever the player is hidden (other wizard step, wizard closed, browser tab in the background)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting && !video.paused) video.pause();
    }).observe(video);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !video.paused) video.pause();
  });

  // Sound: the film has a music + effects soundtrack. It plays with sound by default;
  // if the browser blocks that, it plays muted and the "Tap for sound" chip appears.
  var volBtn = document.getElementById('tour-vol-btn');
  var soundHint = document.getElementById('tour-sound-hint');
  var syncSound = function () {
    player.classList.toggle('is-muted', video.muted);
    if (volBtn) {
      volBtn.setAttribute('aria-pressed', String(video.muted));
      volBtn.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
    }
    if (soundHint) soundHint.hidden = !(video.muted && video.__autoMuted);
  };
  var unmute = function () {
    video.__autoMuted = false;
    video.__userMuted = false;
    video.muted = false;
    if (video.paused) video.play().catch(function () {});
    syncSound();
  };
  if (volBtn) volBtn.addEventListener('click', function () {
    if (video.muted) { unmute(); return; }
    video.__userMuted = true;
    video.muted = true;
    syncSound();
  });
  if (soundHint) soundHint.addEventListener('click', function (e) { e.stopPropagation(); unmute(); });
  video.addEventListener('volumechange', syncSound);
  video.__syncSound = syncSound;
  video.__unmuteIfAutoMuted = function () { if (video.__autoMuted) { unmute(); return true; } return false; };
  syncSound();

  video.__renderTour = function () { renderChapterLabels(); render(); };
  renderChapterLabels(); renderMarks(); render();
  return video;
};

// The whole film is downloaded into memory once the wizard opens (while the player reads steps 1-2),
// so playback never waits on the network or competes with the game's own files loading.
window.__storyFilmSrc = './videos/relics-story.mp4';
window.prefetchStoryFilm = function () {
  if (window.__storyFilmFetch) return window.__storyFilmFetch;
  window.__storyFilmProgress = 0;
  // XHR with a blob response: the browser collects the bytes off the main thread (a JS stream reader
  // crawls while the page is busy) and still reports progress for the loading ring.
  window.__storyFilmFetch = new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', window.__storyFilmSrc);
    xhr.responseType = 'blob';
    xhr.onprogress = function (e) {
      if (!e.lengthComputable) return;
      window.__storyFilmProgress = e.loaded / e.total;
      if (window.__storyFilmOnProgress) window.__storyFilmOnProgress(window.__storyFilmProgress);
    };
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
      else reject(new Error('HTTP ' + xhr.status));
    };
    xhr.onerror = function () { reject(new Error('network error')); };
    xhr.send();
  }).then(function (blob) {
    window.__storyFilmBlobUrl = URL.createObjectURL(blob);
    window.__storyFilmProgress = 1;
    // Warm up the player now (decoder ready, first frame loaded) so step 3 starts instantly
    var v = document.getElementById('tour-video');
    if (v && v.paused && v.getAttribute('src') !== window.__storyFilmBlobUrl) {
      v.preload = 'auto';
      v.src = window.__storyFilmBlobUrl;
      v.load();
    }
    return window.__storyFilmBlobUrl;
  }).catch(function (err) {
    console.warn('Story film prefetch failed, streaming it instead:', err);
    return null;
  });
  return window.__storyFilmFetch;
};

window.setStoryFilmLoading = function (on, pct) {
  var player = document.getElementById('tour-player');
  var box = document.getElementById('tour-loading');
  var label = document.getElementById('tour-loading-text');
  if (!player || !box) return;
  player.classList.toggle('is-loading', !!on);
  box.hidden = !on;
  if (label) {
    var bn = window.__currentWizardLang === 'bn';
    var base = bn ? 'ফিল্ম লোড হচ্ছে…' : 'Loading film…';
    label.textContent = typeof pct === 'number' ? base + ' ' + Math.round(pct * 100) + '%' : base;
  }
};

// Plays the film from memory (waiting for the download if needed), with sound when the browser allows it.
window.playStoryFilm = function () {
  var video = window.initTourPlayer();
  if (!video) return;
  var token = (window.__storyFilmPlayToken || 0) + 1;
  window.__storyFilmPlayToken = token;
  var go = function (blobUrl) {
    window.__storyFilmOnProgress = null;
    // the player moved on (left step 3, paused, pressed play again) while we were loading
    var onStep3 = document.getElementById('aqua-step-3-panel');
    if (token !== window.__storyFilmPlayToken || !(onStep3 && onStep3.classList.contains('active'))) { window.setStoryFilmLoading(false); return; }
    if (blobUrl && video.getAttribute('src') !== blobUrl) {
      var at = video.ended ? 0 : video.currentTime;
      video.src = blobUrl;
      if (at) video.currentTime = at;
    }
    if (video.ended) video.currentTime = 0;
    window.setStoryFilmLoading(false);
    video.muted = !!video.__userMuted;
    video.__autoMuted = false;
    var attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(function (err) {
        // Only an autoplay block falls back to muted (an AbortError just means it was paused right away)
        if (video.muted || !err || err.name !== 'NotAllowedError') return;
        video.muted = true;
        video.__autoMuted = true;
        video.__syncSound && video.__syncSound();
        video.play().catch(function () {});
      });
    }
    video.__syncSound && video.__syncSound();
  };
  if (window.__storyFilmBlobUrl) { go(window.__storyFilmBlobUrl); return; }
  window.setStoryFilmLoading(true, window.__storyFilmProgress || 0);
  window.__storyFilmOnProgress = function (p) { window.setStoryFilmLoading(true, p); };
  window.prefetchStoryFilm().then(go);
};

window.startVideoPlayback = function () {
  var video = window.initTourPlayer();
  if (!video) return;
  video.__renderTour && video.__renderTour();
  window.prefetchStoryFilm();
  // Autoplay with sound (the player reached this step by clicking Next, so browsers allow it),
  // unless they asked for less motion. If sound is still blocked, it plays muted with "Tap for sound".
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  window.playStoryFilm();
};
window.replayVideo = function () {
  var video = window.initTourPlayer();
  if (!video) return;
  video.currentTime = 0;
  window.playStoryFilm();
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
  // The header now shows the game audio switch (its label follows the language)
  if (window.syncGameAudioUI) window.syncGameAudioUI();

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
  // Saved cadets but nobody signed in (after Log Out): pick who's playing instead of making a new profile
  var pm = window.profileManager;
  if (pm && !pm.getActiveProfile() && pm.getAllProfiles().length > 0 && !window.__isRegisteringNewCadet) {
    pm.openProfileSwitcherModal();
    return;
  }
  window.openAquaGuidedModal(1);
};
window.startGame = window.dismissAquaSplash;
window.handleStartGameClick = window.dismissAquaSplash;

// NOTE: the Start button is wired ONLY by its inline onclick. It used to also get
// click + pointerdown + touchend listeners here, so one tap ran dismissAquaSplash up
// to 4 times, and the pointerdown version hid the splash mid-press so the release
// "ghost-clicked" whatever wizard control sat underneath.
