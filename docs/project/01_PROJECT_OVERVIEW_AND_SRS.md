# 📋 01. PROJECT OVERVIEW & SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## 1. Executive Summary & Problem Domain

### 1.1 Context
In June 2018 (Martian Sol 5111), an unprecedented global dust storm encircled Mars. The atmospheric optical depth ($\tau$) skyrocketed to a record-shattering **10.8**, extinguishing **99.998%** of all incoming sunlight. NASA's solar-powered Mars Exploration Rover **Opportunity (MER-B)**, designed originally for a 90-sol mission, suffered a catastrophic power collapse, dropping from a nominal 900 Wh/sol to less than 22 Wh/sol. Its final decoded telemetry transmission gave rise to the historic sentiment: *"My battery is low and it's getting dark."*

### 1.2 Problem Statement
Complex planetary science datasets—such as raw NASA Planetary Data System (PDS) atmospheric optical depth measurements, spectral signatures from Mössbauer spectrometers, thermal emission records from Mini-TES, and HiRISE Digital Elevation Models (DEM)—are typically locked in raw ASCII tables and academic papers. Students, youth, and the global public lack an intuitive, interactive, and emotional vehicle to grasp:
1. The extreme physical realities of Martian weather.
2. The engineering marvel of Opportunity’s 15-year survival (5,111 sols vs. 90 planned).
3. The direct geological proofs of ancient liquid water (Hematite blueberries, Jarosite, and RAT grinding).

### 1.3 Proposed Solution: "Planetary Archaeology 2085"
**"Relics of the Red Dust: The Last Transmission"** places the user in the role of a **Planetary Archaeologist in the year 2085**, arriving at Perseverance Valley on Mars. Using high-tech holographic LiDAR scanning, physical atmospheric optical depth sliders, and a gamified S-curve expedition roadmap, the user rediscovers, diagnoses, and uncovers Opportunity’s scientific legacy.

---

## 2. Stakeholders & User Personas

| Persona | Description | Key Motivations / Goals |
| :--- | :--- | :--- |
| **Youth Explorer (Ages 8–16)** | Space cadets and school students exploring Mars for the first time. | Interactive gamified missions, badges, quizzes, driving rovers, listening to synthesized robotic audio, and earning certificates. |
| **STEM Educator / Parent** | Teachers wanting high-impact interactive science demonstrations. | Clear explanations of Beer-Lambert Law, atmospheric opacity ($\tau$), geological mineralogy, and bilingual accessibility (English/Bengali). |
| **Space Apps Evaluator / Scientist** | NASA Hackathon judges assessing scientific validity and technological excellence. | Verifiable NASA PDS data alignment, procedural Three.js performance, 120s pitch showcase, and storytelling depth. |

---

## 3. Functional Requirements (FR)

### FR-01: Game Hub & Launchpad Interface
- **FR-01.1**: The application shall present a futuristic Game Hub on initial launch displaying player profile (rank, XP, level), in-game resources (Solar Dust, Martian Gems, Power), quick-access science logs, and game mode cards.
- **FR-01.2**: The user shall be able to transition seamlessly between the Game Hub and the real-time 3D simulation with a dedicated `🏠 Hub` button in both states.

### FR-02: 3D Interactive WebGL Environment
- **FR-02.1**: The system shall render a 3D Martian terrain using procedural HiRISE Digital Elevation Model (DEM) algorithms with multi-octave Perlin/simplex heightmaps and crater generation.
- **FR-02.2**: The system shall render a multi-subsystem 3D model of Opportunity Rover including the rocker-bogie 6-wheel suspension, solar array, camera mast (Pancam/Navcam), robotic arm (IDD), RAT drill, and Mössbauer spectrometer.
- **FR-02.3**: The camera system shall provide Orbit, Pancam Eye, Ground View, and HiRISE Top-down camera presets.

### FR-03: Atmospheric Optical Extinction Simulation (Sol 5111)
- **FR-03.1**: The system shall allow users to manipulate atmospheric optical depth ($\tau$) from 0.5 (clear sky) to 10.8 (record Sol 5111 dust storm).
- **FR-03.2**: Solar array power generation shall dynamically extrapolate according to the Beer-Lambert extinction law: $P(\tau) = P_0 \cdot e^{-\tau / k}$, adjusting battery voltage down to the 20.5V sleep cutoff.
- **FR-03.3**: Sky fog, Rayleigh scattering colors, sun disc visibility, and procedural dust accumulation on rover solar panels shall dynamically adjust with $\tau$.

### FR-04: Planetary LiDAR Scanner & Diagnostic Tool
- **FR-04.1**: Raycasting reticle shall highlight rover subsystems and ground artifacts on hover/touch.
- **FR-04.2**: Clicking a subsystem shall trigger diagnostic telemetry modals displaying instrument abbreviation, discovery history, wavelength range, and geological significance.

### FR-05: S-Curve Mission Expedition Roadmap
- **FR-05.1**: The system shall render an interactive S-curve winding celestial roadmap containing 8 milestone stations (Start, Level 1 through Level 6, and Master Certificate).
- **FR-05.2**: Stations shall reflect real-time status (`🔒 Locked`, `▶ Active`, `✓ Completed`) with animated glowing domes, level tags, and floating animations.
- **FR-05.3**: Clicking any node shall display the Mission HUD card with objectives, hints, badges, and direct teleport/scan action triggers.

### FR-06: 120-Second Pitch Showcase Mode
- **FR-06.1**: A cinematic automated camera director shall orchestrate a 2-minute award-winning pitch across 4 distinct acts (Act I: Landing to Act IV: 2085 Rediscovery) with synchronized subtitles and progress bars.

### FR-07: Bilingual Localization (EN / BN)
- **FR-07.1**: Instant, zero-reload bilingual switching between English and Bengali across all UI elements, mission briefs, quiz questions, and telemetry logs.

---

## 4. Non-Functional Requirements (NFR)

### NFR-01: Performance & Frame Budget
- **Target Frame Rate**: Sustained 60 FPS on modern desktop GPUs and minimum 45 FPS on mobile devices.
- **Bundle Size**: Initial gzipped JS bundle under 180 KB for instant load time.
- **Cold Start**: Time to Interactive (TTI) under 1.5 seconds.

### NFR-02: Usability & Glassmorphism Aesthetics
- The UI shall adhere to a modern dark-space glassmorphic aesthetic (`backdrop-filter: blur()`, glowing borders, curated HSL color tokens, Orbitron & Outfit typography).
- Zero external CSS bloat; pure vanilla CSS3 design system.

### NFR-03: Cross-Platform & Device Support
- Responsive layout adapting cleanly from 360px mobile viewports to 4K desktop screens.
- Touch gesture support for OrbitControls, driving virtual joystick, and LiDAR tapping.

### NFR-04: Offline & Zero-API Dependency
- All 3D meshes, procedural shaders, synthesized Web Audio soundscapes, and datasets shall run 100% locally in the client without external backend servers.
