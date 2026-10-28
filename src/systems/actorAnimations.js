// Pixar-Style Character & Spacecraft Actor Animation Director
// Manages Rigged SVG/Canvas Character Actors (Asha in Dhaka, Bangladesh & Leo in Florida, USA),
// Dual-Actor Comms Lip-Sync & Emotion States, and 3D Hardware Kinematics

import { martianAudio } from './audio.js';

export const PROLOGUE_SCENES = [
  {
    step: 1,
    tag: "ACT I • ROOFTOP SIGNAL IN DHAKA, BANGLADESH",
    title: "Asha & The Homemade Sky Antenna",
    speaker: "ASHA (Age 12 • Dhaka, Bangladesh)",
    emotion: "curious",
    dialogue: "People call old spacecraft on the Moon and Mars 'Space Junk.' But when I point my homemade copper antenna at the night sky from my rooftop... I don't hear junk. I hear monuments of human curiosity waiting for one last handshake.",
    scienceNote: "Asha's rooftop Software-Defined Radio (SDR) tracks S-Band (2.2 GHz) and X-Band (8.4 GHz) deep-space carrier harmonics."
  },
  {
    step: 2,
    tag: "ACT II • KENNEDY SPACE CENTER COAST, FLORIDA, USA",
    title: "Leo & The Robotics Telemetry Bridge",
    speaker: "LEO (Age 12 • Cape Canaveral, Florida, USA)",
    emotion: "analytical",
    dialogue: "Growing up next to Kennedy Space Center, I watched rockets roar into orbit—and wondered what happened to the brave machines that never came home. When Asha's signal pinged my robotics server halfway across the world, everything clicked!",
    scienceNote: "Leo's telemetry decoder reconstructs NASA Planetary Data System (PDS) memory frames and orbital kinematics."
  },
  {
    step: 3,
    tag: "ACT III • THE DREAM PROJECT: JUNIOR DEEP SPACE NETWORK",
    title: "Two Kids, Two Continents, Four Legendary Relics",
    speaker: "ASHA & LEO (Junior Deep Space Network)",
    emotion: "celebrating",
    dialogue: "Together, we built the 'Junior Deep Space Network'! Our mission: lock onto four legendary NASA pioneers—Apollo 11 on the Moon, Opportunity and InSight on Mars, and Voyager 1 in Deep Space—solve their real physics puzzles, and recover their Final Memory Logs!",
    scienceNote: "4 Flagship Missions: (1) Apollo 11 Delta-V Staging • (2) Oppy APXS Spectroscopy • (3) InSight P/S Wave Seismology • (4) Voyager 1 RTG & 22h Light-Delay."
  }
];

export class ActorAnimationDirector {
  constructor() {
    this.currentPrologueStep = 0;
    this.activeSpeaker = 'asha'; // 'asha' | 'leo' | 'both'
    this.activeEmotion = 'curious'; // 'curious' | 'analytical' | 'emotional' | 'celebrating'
    this.isTalking = false;
    this.typewriterTimer = null;
    this.lipSyncTimer = null;

    // 3D Actor References (registered from main.js)
    this.marsRoverActor = null;
    this.moonRoverActor = null;
    this.apolloLMActor = null;
    this.insightActor = null;
    this.voyagerActor = null;

    this.initPrologueUI();
    this.initCommsHUD();
  }

  register3DActors({ marsRover, moonRover, apolloLM, insightLander, voyager }) {
    this.marsRoverActor = marsRover;
    this.moonRoverActor = moonRover;
    this.apolloLMActor = apolloLM;
    this.insightActor = insightLander;
    this.voyagerActor = voyager;
  }

