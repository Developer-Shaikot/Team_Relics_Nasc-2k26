// Companion Kitty Guide Robot Manager & 3D Escort Controller
// Features: Carousel selection with glowing halo, 3D Mesh Ear/Antenna rigs,
// floating speech bubble projected from 3D coordinates, and audible Web Speech API TTS!

import * as THREE from 'three';
import { martianAudio } from './audio.js';

export const KITTY_ARCHETYPES = [
  {
    id: 'astro_bot',
    name: 'Astro-Bot',
    title: 'Science & Telemetry Specialist',
    color: '#00e5ff',
    icon: '🐱',
    lore: 'Calibrated by Asha on her Dhaka rooftop. Uses dual S-band antennas to scan historic relics.',
    perk: '📡 +50% LiDAR Scan Range',
    perkDesc: 'Identifies ancient NASA relics from further away.',
    stats: { range: 95, speed: 85, audioTone: 'Crisp / High' }
  },
  {
    id: 'solar_kitty',
    name: 'Solar Kitty',
    title: 'Geology & Mineral Spherule Scanner',
    color: '#ffb700',
    icon: '🐱',
    lore: 'Equipped with solar-absorbing gold plating and magnetized feline whiskers for mineral dust.',
    perk: '🪙 +40% Coin Magnet Attraction',
    perkDesc: 'Automatically draws nearby Cosmic Dust coins to your rover.',
    stats: { range: 80, speed: 90, audioTone: 'Warm / Melodic' }
  },
  {
    id: 'cyber_kitty',
    name: 'Cyber-Kitty',
    title: 'Deep Space Radio & Interstellar Drone',
    color: '#a855f7',
    icon: '🤖',
    lore: 'Pre-loaded with Voyager 1 Golden Record acoustics and quantum carrier wave decoders.',
    perk: '🌌 +25% Extra Telemetry Gems',
    perkDesc: 'Unlocks deeper data points during scientific analysis.',
    stats: { range: 90, speed: 80, audioTone: 'Cosmic / Resonant' }
  },
  {
    id: 'emerald_scout',
    name: 'Emerald Scout',
    title: 'Hazard Radar & Storm Navigator',
    color: '#10b981',
    icon: '🦊',
    lore: 'Built by Leo at KSC with gyroscopic stabilisers to navigate treacherous dust storms and steep crater rims.',
    perk: '🛡️ +35% Storm Stability & Traction',
    perkDesc: 'Helps prevent rover rollovers on steep slopes.',
    stats: { range: 85, speed: 95, audioTone: 'Energetic / Fast' }
  }
];

export class KittyCompanionManager {
  constructor({ scene, onCompanionChanged }) {
    this.scene = scene;
    this.onCompanionChanged = onCompanionChanged;
    this.archetypes = KITTY_ARCHETYPES;
    this.currentIndex = 0;

    // Load saved or default
    const saved = localStorage.getItem('jdsn_selected_kitty');
    if (saved) {
      const idx = this.archetypes.findIndex(k => k.id === saved);
      if (idx !== -1) this.currentIndex = idx;
    }

    this.activeKitty = this.archetypes[this.currentIndex];

    // Build 3D Floating Kitty Group
    this.group = new THREE.Group();
    this.group.name = "companion_kitty_drone";
    this.targetWaypoint = new THREE.Vector3(0, 0, 0);
    this.scene.add(this.group);
    this.group.visible = false;

    this.build3DKittyMesh();
    this.initDOM();
  }

  get current() {
    return this.archetypes[this.currentIndex];
  }

  selectCompanion(index) {
    this.setIndex(index);
  }

  say(text, durationMs = 6000) {
    this.speak(text, durationMs);
  }

