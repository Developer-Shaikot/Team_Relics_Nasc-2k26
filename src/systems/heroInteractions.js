// Interactive Features & Animations for Game Hub Home Page
// Mascot Companion (Astro-Bot), Celestial Body Orrery Tooltips, 3D Card Tilt,
// Voice Previews, and Thruster Ignition Rocket Launch for Kids!

import confetti from 'canvas-confetti';
import { martianAudio } from './audio.js';

export const KID_SPACE_SECRETS = [
  "🚀 In 1/6th Moon gravity, you could jump right over a car without even trying!",
  "🔴 Martian sunsets glow royal BLUE because Martian dust scatters red light away!",
  "📀 Voyager 1 carries the Golden Record with whale songs, rain, and hellos in 55 languages!",
  "⭐ You are made of stardust! Every atom in your bones was forged inside ancient exploding stars!",
  "🛰️ Opportunity rover was planned to live 90 days, but explored Mars for 15 heroic YEARS!",
  "💓 InSight put its ear right on the Martian dirt to listen to the heartbeat of marsquakes!",
  "🌕 Neil Armstrong's footprints will last millions of years because the Moon has no wind or rain!",
  "🧪 Oppy found Martian 'blueberries' made of hematite that prove ancient liquid water existed!"
];

export class HeroInteractionsManager {
  constructor({
    coinsManager,
    actorDirector,
    setDestinationFn,
    onStartMissionFn
  }) {
    this.coinsManager = coinsManager;
    this.actorDirector = actorDirector;
    this.setDestination = setDestinationFn;
    this.onStartMission = onStartMissionFn;

    this.secretIndex = 0;
    this.currentPlanet = 'mars';

    this.initMascotAstroBot();
    this.initCelestialOrrery();
    this.initCharacterCardTilt();
    this.initVoicePreviews();
    this.initLaunchIgnitionButton();
  }

  // 1. Floating Interactive Mascot Astro-Bot
  initMascotAstroBot() {
    const mascotCard = document.getElementById('hero-interactive-astrobot');
    const mascotSvgWrap = document.getElementById('home-floating-astrobot-svg');
    const speechText = document.getElementById('astrobot-home-text');

    if (!mascotCard) return;

    // Render Robot Rig inside mascot wrapper
    if (mascotSvgWrap && this.actorDirector) {
      const stored = localStorage.getItem('jdsn_guide_robot');
      let botColor = '#00e5ff';
      if (stored) {
        try { botColor = JSON.parse(stored).color || '#00e5ff'; } catch (e) {}
      }
      mascotSvgWrap.innerHTML = this.actorDirector.getRobotRigSVG('mascot-home', botColor);
    }

    // Dynamic Eye Pupils Look-at-Cursor
    const heroSection = document.querySelector('.hub-hero-section');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const mascotRect = mascotCard.getBoundingClientRect();
        const mascotCenterX = mascotRect.left + mascotRect.width / 2;
        const mascotCenterY = mascotRect.top + mascotRect.height / 2;

        const dx = e.clientX - mascotCenterX;
        const dy = e.clientY - mascotCenterY;
        const angle = Math.atan2(dy, dx);
        const dist = Math.min(Math.hypot(dx, dy) / 40, 3.5);

        const offsetX = Math.cos(angle) * dist;
        const offsetY = Math.sin(angle) * dist;

        const leftEye = mascotCard.querySelector('.eye-left');
        const rightEye = mascotCard.querySelector('.eye-right');
        if (leftEye) leftEye.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        if (rightEye) rightEye.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    }

    // Mascot Tap / Click: Backflip, Confetti, Secret cycling & Coin reward!
    mascotCard.addEventListener('click', (e) => {
      e.stopPropagation();

      // Spin flip animation
      mascotCard.classList.remove('flip-spin');
      void mascotCard.offsetWidth; // trigger reflow
      mascotCard.classList.add('flip-spin');

      // Play joyful chirp audio
      martianAudio.playScannerBeep(true);
      martianAudio.playUiSwitch();

      // Reward 5 coins
      if (this.coinsManager) {
        this.coinsManager.addCoins(5);
      }

      // Small celebratory confetti burst from mascot
      try {
        const rect = mascotCard.getBoundingClientRect();
        const originX = (rect.left + rect.width / 2) / window.innerWidth;
        const originY = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 22,
          spread: 45,
          origin: { x: originX, y: originY },
          colors: ['#00e5ff', '#ffb700', '#ffffff'],
          disableForReducedMotion: true
        });
      } catch (err) {}