  // Build Rigged SVG Character Avatar Markup for Asha & Leo
  getAshaRigSVG(prefix = "hud") {
    return `
      <svg class="actor-rig-svg asha-rig" id="${prefix}-asha-svg" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="${prefix}-asha-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#0a1120" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Starry Dhaka Rooftop Halo -->
        <circle cx="70" cy="70" r="64" fill="url(#${prefix}-asha-glow)" />
        <!-- Animated Rooftop Yagi Antenna Silhouette Behind Asha -->
        <g class="actor-antenna-prop">
          <line x1="112" y1="115" x2="112" y2="32" stroke="#38bdf8" stroke-width="2.5" stroke-opacity="0.7"/>
          <line x1="98" y1="44" x2="126" y2="44" stroke="#ffb700" stroke-width="2.5"/>
          <line x1="102" y1="56" x2="122" y2="56" stroke="#ffb700" stroke-width="2"/>
          <circle cx="112" cy="30" r="4" fill="#00e5ff" class="antenna-signal-tip"/>
        </g>
        <!-- Torso & South Asian Teal/Gold Kurta + Scarf -->
        <g class="actor-torso-group">
          <path d="M36 132 C38 102, 102 102, 104 132 Z" fill="#0d9488"/>
          <!-- Flowing Amber Scarf -->
          <path class="actor-scarf" d="M46 106 Q70 118 96 105 Q108 116 116 126" fill="none" stroke="#f59e0b" stroke-width="8" stroke-linecap="round"/>
        </g>
        <!-- Articulated Head Group -->
        <g class="actor-head-group">
          <!-- Wavy Dark Hair -->
          <path d="M36 68 C32 34, 108 34, 104 68 C106 86, 98 98, 92 102 L48 102 C42 98, 34 86, 36 68 Z" fill="#1e1b2e"/>
          <!-- Headphone Band -->
          <path d="M35 64 A36 36 0 0 1 105 64" fill="none" stroke="#00e5ff" stroke-width="5" stroke-linecap="round"/>
          <rect x="29" y="56" width="9" height="20" rx="4" fill="#0284c7" stroke="#00e5ff" stroke-width="1.5"/>
          <rect x="102" y="56" width="9" height="20" rx="4" fill="#0284c7" stroke="#00e5ff" stroke-width="1.5"/>
          <!-- Face -->
          <ellipse cx="70" cy="68" rx="27" ry="29" fill="#d99b72"/>
          <!-- Forehead Bindi / Star Dot -->
          <circle cx="70" cy="49" r="2.2" fill="#fbbf24"/>
          <!-- Expressive Eyebrows -->
          <path class="actor-brow-left" d="M51 54 Q58 50 64 53" fill="none" stroke="#1e1b2e" stroke-width="2.6" stroke-linecap="round"/>
          <path class="actor-brow-right" d="M76 53 Q82 50 89 54" fill="none" stroke="#1e1b2e" stroke-width="2.6" stroke-linecap="round"/>
          <!-- Eyes with Blinking Eyelids & Starlight Catchlights -->
          <g class="actor-eyes">
            <ellipse cx="57" cy="63" rx="5.2" ry="5.8" fill="#1e1b2e"/>
            <circle cx="59" cy="61" r="2.0" fill="#ffffff"/>
            <circle cx="55" cy="65" r="1.0" fill="#00e5ff"/>
            <ellipse cx="83" cy="63" rx="5.2" ry="5.8" fill="#1e1b2e"/>
            <circle cx="85" cy="61" r="2.0" fill="#ffffff"/>
            <circle cx="81" cy="65" r="1.0" fill="#00e5ff"/>
          </g>
          <!-- Warm Cheeks -->
          <ellipse cx="49" cy="72" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.32"/>
          <ellipse cx="91" cy="72" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.32"/>
          <!-- Articulated Mouth (Idle Smile vs Talking Lip-Sync) -->
          <path class="actor-mouth-idle" d="M62 79 Q70 86 78 79" fill="none" stroke="#7c2d12" stroke-width="2.8" stroke-linecap="round"/>
          <ellipse class="actor-mouth-talk" cx="70" cy="81" rx="6.5" ry="4.5" fill="#991b1b" opacity="0"/>
          <!-- Front Hair Bangs -->
          <path d="M42 54 Q56 38 72 44 Q88 38 98 54 Q84 44 70 46 Q56 44 42 54 Z" fill="#1e1b2e"/>
        </g>
        <!-- Articulated Wave / Antenna Tuning Hand -->
        <g class="actor-hand-group">
          <circle cx="106" cy="96" r="7" fill="#d99b72" stroke="#f59e0b" stroke-width="2"/>
        </g>
      </svg>
    `;
  }