  setIndex(indexOrId) {
    let resolvedIndex = 0;
    if (typeof indexOrId === 'number' && !isNaN(indexOrId)) {
      resolvedIndex = Math.floor(indexOrId);
    } else if (typeof indexOrId === 'string') {
      const lower = indexOrId.toLowerCase().trim();
      const botMap = {
        'echo': 0,
        'astro_bot': 0,
        'nova': 1,
        'solar_kitty': 1,
        'cyber_kitty': 2,
        'orion': 3,
        'emerald_scout': 3
      };
      if (botMap[lower] !== undefined) {
        resolvedIndex = botMap[lower];
      } else {
        const found = this.archetypes.findIndex(a => a.id.toLowerCase() === lower || a.name.toLowerCase().includes(lower));
        resolvedIndex = found !== -1 ? found : 0;
      }
    }

    this.currentIndex = ((resolvedIndex % this.archetypes.length) + this.archetypes.length) % this.archetypes.length;
    this.activeKitty = this.archetypes[this.currentIndex] || this.archetypes[0];
    localStorage.setItem('jdsn_selected_kitty', this.activeKitty.id);

    this.update3DAppearance();
    this.renderCarouselUI();

    if (this.onCompanionChanged) {
      this.onCompanionChanged(this.activeKitty);
    }
  }

  next() {
    this.setIndex(this.currentIndex + 1);
    martianAudio.playClick();
  }

  prev() {
    this.setIndex(this.currentIndex - 1);
    martianAudio.playClick();
  }

