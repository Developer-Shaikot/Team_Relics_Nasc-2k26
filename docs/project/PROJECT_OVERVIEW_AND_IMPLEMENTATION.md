# 🔴 Relics of the Cosmic Dust: Project Idea & Implementation Blueprint
### *NASA International Space Apps Challenge 2026 — Theme: The Next Frontier*
**Challenge:** *Abandoned but Not Forgotten: Storytelling About NASA’s Discarded Equipment on the Moon and Mars*  
**Team:** *TEAM RELICS*

---

## 🌌 1. Executive Summary & Vision

**Relics of the Cosmic Dust: The Last Transmission** (also known as *Relics of the Red Dust*) is an immersive, educational, and scientifically rigorous 3D WebGL web platform built for the **NASA International Space Apps Challenge 2026**.

Decades of planetary exploration have left historic probes, rovers, and landers across the Moon, Mars, and Deep Space. In standard government archives, this hardware is often classified as "discarded equipment" or dismissed as "space junk." **Relics of the Cosmic Dust** reframes these machines into **monuments of human curiosity, scientific grit, and engineering triumph**.

By coupling authentic **NASA Planetary Data System (PDS)** telemetry, **MRO HiRISE** digital elevation models, and **LRO LOLA** heightmaps with an interactive WebGL 3D simulator, players step into the shoes of planetary archaeologists to drive historical rovers, perform diagnostic scans, solve genuine astrophysics challenges, and recover the final memory logs of humanity's greatest pioneers.

---

## 📖 2. Narrative Framing: The Junior Deep Space Network (JDSN)

The application bridges classroom storytelling with real-world international collaboration through two 12-year-old youth researchers:

```
    [ ASHA ] (Age 12 • Dhaka, Bangladesh)         [ LEO ] (Age 12 • Cape Canaveral, FL, USA)
    Astrophysicist & Amateur RF Hacker            Robotics Engineer & Rover Pilot
    Tracks S-Band (2.2 GHz) / X-Band (8.4 GHz)    Decodes NASA PDS telemetry & orbital frames
               │                                              │
               └──────────────────────┬───────────────────────┘
                                      ▼
                  [ JUNIOR DEEP SPACE NETWORK (JDSN) ]
                   Companion Drone: ASTRO-BOT (AI Guide)
                                      ▼
               4 Flagship Missions Across the Solar System:
           Moon (Apollo 11) ➔ Mars (Oppy) ➔ Mars (InSight) ➔ Deep Space (Voyager 1)
```

1. **Asha (Dhaka, Bangladesh)**: Points a homemade rooftop Yagi copper antenna at the night sky. She listens for deep-space carrier harmonics, proving that space exploration is accessible to curious youth anywhere in the world.
2. **Leo (Cape Canaveral, Florida, USA)**: Grew up next to Kennedy Space Center watching rocket launches, specializing in telemetry decoding and robotics kinematics.
3. **ASTRO-BOT Companion**: A customized AI guide drone that hovers beside the player in 3D space, delivering historical context, mission briefings, and guidance.

---

## 🪐 3. Implemented Celestial Worlds & 3D Environments

The simulator features dynamic switching between **three distinct celestial destinations** in real time:

```
                          [ 3D Solar System Orrery / Hub ]
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
   🔴 MARS                          🌕 MOON                       🌌 DEEP SPACE
   • MER-B Opportunity              • Apollo 11 LM Descent Stage  • Voyager 1 Probe
   • InSight Lander                 • Lunar Roving Vehicle (LRV)  • Golden Record Player
   • Perseverance Valley            • Sea of Tranquility          • Interstellar Medium
   • Sol 5111 Dust Storm            • Surveyor 1 & 3 Soft Landers • 22h 34m Light Delay
```