  getLeoRigSVG(prefix = "hud") {
    return `
      <svg class="actor-rig-svg leo-rig" id="${prefix}-leo-svg" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="${prefix}-leo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ff5e28" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#0a1120" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Kennedy Space Center Launchpad Halo -->
        <circle cx="70" cy="70" r="64" fill="url(#${prefix}-leo-glow)" />
        <!-- Mini Robotic Rover Arm Prop Behind Leo -->
        <g class="actor-rover-prop">
          <polyline points="24,114 24,78 38,64" fill="none" stroke="#ff5e28" stroke-width="3" stroke-linecap="round"/>
          <circle cx="24" cy="78" r="4" fill="#ffb700"/>
          <circle cx="38" cy="64" r="3.5" fill="#00e5ff"/>
        </g>
        <!-- Torso & NASA KSC Robotics Hoodie -->
        <g class="actor-torso-group">
          <path d="M34 132 C36 100, 104 100, 106 132 Z" fill="#1d4ed8"/>
          <path d="M54 104 L70 120 L86 104" fill="none" stroke="#ff5e28" stroke-width="4" stroke-linecap="round"/>
          <circle cx="84" cy="118" r="5" fill="#00e5ff"/>
        </g>
        <!-- Articulated Head Group -->
        <g class="actor-head-group">
          <!-- Face -->
          <ellipse cx="70" cy="68" rx="27" ry="29" fill="#f3c6a5"/>
          <!-- Tousled Auburn-Brown Hair -->
          <path d="M40 58 C38 32, 102 30, 100 58 C92 44, 78 42, 66 45 C54 42, 46 48, 40 58 Z" fill="#5c3a21"/>
          <!-- Smart Telemetry Glasses Frame -->
          <g class="actor-glasses">
            <rect x="46" y="55" width="20" height="14" rx="4" fill="#00e5ff" fill-opacity="0.12" stroke="#38bdf8" stroke-width="2.2"/>
            <rect x="74" y="55" width="20" height="14" rx="4" fill="#00e5ff" fill-opacity="0.12" stroke="#38bdf8" stroke-width="2.2"/>
            <line x1="66" y1="61" x2="74" y2="61" stroke="#38bdf8" stroke-width="2.2"/>
          </g>
          <!-- Expressive Eyebrows -->
          <path class="actor-brow-left" d="M49 51 Q56 48 63 51" fill="none" stroke="#432818" stroke-width="2.6" stroke-linecap="round"/>
          <path class="actor-brow-right" d="M77 51 Q84 48 91 51" fill="none" stroke="#432818" stroke-width="2.6" stroke-linecap="round"/>
          <!-- Eyes -->
          <g class="actor-eyes">
            <ellipse cx="56" cy="62" rx="4.6" ry="5.2" fill="#1e293b"/>
            <circle cx="58" cy="60" r="1.8" fill="#ffffff"/>
            <ellipse cx="84" cy="62" rx="4.6" ry="5.2" fill="#1e293b"/>
            <circle cx="86" cy="60" r="1.8" fill="#ffffff"/>
          </g>
          <!-- Headset Boom Mic -->
          <path d="M97 68 Q94 83 79 84" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="78" cy="84" r="2.8" fill="#00e5ff"/>
          <!-- Articulated Mouth -->
          <path class="actor-mouth-idle" d="M62 79 Q70 85 78 79" fill="none" stroke="#7c2d12" stroke-width="2.8" stroke-linecap="round"/>
          <ellipse class="actor-mouth-talk" cx="70" cy="81" rx="6.2" ry="4.2" fill="#991b1b" opacity="0"/>
        </g>
        <!-- Articulated Robotics Coding Hand -->
        <g class="actor-hand-group">
          <circle cx="34" cy="96" r="7" fill="#f3c6a5" stroke="#38bdf8" stroke-width="2"/>
        </g>
      </svg>
    `;
  }

  initPrologueUI() {
    const ashaStage = document.getElementById('prologue-asha-rig-box');
    const leoStage = document.getElementById('prologue-leo-rig-box');
    if (ashaStage) ashaStage.innerHTML = this.getAshaRigSVG('prologue');
    if (leoStage) leoStage.innerHTML = this.getLeoRigSVG('prologue');

    document.getElementById('btn-open-prologue')?.addEventListener('click', () => {
      this.openPrologue();
    });
    document.getElementById('prologue-next-btn')?.addEventListener('click', () => {
      this.nextPrologueStep();
    });
    document.getElementById('prologue-skip-btn')?.addEventListener('click', () => {
      this.closePrologue();
    });
  }

  initCommsHUD() {
    const ashaAvatarBox = document.getElementById('comms-asha-avatar');
    const leoAvatarBox = document.getElementById('comms-leo-avatar');
    if (ashaAvatarBox) ashaAvatarBox.innerHTML = this.getAshaRigSVG('comms');
    if (leoAvatarBox) leoAvatarBox.innerHTML = this.getLeoRigSVG('comms');
  }

  openPrologue() {
    this.currentPrologueStep = 0;
    const modal = document.getElementById('prologue-modal-backdrop');
    if (modal) {
      modal.classList.add('active');
      this.renderPrologueStep();
    }
  }

  closePrologue() {
    const modal = document.getElementById('prologue-modal-backdrop');
    if (modal) modal.classList.remove('active');
  }

  nextPrologueStep() {
    if (this.currentPrologueStep < PROLOGUE_SCENES.length - 1) {
      this.currentPrologueStep++;
      this.renderPrologueStep();
    } else {
      this.closePrologue();
    }
  }