      // Cycle to next secret
      this.secretIndex = (this.secretIndex + 1) % KID_SPACE_SECRETS.length;
      if (speechText) {
        speechText.style.opacity = '0';
        setTimeout(() => {
          speechText.innerText = KID_SPACE_SECRETS[this.secretIndex];
          speechText.style.opacity = '1';
        }, 180);
      }
    });
  }

  // 2. Interactive Celestial Target Chips (Mars, Moon, Voyager)
  initCelestialOrrery() {
    const bodies = [
      { id: 'chip-target-mars', dest: 'mars', sound: () => martianAudio.playTelemetryTransmission() },
      { id: 'chip-target-moon', dest: 'moon', sound: () => martianAudio.playScannerBeep(false) },
      { id: 'chip-target-deepspace', dest: 'deepspace', sound: () => martianAudio.playTelemetryTransmission() }
    ];

    const heroSection = document.querySelector('.hub-hero-section');

    bodies.forEach(body => {
      const el = document.getElementById(body.id);
      if (!el) return;

      // Hover sound: handled globally (main.js 'hoverstart' listener)

      // Click: locks target, plays planet sound & switches destination
      el.addEventListener('click', (e) => {
        e.stopPropagation();

        // Update active state on target chips
        document.querySelectorAll('.target-planet-chip').forEach(b => b.classList.remove('active'));
        el.classList.add('active');

        // Apply ambiance class to hero section
        if (heroSection) {
          heroSection.classList.remove('mars-mode', 'moon-mode', 'deepspace-mode');
          heroSection.classList.add(`${body.dest}-mode`);
        }

        // Trigger destination change
        if (typeof this.setDestination === 'function') {
          this.setDestination(body.dest);
        }

        // Play body-specific sound
        body.sound();

        // Mini celebratory confetti from chip click
        try {
          const rect = el.getBoundingClientRect();
          const originX = (rect.left + rect.width / 2) / window.innerWidth;
          const originY = (rect.top + rect.height / 2) / window.innerHeight;
          confetti({
            particleCount: 18,
            spread: 40,
            origin: { x: originX, y: originY },
            colors: body.dest === 'mars' ? ['#ff5e28', '#ffb700'] : body.dest === 'moon' ? ['#38bdf8', '#ffffff'] : ['#a78bfa', '#00e5ff'],
            disableForReducedMotion: true
          });
        } catch (err) {}
      });
    });

    // Set initial active celestial target
    document.getElementById('chip-target-mars')?.classList.add('active');
    if (heroSection) heroSection.classList.add('mars-mode');
  }

  // 3. 3D Interactive Card Tilt on Commander Selection Cards
  initCharacterCardTilt() {
    const cards = document.querySelectorAll('.character-select-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rotateX = ((y - cy) / cy) * -8;
        const rotateY = ((x - cx) / cx) * 8;

        card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('hoverend', () => {
        card.style.transform = '';
      });
    });
  }

  // 4. Voice Preview Buttons on Asha & Leo Cards
  initVoicePreviews() {
    const btnAsha = document.getElementById('btn-voice-preview-asha');
    const btnLeo = document.getElementById('btn-voice-preview-leo');

    const quotes = {
      asha: "Asha: 'Radio frequencies locked! Ready to explore Mars!' 📡",
      leo: "Leo: 'Rover telemetry online! Rocker-bogie suspension ready!' 🕹️"
    };

    const playVoice = (commander, e) => {
      e.stopPropagation();
      martianAudio.playVoiceCadence(commander);

      // Show toast
      if (this.coinsManager) {
        this.coinsManager.showFloatingPickupText(quotes[commander]);
      }

      // Animated mouth / head motion
      const rig = document.querySelector(`.character-select-card[data-character="${commander}"] .actor-rig-svg`);
      if (rig) {
        rig.classList.add('actor-talking');
        setTimeout(() => rig.classList.remove('actor-talking'), 1200);
      }
    };

    btnAsha?.addEventListener('click', (e) => playVoice('asha', e));
    btnLeo?.addEventListener('click', (e) => playVoice('leo', e));
  }

  // 5. Thruster Ignition Blastoff on Start Mission Button
  initLaunchIgnitionButton() {
    const startBtn = document.getElementById('hero-start-mission-btn');
    if (!startBtn) return;

    startBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Launch ignition audio & particle plume
      martianAudio.playRocketIgnition(2.5);

      startBtn.classList.add('igniting');
      const heroSection = document.querySelector('.hub-hero-section');
      if (heroSection) heroSection.classList.add('launch-rumble');

      // Giant celebratory confetti shower
      try {
        confetti({
          particleCount: 45,
          spread: 80,
          origin: { y: 0.8 },
          colors: ['#ff5e28', '#ffb700', '#00e5ff', '#ffffff']
        });
      } catch (err) {}

      // Execute start mission callback after exciting ignition sequence
      setTimeout(() => {
        startBtn.classList.remove('igniting');
        if (heroSection) heroSection.classList.remove('launch-rumble');
        if (typeof this.onStartMission === 'function') {
          this.onStartMission();
        }
      }, 550);
    });
  }

  // Update robot color if user customizes it
  updateMascotColor(color) {
    const mascotSvgWrap = document.getElementById('home-floating-astrobot-svg');
    if (mascotSvgWrap && this.actorDirector) {
      mascotSvgWrap.innerHTML = this.actorDirector.getRobotRigSVG('mascot-home', color);
    }
  }
}