### 🔴 Environment 1: Mars (Perseverance Valley & Elysium Planitia)
* **Location Coordinates**: Lat: $14.5714^\circ\text{ S}$, Lon: $354.6734^\circ\text{ E}$, Elevation: $-1,540\text{ m}$ (Endeavour Crater).
* **Topography**: Generated from **NASA MRO HiRISE** Digital Terrain Models (DTMs) with realistic bedrock and scree slopes.
* **Opportunity (MER-B) Rover**: Detailed 3D procedural model featuring an authentic 6-wheel rocker-bogie chassis with steerable corner bogies.
* **InSight Lander Actor**: Positioned across the plain featuring the domed SEIS seismometer.
* **Sol 5111 Global Dust Storm Re-enactment**:
  * Real-time calculation of atmospheric opacity ($\tau$ increasing from $0.8$ to $10.8$).
  * Dynamic solar irradiance reduction calculated via the Beer-Lambert law:
    $$I = I_0 \cdot \exp\left(-\frac{\tau}{\cos\theta}\right)$$
  * Solar power generation collapses from nominal $900\text{ Wh/sol}$ down to critical cutoff ($< 22\text{ Wh/sol}$), triggering the fatal $< 20.5\text{V}$ battery bus shutdown.

### 🌕 Environment 2: The Moon (Mare Tranquillitatis & Oceanus Procellarum)
* **Location Coordinates**: Lat: $0.6741^\circ\text{ N}$, Lon: $23.4730^\circ\text{ E}$ (Apollo 11 Eagle Landing Zone).
* **Topography**: 16-bit **NASA LRO LOLA (Lunar Orbiter Laser Altimeter)** elevation grids rendering low-relief impact craters and lunar regolith.
* **Apollo 11 Eagle Descent Stage**: The authentic two-stage lunar module's golden base preserved as a historical monument.
* **Surveyor 1 & Surveyor 3 Landers**: America's first soft-landers that proved lunar soil could support human bootprints.
* **Physics Simulation**: Lunar gravity ($1.62\text{ m/s}^2$ / $1/6\text{th } g$), hard vacuum atmosphere ($0\text{ atm}$), and $1.28\text{-second}$ one-way S-band telemetry delay.

### 🌌 Environment 3: Deep Space (Interstellar Medium at 163 AU / 24.3 Billion km)
* **Coordinates**: Constellation Ophiuchus, moving at $17.0\text{ km/s}$ beyond the Heliosphere.
* **Voyager 1 3D Craft**: High-precision CAD representation with a 3.7-meter High-Gain dish, 13-meter Magnetometer boom, and Plutonium-238 RTG bay.
* **The 12-inch Golden Record Player**: Complete audio-visual player featuring human greetings in **55 languages** (including Bengali, English, Spanish, Arabic, Mandarin, Japanese), whale songs, and Chuck Berry's music.
* **Physics & Telemetry**:
  * Simulated **22-hour 34-minute one-way light travel delay** ($45\text{h } 08\text{m}$ round-trip handshake).
  * Pu-238 radioactive half-life thermal decay ($-4.0\text{ W/year}$ power drop).

---

## 🔬 4. The 4 Flagship JPL Science Mini-Game Labs

Implemented in `src/systems/minigames.js`, these interactive workbenches let students solve authentic aerospace and planetary science problems:

### Mission 1 (Moon): "The Staging Sacrifice" — Rocket Equation Lab
* **Question**: *Why did Neil Armstrong and Buzz Aldrin leave the golden Descent Stage behind on the Moon?*
* **Interactive Mechanic**: Players adjust fuel mass ($1,450\text{ kg}$) and scientific rock samples ($21.5\text{ kg}$), testing the rocket burn with and without staging separation.
* **Authentic Physics Formula**: Tsiolkovsky Rocket Equation:
  $$\Delta v = I_{\text{sp}} \cdot g_0 \cdot \ln\left(\frac{m_0}{m_f}\right) \ge 1,870\text{ m/s}$$
* **Learning Takeaway**: Leaving the $2,150\text{ kg}$ dry descent stage behind was mathematically mandatory to achieve the escape velocity needed to rejoin Michael Collins in lunar orbit.