  renderPrologueStep() {
    const scene = PROLOGUE_SCENES[this.currentPrologueStep];
    if (!scene) return;

    const tagEl = document.getElementById('prologue-step-tag');
    const titleEl = document.getElementById('prologue-step-title');
    const speakerEl = document.getElementById('prologue-speaker-name');
    const textEl = document.getElementById('prologue-dialogue-text');
    const noteEl = document.getElementById('prologue-science-note');
    const nextBtn = document.getElementById('prologue-next-btn');

    const ashaCard = document.getElementById('prologue-actor-asha');
    const leoCard = document.getElementById('prologue-actor-leo');

    if (tagEl) tagEl.innerText = scene.tag;
    if (titleEl) titleEl.innerText = scene.title;
    if (speakerEl) speakerEl.innerText = scene.speaker;
    if ( textEl ) textEl.innerText = `"${scene.dialogue}"`;
    if (noteEl) noteEl.innerText = `🔬 JPL Science Link: ${scene.scienceNote}`;

    if (nextBtn) {
      nextBtn.innerText = this.currentPrologueStep === PROLOGUE_SCENES.length - 1
        ? "START THE LAST HANDSHAKE ➔"
        : "NEXT SCENE ➔";
    }

    // Highlight active speaker rig in prologue
    if (ashaCard && leoCard) {
      const isAsha = this.currentPrologueStep === 0 || this.currentPrologueStep === 2;
      const isLeo = this.currentPrologueStep === 1 || this.currentPrologueStep === 2;
      ashaCard.classList.toggle('speaking', isAsha);
      leoCard.classList.toggle('speaking', isLeo);
    }

    martianAudio.playVoiceCadence(this.currentPrologueStep === 1 ? 'leo' : 'asha');
  }

  // Trigger Live Dual-Actor Comms Dialogue with Lip-Sync & Emotion Pose
  triggerCommsDialogue({
    speaker = 'asha', // 'asha' | 'leo' | 'both'
    emotion = 'curious', // 'curious' | 'analytical' | 'emotional' | 'celebrating'
    title = "ASHA • DHAKA ROOFTOP ANTENNA",
    text = "",
    missionId = null
  }) {
    this.activeSpeaker = speaker;
    this.activeEmotion = emotion;

    const widget = document.getElementById('companion-bot-widget');
    const bubble = document.getElementById('bot-speech-bubble');
    const labelEl = document.getElementById('bot-name-label');
    const textEl = document.getElementById('bot-speech-text');
    const emotionBadge = document.getElementById('comms-emotion-badge');
    const actionBtn = document.getElementById('comms-minigame-btn');

    if (bubble) bubble.classList.add('visible');
    if (widget) {
      widget.dataset.speaker = speaker;
      widget.dataset.emotion = emotion;
    }

    if (labelEl) labelEl.innerText = title;
    if (emotionBadge) {
      const emotionLabels = {
        curious: "✨ CURIOUS SIGNAL",
        analytical: "🔬 JPL TELEMETRY",
        emotional: "💛 HEARTFELT MEMORY",
        celebrating: "🎉 EUREKA MOMENT!"
      };
      emotionBadge.innerText = emotionLabels[emotion] || "📡 LIVE LINK";
    }

    if (actionBtn) {
      if (missionId) {
        actionBtn.style.display = 'inline-flex';
        actionBtn.dataset.missionId = missionId;
      } else {
        actionBtn.style.display = 'none';
      }
    }

    // Typewriter + Lip-Sync Animation
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    if (this.lipSyncTimer) clearTimeout(this.lipSyncTimer);

    if (textEl) {
      textEl.innerText = "";
      let idx = 0;
      widget?.classList.add('actor-talking');
      martianAudio.playVoiceCadence(speaker === 'leo' ? 'leo' : 'asha');

      this.typewriterTimer = setInterval(() => {
        idx += 2;
        textEl.innerText = text.slice(0, idx);
        if (idx >= text.length) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
          widget?.classList.remove('actor-talking');
        }
      }, 18);
    }
  }

  // Update all 3D spacecraft and rover actors every frame
  update(delta, elapsedTime, currentPlanet, currentTau) {
    if (currentPlanet === 'mars') {
      if (this.marsRoverActor?.update) {
        this.marsRoverActor.update(delta, elapsedTime, currentTau);
      }
      if (this.insightActor?.update) {
        this.insightActor.update(delta, elapsedTime);
      }
    } else if (currentPlanet === 'moon') {
      if (this.moonRoverActor?.update) {
        this.moonRoverActor.update(delta, elapsedTime);
      }
      if (this.apolloLMActor?.update) {
        this.apolloLMActor.update(delta, elapsedTime);
      }
    } else if (currentPlanet === 'deepspace') {
      if (this.voyagerActor?.update) {
        this.voyagerActor.update(delta, elapsedTime);
      }
    }
  }
}