  initDOM() {
    const modalBackdrop = document.getElementById('kitty-carousel-modal');
    const openBtn = document.getElementById('btn-open-kitty-carousel');
    const closeBtn = document.getElementById('kitty-modal-close-btn');
    const confirmBtn = document.getElementById('btn-confirm-kitty');
    const prevBtn = document.getElementById('kitty-carousel-prev');
    const nextBtn = document.getElementById('kitty-carousel-next');

    openBtn?.addEventListener('click', () => {
      this.openModal();
    });

    closeBtn?.addEventListener('click', () => {
      this.closeModal();
    });

    modalBackdrop?.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) this.closeModal();
    });

    prevBtn?.addEventListener('click', () => this.prev());
    nextBtn?.addEventListener('click', () => this.next());

    confirmBtn?.addEventListener('click', () => {
      martianAudio.playScannerBeep(true);
      this.speak("Systems operational, Commander! Let's explore the cosmos!");
      this.closeModal();
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (modalBackdrop && modalBackdrop.classList.contains('active')) {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
        if (e.key === 'Escape') this.closeModal();
      }
    });

    this.renderCarouselUI();
  }

  openModal() {
    const modalBackdrop = document.getElementById('kitty-carousel-modal');
    if (modalBackdrop) modalBackdrop.classList.add('active');
    this.renderCarouselUI();
    martianAudio.playUiSwitch();
  }

  closeModal() {
    const modalBackdrop = document.getElementById('kitty-carousel-modal');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
    if (typeof this.onCloseCallback === 'function') {
      this.onCloseCallback();
    }
  }

  renderCarouselUI() {
    const active = this.current;

    // Update Top Hub pill
    const topName = document.getElementById('lbl-active-companion-name');
    const topDot = document.getElementById('active-kitty-dot');
    if (topName) topName.innerText = active.name.toUpperCase();
    if (topDot) topDot.style.background = active.color;

    // Update Modal Carousel Cards
    const cardsContainer = document.getElementById('kitty-cards-track');
    if (cardsContainer) {
      cardsContainer.innerHTML = this.archetypes.map((kitty, idx) => {
        const isSelected = idx === this.currentIndex;
        const isPrev = idx === ((this.currentIndex - 1 + this.archetypes.length) % this.archetypes.length);
        const isNext = idx === ((this.currentIndex + 1) % this.archetypes.length);

        let stateClass = 'side-card';
        if (isSelected) stateClass = 'center-card active';
        else if (isPrev) stateClass = 'side-card prev-card';
        else if (isNext) stateClass = 'side-card next-card';

        return `
          <div class="kitty-carousel-item ${stateClass}" data-idx="${idx}" style="--kitty-accent: ${kitty.color}">
            <div class="kitty-halo-glow" style="background: radial-gradient(circle, ${kitty.color}44 0%, transparent 70%);"></div>
            <div class="kitty-avatar-sphere" style="box-shadow: 0 0 25px ${kitty.color}66; border-color: ${kitty.color};">
              <span class="kitty-emoji">${kitty.icon}</span>
              <div class="kitty-ear ear-left" style="border-bottom-color: ${kitty.color};"></div>
              <div class="kitty-ear ear-right" style="border-bottom-color: ${kitty.color};"></div>
            </div>
            <div class="kitty-card-meta">
              <h3 class="kitty-title" style="color: ${kitty.color};">${kitty.name}</h3>
              <span class="kitty-sub">${kitty.title}</span>
            </div>
          </div>
        `;
      }).join('');

      // Click card to select
      cardsContainer.querySelectorAll('.kitty-carousel-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.idx, 10);
          if (idx !== this.currentIndex) {
            this.setIndex(idx);
          }
        });
      });
    }

    // Detail Panel
    const detailPanel = document.getElementById('kitty-detail-panel');
    if (detailPanel) {
      detailPanel.innerHTML = `
        <div class="kitty-detail-header">
          <span class="kitty-perk-badge" style="background: ${active.color}22; border-color: ${active.color}; color: ${active.color}">
            ${active.perk}
          </span>
          <p class="kitty-lore">${active.lore}</p>
        </div>
        <div class="kitty-stats-bars">
          <div class="stat-bar-row">
            <span>Scan Radar:</span>
            <div class="stat-progress-bg"><div class="stat-progress-fill" style="width: ${active.stats.range}%; background: ${active.color};"></div></div>
          </div>
          <div class="stat-bar-row">
            <span>Thruster Agility:</span>
            <div class="stat-progress-bg"><div class="stat-progress-fill" style="width: ${active.stats.speed}%; background: ${active.color};"></div></div>
          </div>
        </div>
      `;
    }
  }

  // 3D Kitty Construction
  build3DKittyMesh() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    const color = new THREE.Color(this.activeKitty.color);

    // 1. Spherical Body Chassis
    this.chassisMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.85,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.35
    });

    const bodyGeo = new THREE.SphereGeometry(0.34, 24, 20);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.chassisMat);
    this.group.add(bodyMesh);

    // 2. Visor Screen Face
    const visorGeo = new THREE.BoxGeometry(0.38, 0.17, 0.24);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.15,
      metalness: 0.95
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.18);
    this.group.add(visor);

    // 3. Glowing LED Cat Eyes
    const eyeGeo = new THREE.SphereGeometry(0.048, 12, 12);
    this.eyeMat = new THREE.MeshBasicMaterial({ color: color });
    const eyeL = new THREE.Mesh(eyeGeo, this.eyeMat);
    eyeL.position.set(-0.095, 0.06, 0.29);
    const eyeR = new THREE.Mesh(eyeGeo, this.eyeMat);
    eyeR.position.set(0.095, 0.06, 0.29);
    this.group.add(eyeL);
    this.group.add(eyeR);

    // 4. Robotic Kitty Ears
    const earGeo = new THREE.ConeGeometry(0.09, 0.22, 4);
    this.earMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.9,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.3
    });

    const earL = new THREE.Mesh(earGeo, this.earMat);
    earL.position.set(-0.16, 0.36, 0.02);
    earL.rotation.z = 0.28;
    earL.rotation.y = -0.2;
    this.group.add(earL);

    const earR = new THREE.Mesh(earGeo, this.earMat);
    earR.position.set(0.16, 0.36, 0.02);
    earR.rotation.z = -0.28;
    earR.rotation.y = 0.2;
    this.group.add(earR);

    // 5. Holographic Navigation Pointer Arrow
    const arrowGeo = new THREE.ConeGeometry(0.12, 0.45, 12);
    arrowGeo.rotateX(Math.PI / 2);
    this.arrowMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.85
    });
    this.pointerArrow = new THREE.Mesh(arrowGeo, this.arrowMat);
    this.pointerArrow.position.set(0, 0.52, 0.15);
    this.group.add(this.pointerArrow);

    // 6. Plasma Thruster Light & Cone
    const thrusterGeo = new THREE.ConeGeometry(0.12, 0.26, 12);
    this.thrusterMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8
    });
    this.thruster = new THREE.Mesh(thrusterGeo, this.thrusterMat);
    this.thruster.position.set(0, -0.4, 0);
    this.group.add(this.thruster);

    this.thrusterLight = new THREE.PointLight(color, 1.5, 5);
    this.thrusterLight.position.set(0, -0.42, 0);
    this.group.add(this.thrusterLight);
  }

  update3DAppearance() {
    const color = new THREE.Color(this.activeKitty.color);
    if (this.chassisMat) {
      this.chassisMat.color.set(color);
      this.chassisMat.emissive.set(color);
    }
    if (this.earMat) {
      this.earMat.color.set(color);
      this.earMat.emissive.set(color);
    }
    if (this.eyeMat) {
      this.eyeMat.color.set(color);
    }
    if (this.arrowMat) {
      this.arrowMat.color.set(color);
    }
    if (this.thrusterLight) {
      this.thrusterLight.color.set(color);
    }
  }

  setTargetWaypoint(x, y, z) {
    this.targetWaypoint.set(x, y, z);
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  // Floating Speech Bubble with Audible Web Speech API TTS
  speak(text, durationMs = 6000) {
    const bubble = document.getElementById('hud-companion-speech');
    const bubbleText = document.getElementById('hud-companion-speech-text');
    const bubbleSpeaker = document.getElementById('hud-companion-speech-name');

    if (bubble && bubbleText) {
      bubbleText.innerText = text;
      if (bubbleSpeaker) bubbleSpeaker.innerText = `${(this.activeKitty?.name || 'COMPANION').toUpperCase()} (COMPANION)`;
      bubble.classList.add('visible');

      clearTimeout(this.speechTimer);
      this.speechTimer = setTimeout(() => {
        bubble.classList.remove('visible');
      }, durationMs);
    }

    // Audible Web Speech API
    if (window.speechSynthesis && !martianAudio.isMuted) {
      try {
        window.speechSynthesis.cancel(); // Stop prior utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.25; // Friendly slightly higher pitch for companion Kitty
        utterance.volume = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS Speech Synthesis failed:", e);
      }
    }
  }

  update(delta, elapsedTime, roverPos, roverHeading = 0) {
    if (!this.group.visible || !roverPos) return;

    // Desired bot hover position: offset to the side and slightly ahead
    const sideOffset = 1.6;
    const aheadDist = 1.2;
    const hoverY = roverPos.y + 2.1 + Math.sin(elapsedTime * 3.8) * 0.16;

    const angle = roverHeading + 0.45;
    const targetX = roverPos.x - Math.sin(angle) * sideOffset - Math.sin(roverHeading) * aheadDist;
    const targetZ = roverPos.z - Math.cos(angle) * sideOffset - Math.cos(roverHeading) * aheadDist;

    // Smooth lerp
    this.group.position.x += (targetX - this.group.position.x) * 0.08;
    this.group.position.z += (targetZ - this.group.position.z) * 0.08;
    this.group.position.y += (hoverY - this.group.position.y) * 0.1;

    // Pointer points towards target relic
    if (this.pointerArrow && this.targetWaypoint) {
      const dir = new THREE.Vector3().subVectors(this.targetWaypoint, this.group.position).normalize();
      const lookTarget = new THREE.Vector3().addVectors(this.group.position, dir);
      this.pointerArrow.lookAt(lookTarget);
    }

    // Thruster flicker
    if (this.thruster) {
      this.thruster.scale.y = 0.85 + Math.sin(elapsedTime * 20) * 0.35;
    }
  }
}