### Mission 2 (Mars): "The Blueberries of Life" — APXS Spectroscopy Lab
* **Question**: *How did Opportunity prove liquid water once flowed across the red deserts of Mars?*
* **Interactive Mechanic**: Students manipulate energy calibration sliders (shift and peak gain) on Opportunity’s Alpha Particle X-Ray Spectrometer (APXS) to align sensor readings against reference emission lines for Hematite ($\alpha\text{-Fe}_2\text{O}_3$).
* **Scientific Discovery**: Identification of spherical hematite "blueberries" that only precipitate in standing liquid water lakes.

### Mission 3 (Mars): "Listening to the Heart of Mars" — Seismology Lab
* **Question**: *How did the InSight lander probe the internal structure of Mars without drilling?*
* **Interactive Mechanic**: Students analyze a real Martian seismogram from the SEIS instrument, aligning wave-arrival cursors for primary ($P$-waves) and secondary ($S$-waves) generated by a Marsquake.
* **Authentic Physics Formula**: Wadati Travel-Time Differential:
  $$d = \frac{t_S - t_P}{\left(\frac{1}{v_S} - \frac{1}{v_P}\right)}$$
* **Scientific Discovery**: Revealed that Mars possesses a large liquid metallic core with a radius of approximately $1,830\text{ km}$.

### Mission 4 (Deep Space): "The Dying Candle & The Golden Record" — Power Budget Lab
* **Question**: *How has Voyager 1 survived in interstellar space for over 48 years?*
* **Interactive Mechanic**: Players manage a strictly limited $249\text{W}$ RTG electrical budget by turning off dormant subsystems (ISS camera: $28\text{W}$, scan platform heater: $24\text{W}$) while keeping primary instruments powered (magnetometer: $14\text{W}$, plasma waves: $18\text{W}$, high-gain transmitter: $178\text{W}$).
* **Reward**: Transmit across the 22-hour light delay to unlock and spin the Golden Record.

---

## 🎮 5. Implemented Core Technical Systems

### 1. Cyberpunk Game Hub & 3D Interactive Orrery (`hero3DOrrery.js`)
* Central control dashboard tracking Cadet Rank, Level Progress, Cosmic Dust currency, and Telemetry Gems.
* Interactive Three.js 3D Solar System Orrery with procedural spherical textures, atmospheric Rayleigh scattering, drag-to-orbit physics, and click-to-focus planet navigation.

### 2. Spaceship Hab & Character Customization (`spaceshipHab.js`)
* Commander selection between **Asha (Dhaka)** and **Leo (Florida)**.
* Interactive suit-up animation sequence, mission dossier review, starmap display, and companion ASTRO-BOT customization.

### 3. Rover Driving Physics & Camera Controller (`roverControls.js`)
* Real-time keyboard navigation (WASD / Arrows).
* Terrain height evaluation ensuring wheels stay grounded to procedural elevation grids.
* Dynamic wheel rotation, steering angle calculations, and dust particle kick-up.
* Multiple camera perspectives: Free Orbit, Cockpit First-Person Perspective (FPP), and Cinematic Chase Cam.

### 4. Planetary LiDAR Subsystem Scanner (`scanner.js`)
* Raycasting engine detecting clicks or taps on 3D spacecraft hardware.
* Highlights interactive payloads: Pancam, Mini-TES, Mössbauer, RAT grinder, Solar Panels, and Blackbox Core.
* Displays modal dossiers with NASA technical specs, historical discoveries, and direct links to corresponding JPL labs.

### 5. Rigged Character Story Engine (`actorAnimations.js`)
* Pixar-style rigged SVG vector characters for Asha and Leo.
* Dynamic lip-sync animations synchronized to typewriter speech bubbles.
* Four distinct emotional states: *curious*, *analytical*, *emotional*, and *celebrating*.
* 3-Act interactive prologue establishing the JDSN origin story.

