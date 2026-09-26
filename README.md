# 🔴 Relics of the Red Dust: The Last Transmission
### *NASA International Space Apps Challenge 2026 — Interactive Mars MER-B Exploration Experience*

[![NASA Space Apps](https://img.shields.io/badge/NASA%20Space%20Apps-2026%20Challenge-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)](https://www.spaceappschallenge.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Synthesized%20Soundscape-FA7343?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Language](https://img.shields.io/badge/Language-Bilingual%20(EN%20%7C%20BN)-00C853?style=for-the-badge)](https://github.com/Developer-Shaikot/Nasa-2k26)

---

## 🌌 Overview

**Relics of the Red Dust: The Last Transmission** is an immersive, educational, and scientifically rigorous WebGL 3D web application built for the **NASA International Space Apps Challenge**.

Set in **2085**, players step into the boots of an astronaut archaeologist uncovering the historic resting place of NASA's legendary **Mars Exploration Rover Opportunity (MER-B)** inside Perseverance Valley at Endeavour Crater. By interfacing with authentic **NASA Planetary Data System (PDS)** telemetry, users reconstruct Opportunity's historic 14-year mission (Sols 1–5111), investigate the fateful 2018 global dust storm, perform diagnostic scans on its scientific payload, and drive the rover across realistic Martian terrain.

---

## ✨ Key Features

### 🎮 1. Futuristic Game Hub & S-Curve Mission Roadmap
- **Cyberpunk / Sci-Fi Game Hub**: Interactive dashboard displaying player rank, level progress (XP), recovered NASA scientific data shards, and mission badges.
- **S-Curve Roadmap**: Visual, responsive 6-tier progression map guiding explorers through key historical milestones of Opportunity's mission with real-time completion tracking.

### 🛰️ 2. Real-Time 3D Martian Surface & MER-B Simulation
- Custom **Three.js WebGL** terrain engine rendering Endeavour Crater with dynamic lighting, procedural dust storms, and authentic rover kinematics.
- Interactive **Rover Subsystem Scanners**:
  - 📷 **Pancam (Panoramic Camera)**: Mast stereo optical imaging.
  - 🔬 **Mini-TES (Thermal Emission Spectrometer)**: Mineral thermography & emissivity curves.
  - 🧲 **Mössbauer Spectrometer & APXS**: Iron-bearing mineralogy and jarosite identification.
  - ⚙️ **RAT (Rock Abrasion Tool)**: Surface grinding and hematite blueberry discovery.

### 📊 3. NASA PDS Telemetry & Physics Ingestion
- Ingestion of real telemetry logs across Sols 1–5111:
  - **Atmospheric Dust Opacity ($\tau$ / Tau)**: Real-time calculation of solar extinction via the Beer-Lambert law:
    $$I = I_0 \cdot \exp\left(-\frac{\tau}{\cos\theta}\right)$$
  - **Solar Array Generation**: Power output fluctuations from 900 Wh (nominal) down to critical cutoff (< 22 Wh).
  - **Bus Voltage & Thermal Constraints**: Tracking critical sleep state at 20.5V.

### 🌪️ 4. Interactive Simulation Modes
- **Archaeologist 2085**: Free-look exploration, sub-system diagnostics, and historical archive playback.
- **Sol 5111 Storm Re-enactment**: Experience the catastrophic 2018 planet-encircling dust storm that silenced MER-B.
- **Rover Drive**: Manual rover traverse mode with physics-driven steering and wheel rotations.
- **120-Second Pitch Showcase**: Automated camera cinematography highlighting project achievements for judges and educators.

### 🎓 5. Gamified STEM Education & Accessibility
- **Mars Science Quiz**: Interactive challenge testing Martian geology, physics, and mission facts.
- **Synthesized Martian Soundscape**: Zero-asset procedural atmospheric wind and servo audio via Web Audio API.
- **Full Bilingual Support**: Complete real-time localization in **English** and **বাংলা (Bengali)**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | HTML5, Modern CSS3 (Glassmorphism, CSS Grid/Flexbox), JavaScript (ES Modules) |
| **3D Rendering** | Three.js (WebGL), Custom Procedural Shaders, Particle Systems |
| **Audio Engine** | Web Audio API (Synthesized Brown Noise, Biquad Bandpass Filters, LFO Oscillation) |
| **Build & Tooling** | Vite 5.x, PostCSS, ESLint |
| **Data Sources** | NASA Planetary Data System (PDS), MRO HiRISE DTM, MER-B Mission Archives |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- Modern WebGL2-compatible browser (Chrome, Edge, Firefox, Safari)

### Installation & Execution

```bash
# 1. Clone the repository
git clone git@github.com:Developer-Shaikot/Nasa-2k26.git
cd Nasa-2k26

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be accessible at `http://localhost:3000/`.

### Production Build

```bash
# Build optimized static bundle for deployment
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Project Architecture

```
Nasa-2k26/
├── index.html                   # Master HTML structure with Game Hub & HUD overlays
├── style.css                    # Responsive Glassmorphism & Cyberpunk Design System
├── package.json                 # Project dependencies & build scripts
├── vite.config.js               # Vite bundling & server configuration
│
├── src/
│   ├── main.js                  # Application orchestrator, mode switcher & event hub
│   ├── audio/
│   │   └── soundscape.js        # Web Audio API procedural Martian sound synthesizer
│   ├── data/
│   │   ├── pds_telemetry.js     # NASA PDS Sol 1-5111 telemetry database
│   │   └── quest_data.js        # 6-stage missions, quiz questions & Sol fact archive
│   └── renderer/
│       ├── scene.js             # Three.js scene, camera, renderer & lighting setup
│       ├── mars_terrain.js      # Procedural Martian elevation & Endeavour crater terrain
│       ├── rover.js             # Procedural MER-B Opportunity 3D geometry & kinematics
│       ├── storm_particles.js   # Dynamic GPU-driven atmospheric dust storm particle system
│       ├── scanner.js           # Subsystem raycaster, diagnostic beacons & modal manager
│       └── quest_manager.js     # Mission progression, XP calculation & S-curve roadmap UI
│
└── documentation/               # Comprehensive Software Engineering Documentation
    ├── README.md                # SWE Documentation Hub
    ├── 01_PROJECT_OVERVIEW_AND_SRS.md
    ├── 02_SYSTEM_ARCHITECTURE_AND_DESIGN.md
    ├── 03_API_AND_DATA_SPECIFICATIONS.md
    ├── 04_NASA_SPACE_APPS_WINNING_STRATEGY_ALIGNMENT.md
    └── 05_DEPLOYMENT_AND_MAINTENANCE_GUIDE.md
```

---

## 📚 Technical Documentation

Complete Software Engineering (SWE) specifications and competition alignment documents are available in the [`/documentation`](./documentation/) directory:

- 📄 [**01. Project Overview & SRS**](./documentation/01_PROJECT_OVERVIEW_AND_SRS.md): Product scope, user personas, functional and non-functional requirements.
- 🏗️ [**02. System Architecture & Design**](./documentation/02_SYSTEM_ARCHITECTURE_AND_DESIGN.md): Modular component design, rendering loop, and Web Audio architecture.
- 📡 [**03. API & Data Specifications**](./documentation/03_API_AND_DATA_SPECIFICATIONS.md): Telemetry schemas, physical formulas, and mission quest structures.
- 🏆 [**04. Space Apps Winning Strategy Alignment**](./documentation/04_NASA_SPACE_APPS_WINNING_STRATEGY_ALIGNMENT.md): Rubric mapping across Storytelling, Art & Tech, Science, and Outreach.
- 🚀 [**05. Deployment & Maintenance Guide**](./documentation/05_DEPLOYMENT_AND_MAINTENANCE_GUIDE.md): Vercel/GitHub Pages/Netlify deployment, CI/CD, and performance optimizations.

---

## 🛰️ NASA Data & Open Resource Citations

1. **NASA Planetary Data System (PDS) Geosciences Node**: MER-B Atmospheric Opacity ($\tau$) and Engineering Telemetry Logs (Sols 1–5111).
2. **NASA Mars Reconnaissance Orbiter (MRO) HiRISE Archive**: Digital Terrain Model (DTM) of Perseverance Valley at Endeavour Crater ($-14.57^\circ\text{ S}, 354.67^\circ\text{ E}$).
3. **NASA 3D Resources & Jet Propulsion Laboratory (JPL)**: Mars Exploration Rover structural specifications, rocker-bogie chassis geometry, and payload schematics.

---

## 📜 License

This project is open-source and released under the **[MIT License](LICENSE)**.

---

<p align="center">
  <b>Developed with ❤️ for the NASA International Space Apps Challenge 2026</b><br>
  <i>"My battery is low and it's getting dark." — Opportunity MER-B, Sol 5111</i>
</p>
