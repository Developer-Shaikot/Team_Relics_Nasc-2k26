import { martianAudio } from './audio.js';

export class SpaceshipHabManager {
  constructor(onLaunchCallback) {
    this.onLaunch = onLaunchCallback;
    this.selectedCommander = 'asha';
    this.hasReadFiles = false;
    this.hasViewedMap = false;
    this.hasSuitedUp = false;
    this.guideRobotName = 'ASTRO-BOT';
    this.guideRobotColor = '#00e5ff';

    this.screen = document.getElementById('spaceship-hab-screen');
    this.bindEvents();
  }

  setCommander(commander, robotConfig) {
    this.selectedCommander = commander || 'asha';
    if (robotConfig) {
      this.guideRobotName = robotConfig.name || 'ASTRO-BOT';
      this.guideRobotColor = robotConfig.color || '#00e5ff';
    }
    this.updateHabCharacterVisuals();
  }

  open() {
    if (this.screen) {
      this.screen.classList.add('active');
    }
    this.updateHabCharacterVisuals();
    martianAudio.playUiSwitch();
  }

  close() {
    if (this.screen) {
      this.screen.classList.remove('active');
    }
  }

  updateHabCharacterVisuals() {
    const nameEl = document.getElementById('hab-character-name');
    const roleEl = document.getElementById('hab-character-role');
    const suitBtn = document.getElementById('btn-suit-up');
    const avatarPod = document.getElementById('hab-char-avatar-pod');

    if (nameEl) {
      nameEl.innerText = this.selectedCommander === 'asha' ? 'ASHA (DHAKA)' : 'LEO (FLORIDA)';
    }
    if (roleEl) {
      roleEl.innerText = this.selectedCommander === 'asha' ? 'ASTROPHYSICIST & RF HACKER' : 'ROBOTICS ENGINEER & ROVER PILOT';
    }

    if (avatarPod) {
      if (this.hasSuitedUp) {
        avatarPod.innerHTML = `
          <div class="suited-astronaut-avatar ${this.selectedCommander}-suit">
            <div class="helmet-visor-glow"></div>
            <div class="suit-patch">${this.selectedCommander === 'asha' ? '🇧🇩' : '🇺🇸'}</div>
            <div class="suit-icon">👨‍🚀</div>
          </div>
        `;
      } else {
        avatarPod.innerHTML = `
          <div class="civilian-avatar ${this.selectedCommander}-civilian">
            <div class="char-icon">${this.selectedCommander === 'asha' ? '👩‍🔬' : '👨‍💻'}</div>
          </div>
        `;
      }
    }

    if (suitBtn) {
      suitBtn.innerHTML = this.hasSuitedUp 
        ? '<span>✓ SUITED UP FOR EVA FLIGHT</span>' 
        : '<span>👨‍🚀 EQUIP NASA EVA SPACESUIT</span>';
      suitBtn.classList.toggle('suited', this.hasSuitedUp);
    }
  }

  bindEvents() {
    // 1. Files & Dossiers Station
    const dossierModal = document.getElementById('hab-dossier-modal');
    document.getElementById('hab-station-files')?.addEventListener('click', () => {
      this.hasReadFiles = true;
      document.getElementById('hab-station-files')?.classList.add('inspected');
      if (dossierModal) dossierModal.classList.add('active');
      martianAudio.playScannerBeep(false);
    });
    document.getElementById('hab-dossier-close')?.addEventListener('click', () => {
      if (dossierModal) dossierModal.classList.remove('active');
    });

    // 2. Star Map Station
    const mapModal = document.getElementById('hab-starmap-modal');
    document.getElementById('hab-station-map')?.addEventListener('click', () => {
      this.hasViewedMap = true;
      document.getElementById('hab-station-map')?.classList.add('inspected');
      if (mapModal) mapModal.classList.add('active');
      martianAudio.playScannerBeep(false);
    });
    document.getElementById('hab-starmap-close')?.addEventListener('click', () => {
      if (mapModal) mapModal.classList.remove('active');
    });

    // 3. EVA Suit Up Action
    document.getElementById('btn-suit-up')?.addEventListener('click', () => {
      if (this.hasSuitedUp) return;
      this.hasSuitedUp = true;
      martianAudio.playScannerBeep(true);
      this.updateHabCharacterVisuals();

      // Trigger Guide Robot Arrival sequence
      setTimeout(() => {
        this.triggerGuideRobotArrival();
      }, 500);
    });

    // 4. Ride Launch Buttons
    document.getElementById('hab-launch-moon')?.addEventListener('click', () => {
      martianAudio.playRocketIgnition(1.5);
      this.close();
      if (this.onLaunch) this.onLaunch('moon', this.selectedCommander);
    });

    document.getElementById('hab-launch-mars')?.addEventListener('click', () => {
      martianAudio.playRocketIgnition(1.5);
      this.close();
      if (this.onLaunch) this.onLaunch('mars', this.selectedCommander);
    });

    // Return to Hub button
    document.getElementById('hab-return-hub-btn')?.addEventListener('click', () => {
      this.close();
      document.getElementById('game-hub-screen')?.classList.add('active');
    });
  }

  triggerGuideRobotArrival() {
    const arrivalBanner = document.getElementById('hab-robot-arrival-banner');
    const speechText = document.getElementById('hab-robot-speech');
    const robotAvatar = document.getElementById('hab-robot-avatar-mini');

    if (robotAvatar) {
      robotAvatar.style.background = this.guideRobotColor;
      robotAvatar.style.boxShadow = `0 0 12px ${this.guideRobotColor}`;
    }

    if (speechText) {
      speechText.innerText = `"${this.guideRobotName}: Commander ${this.selectedCommander === 'asha' ? 'Asha' : 'Leo'}! Your ride is ready, let's go for exploration!"`;
    }

    if (arrivalBanner) {
      arrivalBanner.classList.add('visible');
    }

    martianAudio.playScannerBeep(true);
  }
}