### 6. Gamification, Collectibles & Certification (`quests.js`, `coinsManager.js`)
* 6-tier S-Curve mission progression roadmap.
* Collectible 3D **Cosmic Coins** scattered across the terrain that trigger audio chimes and particle bursts.
* Floating guide bot **ASTRO-BOT** escorting the player across the terrain.
* Generates a printable/downloadable **"Master Planetary Archaeologist" Certificate of Completion**.

### 7. Auxiliary Educational Modules
* **Space Calendar (`spaceCalendar.js`)**: Interactive timeline highlighting historical NASA milestone dates and Sol logs.
* **Missions Archive (`missionNewsCarousel.js`)**: Comprehensive encyclopedic catalog of NASA Moon & Mars missions from Pioneer 4 up to Artemis.
* **Cadet Quiz & Leaderboard (`quizLeaderboard.js`)**: Multi-level quiz challenges testing planetary geology, physics, and mission history with XP rewards and leaderboard tracking.

### 8. Web Audio API Procedural Sound Synthesizer (`audio.js`)
* **100% zero-asset, procedural audio engine** running directly in the browser:
  * Martian wind generated via filtered Brown noise with fluctuating LFO bandpass filters.
  * Lunar vacuum drone using low-frequency sine waves.
  * Mechanical rover servo motor whirrs and wheel articulation pitch shifts.
  * Holographic LiDAR sweep chimes, radio static, and telemetry beeps.

### 9. 120-Second Pitch Showcase Mode (`pitchMode.js`)
* Automated cinematic camera director that sweeps through all key environments, hardware scans, and science labs for rapid evaluation by judges, educators, and exhibition audiences.

### 10. Bilingual Localization (English & Bengali)
* Built-in support for both **English** and **বাংলা (Bengali)** across all mission briefs, quiz questions, and historical fact archives, reflecting the Dhaka-Florida team collaboration.

---

## 📂 6. Repository Architecture & File Directory

```
Relics of the cosmic dust/
├── index.html                   # Master UI layout: Game Hub, Hab, HUD, and Modals
├── style.css                    # Glassmorphism & Cyberpunk Design System (176 KB)
├── package.json                 # Dependencies: three (v0.170.0), canvas-confetti, vite
├── vite.config.js               # Dev server & build configuration
│
├── src/
│   ├── main.js                  # Master application orchestrator & lifecycle manager
│   │
│   ├── renderer/                # WebGL 3D Rendering Engine (Three.js)
│   │   ├── scene.js             # Scene, camera, lighting & smooth flyTo animator
│   │   ├── terrain.js           # Martian elevation & Perseverance Valley mesh
│   │   ├── atmosphere.js        # Dynamic Martian sky & dust storm shaders
│   │   ├── rover.js             # Opportunity (MER-B) rover geometry & kinematics
│   │   ├── moonTerrain.js       # Lunar regolith surface & Apollo 11 LM actor
│   │   ├── moonAtmosphere.js    # Lunar vacuum sky & starfield
│   │   ├── lunarRover.js        # 3D Lunar Roving Vehicle (LRV) model
│   │   └── deepSpaceVoyager.js  # Voyager 1 model & Interstellar particle void
│   │
│   ├── systems/                 # Core Simulation & Game Logic
│   │   ├── hero3DOrrery.js      # Interactive 3D Solar System Orrery for the Hub
│   │   ├── minigames.js         # 4 JPL Science Labs (Apollo 11, Oppy, InSight, Voyager)
│   │   ├── actorAnimations.js   # Rigged SVG character actors (Asha & Leo) & prologue
│   │   ├── roverControls.js     # Driving physics & camera modes (FPP / Orbit)
│   │   ├── scanner.js           # LiDAR raycaster & subsystem diagnostic modals
│   │   ├── quests.js            # S-Curve roadmap, XP progression, and badge logic
│   │   ├── coinsManager.js      # Collectible 3D Cosmic Coins on terrain
│   │   ├── guideBotEscort.js    # Flying ASTRO-BOT companion drone
│   │   ├── spaceshipHab.js      # Commander station, suit-up room & star map
│   │   ├── audio.js             # Web Audio API procedural sound synthesizer
│   │   ├── spaceCalendar.js     # Historical timeline & calendar milestones
│   │   ├── missionNewsCarousel.js # Full NASA Moon & Mars missions catalog
│   │   ├── quizLeaderboard.js   # Gamified quizzes & high-score leaderboard
│   │   ├── sol5111.js           # Sol 5111 dust storm timeline sequencer
│   │   └── pitchMode.js         # Automated cinematic camera pitch showcase
│   │
│   └── data/                    # NASA Datasets & Content
│       ├── telemetryData.js     # PDS telemetry, Sol 1–5111 logs, payload specs
│       ├── missionsDatabase.js  # Bilingual NASA mission history (Moon & Mars)
│       └── kidsContent.js       # Quests, badge definitions, quizzes & fun facts
│
└── docs/project/                # Complete SWE Specifications & Blueprint
    ├── 01_PROJECT_OVERVIEW_AND_SRS.md
    ├── 02_SYSTEM_ARCHITECTURE_AND_DESIGN.md
    ├── 03_API_AND_DATA_SPECIFICATIONS.md
    ├── 04_NASA_SPACE_APPS_WINNING_STRATEGY_ALIGNMENT.md
    ├── 05_DEPLOYMENT_AND_MAINTENANCE_GUIDE.md
    └── 06_OFFICIAL_PRODUCTION_BLUEPRINT_AND_VIDEO_SCRIPT.md
```

---

## 🚀 7. Quick Start & Execution

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* [npm](https://www.npmjs.com/) (bundled with Node.js)
* Any modern web browser supporting WebGL2 (Chrome, Edge, Firefox, Safari)

### Run Locally
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```
Open `http://localhost:3000/` in your browser.

### Production Build
```bash
# Generate optimized static bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 👥 8. Team Relics & Credits

| Member | Role | Primary Responsibilities |
| :--- | :--- | :--- |
| **Shaikot Kundu Akash** | **Team Lead** | Project management, system architecture, lead voiceover, repository oversight |
| **Md. Wahiduzzaman Nayem** | **System Analyst & Video Editor** | Video pacing, motion graphics, audio sync, educational narrative |
| **Arni Debnath** | **Lead Designer** | Glassmorphism design system, UI/UX wireframing, infographics, certificates |
| **Tanjir Ahmed Fardin** | **Researcher & Storyteller** | NASA PDS & literature research, dialogue design, bilingual data curation |
| **Tareq Jamil Sarkar Samrat** | **Frontend & Mechanics Developer**| Three.js 3D physics engine, rover kinematics, Sol 5111 shaders, STEM quizzes |

---

## 📚 9. Verified NASA Open Data Citations

1. **NASA Planetary Data System (PDS) Geosciences Node**: MER-B Atmospheric Opacity & Telemetry Archive ([pds-geosciences.wustl.edu](https://pds-geosciences.wustl.edu/missions/mer/))
2. **NASA Mars Reconnaissance Orbiter (MRO) HiRISE**: Perseverance Valley Elevation DTMs ([uahirise.org](https://www.uahirise.org/))
3. **NASA Lunar Reconnaissance Orbiter (LRO) LOLA**: High-precision lunar altimetry grids ([pds.nasa.gov](https://pds.nasa.gov/))
4. **NASA 3D Resources & JPL Hardware Archives**: Surveyor 1, Apollo Lunar Module, and Opportunity CAD geometry ([nasa3d.arc.nasa.gov](https://nasa3d.arc.nasa.gov/))
5. **NASA JPL Mission Operations**: Opportunity Sol 1 to 5111 End-of-Mission Telemetry Logs ([mars.nasa.gov/mer/](https://mars.nasa.gov/mer/))

