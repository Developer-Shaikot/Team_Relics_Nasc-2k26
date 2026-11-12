// Cinematic 3D Celestial Engine for Hero Hub: Photorealistic Mars, Moon & Voyager 1
// Built with Three.js (v0.170.0):
// - High-fidelity procedural PBR planetary surfaces (relief canyons, polar caps, maria & ray craters)
// - Real-time atmospheric Rayleigh scattering halo shader with twilight corona
// - Swirling Martian dust-storm atmospheric layer with independent rotation
// - Surface holographic relic waypoint beacons (Opportunity MER-B, InSight, Apollo 11)
// - Orbiting Mars relay satellite with communication beacon
// - High-detail 3D Voyager 1 probe with gleaming Golden Record & expanding radio waves
// - Volumetric deep-space nebula clouds & multi-magnitude starfield
// - Interactive 3D mouse parallax tracking, drag-to-orbit with physics damping, and collectible stardust crystals!

import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { martianAudio } from './audio.js';
import { PERF, AdaptiveResolution, scaledCount } from './performance.js';

const TEXTURE_SCALE = PERF.isMobile ? 0.5 : 1;

export class Hero3DOrrery {
  constructor(containerId, coinsManager, onSelectDestination) {
    this.container = document.getElementById(containerId);
    this.coinsManager = coinsManager;
    this.onSelectDestination = onSelectDestination;

    if (!this.container) return;

    this.width = this.container.clientWidth || 800;
    this.height = this.container.clientHeight || 500;
    this.isActive = true;
    this.animId = null;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-10, -10);
    this.parallaxMouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // 3D Scene Hierarchy
    this.spaceGroup = new THREE.Group();
    this.celestialGroup = new THREE.Group();
    this.marsGroup = null;
    this.moonGroup = null;
    this.voyagerGroup = null;
    this.crystals = [];
    this.radioRings = [];
    this.beacons = [];
    this.satelliteGroup = null;

    // Drag Orbit & Inertia State
    this.isDragging = false;
    this.dragStartPos = { x: 0, y: 0 };
    this.previousMousePosition = { x: 0, y: 0 };
    this.dragDistance = 0;
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };

    // Camera Focus & Positions for each World
    this.cameraPresets = {
      mars: {
        pos: new THREE.Vector3(0.0, 0.55, 4.3),
        lookAt: new THREE.Vector3(0.0, 0.45, 0.0),
        groupRotY: 0
      },
      moon: {
        pos: new THREE.Vector3(-2.2, 0.45, 2.5),
        lookAt: new THREE.Vector3(-3.2, 0.35, -0.6),
        groupRotY: 0
      },
      deepspace: {
        pos: new THREE.Vector3(2.2, 0.55, 2.3),
        lookAt: new THREE.Vector3(3.0, 0.45, -0.8),
        groupRotY: 0
      }
    };

    this.targetCameraPos = this.cameraPresets.mars.pos.clone();
    this.targetLookAt = this.cameraPresets.mars.lookAt.clone();
    this.currentLookAt = this.cameraPresets.mars.lookAt.clone();

    // Active Selection
    this.activePlanet = 'mars';
    this.hoveredObject = null;

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.createDeepSpaceNebula();
    this.createStarfieldCloud();
    this.createMars3D();
    this.createMoon3D();
    this.createVoyager3D();
    this.createCollectibleCrystals(6);
    this.setupEvents();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      42,
      this.width / this.height,
      0.1,
      300
    );
    this.camera.position.copy(this.targetCameraPos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: PERF.antialias,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.adaptiveResolution = new AdaptiveResolution(this.renderer);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.container.appendChild(this.renderer.domElement);
    this.scene.add(this.spaceGroup);
    this.spaceGroup.add(this.celestialGroup);
  }

  setupLighting() {
    // 1. Primary Solar Light (Warm golden space sunlight)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.8);
    sunLight.position.set(-14, 10, 16);
    this.scene.add(sunLight);

    // 2. Secondary Cosmic Rim Fill (Subtle blue-violet ambient fill)
    const ambientLight = new THREE.AmbientLight(0x0e1b38, 1.1);
    this.scene.add(ambientLight);

    // 3. Martian Amber Atmospheric Backlight
    const marsGlowLight = new THREE.PointLight(0xff5e28, 2.2, 14);
    marsGlowLight.position.set(2.8, 1.2, -1.0);
    this.scene.add(marsGlowLight);

    // 4. Lunar Cyan Rim Light
    const moonGlowLight = new THREE.PointLight(0x00e5ff, 1.8, 12);
    moonGlowLight.position.set(-3.2, 0.8, -1.0);
    this.scene.add(moonGlowLight);
  }

  // =========================================================================
  // HIGH-RESOLUTION PROCEDURAL PLANETARY TEXTURES
  // =========================================================================

  generateMarsTexture() {
    const canvas = document.createElement('canvas');
    // Phones: paint at half size (faster start-up, less GPU memory); drawing code keeps 2048×1024 units
    const s = TEXTURE_SCALE;
    canvas.width = 2048 * s;
    canvas.height = 1024 * s;
    const ctx = canvas.getContext('2d');
    ctx.scale(s, s);

    // Base Martian Rust Gradient with rich terrain gradation
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, '#f27835');
    grad.addColorStop(0.2, '#c84e1b');
    grad.addColorStop(0.5, '#a43810');
    grad.addColorStop(0.8, '#82280a');
    grad.addColorStop(1, '#5e1b05');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Volcanic Basalt Maria Plains (Acidalia, Syrtis Major, Sinus Sabaeus)
    ctx.fillStyle = 'rgba(56, 18, 8, 0.72)';
    for (let i = 0; i < 45; i++) {
      ctx.beginPath();
      const x = (i * 149 + 180) % 2048;
      const y = 260 + (i * 73) % 520;
      const rx = 80 + (i * 29) % 180;
      const ry = 50 + (i * 19) % 110;
      ctx.ellipse(x, y, rx, ry, i * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Valles Marineris Grand Canyon Rift System (4,000 km complex)
    ctx.strokeStyle = 'rgba(32, 10, 4, 0.9)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(600, 520);
    ctx.bezierCurveTo(800, 480, 1050, 580, 1380, 530);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(235, 120, 70, 0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(602, 516);
    ctx.bezierCurveTo(800, 476, 1050, 576, 1380, 526);
    ctx.stroke();

    // Olympus Mons & Tharsis Montes Volcanoes
    const volcanoes = [
      { x: 440, y: 460, r: 42, label: 'Olympus Mons' },
      { x: 560, y: 530, r: 24, label: 'Ascraeus Mons' },
      { x: 520, y: 590, r: 22, label: 'Pavonis Mons' }
    ];

    volcanoes.forEach(v => {
      const vGrad = ctx.createRadialGradient(v.x, v.y, 4, v.x, v.y, v.r);
      vGrad.addColorStop(0, '#ff9660');
      vGrad.addColorStop(0.35, '#8c2d12');
      vGrad.addColorStop(0.8, '#4a1506');
      vGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = vGrad;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
      ctx.fill();

      // Caldera pit
      ctx.fillStyle = '#1c0803';
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    });

    // North & South Polar Ice Sheets (with feathered seasonal frost)
    const nCap = ctx.createRadialGradient(1024, 25, 20, 1024, 25, 260);
    nCap.addColorStop(0, '#ffffff');
    nCap.addColorStop(0.4, 'rgba(255, 255, 255, 0.88)');
    nCap.addColorStop(0.8, 'rgba(255, 220, 200, 0.4)');
    nCap.addColorStop(1, 'transparent');
    ctx.fillStyle = nCap;
    ctx.beginPath();
    ctx.ellipse(1024, 30, 420, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    const sCap = ctx.createRadialGradient(1024, 995, 15, 1024, 995, 220);
    sCap.addColorStop(0, '#ffffff');
    sCap.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
    sCap.addColorStop(0.85, 'rgba(255, 220, 200, 0.35)');
    sCap.addColorStop(1, 'transparent');
    ctx.fillStyle = sCap;
    ctx.beginPath();
    ctx.ellipse(1024, 995, 340, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Craters with sunlit rims & deep shadows
    for (let c = 0; c < 70; c++) {
      const cx = (c * 197) % 2048;
      const cy = 120 + (c * 131) % 780;
      const cr = 6 + (c % 18);

      ctx.fillStyle = 'rgba(30, 8, 3, 0.65)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 185, 140, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx - 1.5, cy - 1.5, cr, 0, Math.PI * 1.3);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  generateMarsCloudsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 512);

    // Semi-translucent swirling dust streaks and thin atmospheric cirrus
    ctx.fillStyle = 'rgba(255, 205, 170, 0.22)';
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      const x = (i * 93 + 40) % 1024;
      const y = 80 + (i * 47) % 360;
      const rx = 90 + (i * 17) % 140;
      const ry = 18 + (i * 7) % 35;
      ctx.ellipse(x, y, rx, ry, 0.15 + (i * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  generateMoonTexture() {
    const canvas = document.createElement('canvas');
    const s = TEXTURE_SCALE;
    canvas.width = 2048 * s;
    canvas.height = 1024 * s;
    const ctx = canvas.getContext('2d');
    ctx.scale(s, s);

    // Lunar Highland Anorthosite Regolith Base
    ctx.fillStyle = '#9aa5b5';
    ctx.fillRect(0, 0, 2048, 1024);

    // Dark Basaltic Maria (Sea of Tranquility, Ocean of Storms, Sea of Serenity)
    ctx.fillStyle = 'rgba(38, 48, 64, 0.78)';
    const maria = [
      { x: 750, y: 440, rx: 240, ry: 160 }, // Mare Tranquillitatis (Apollo 11)
      { x: 1040, y: 360, rx: 300, ry: 190 }, // Oceanus Procellarum
      { x: 1360, y: 520, rx: 200, ry: 140 }, // Mare Imbrium
      { x: 520, y: 400, rx: 170, ry: 120 }
    ];
    maria.forEach(m => {
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, 0.15, 0, Math.PI * 2);
      ctx.fill();
    });

    // Tycho Crater with brilliant radial ejecta ray filaments
    const tychoX = 850;
    const tychoY = 760;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2.4;
    for (let a = 0; a < 36; a++) {
      const angle = (a * Math.PI * 2) / 36;
      const len = 120 + (a % 6) * 65;
      ctx.beginPath();
      ctx.moveTo(tychoX, tychoY);
      ctx.lineTo(tychoX + Math.cos(angle) * len, tychoY + Math.sin(angle) * len);
      ctx.stroke();
    }

    // Tycho central peak
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tychoX, tychoY, 14, 0, Math.PI * 2);
    ctx.fill();

    // High density crater field
    for (let c = 0; c < 90; c++) {
      const cx = (c * 179) % 2048;
      const cy = 60 + (c * 109) % 900;
      const cr = 4 + (c % 16);

      ctx.fillStyle = 'rgba(20, 26, 36, 0.7)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx - 1, cy - 1, cr, 0, Math.PI * 1.4);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  generateGoldenRecordTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
    grad.addColorStop(0, '#ffe066');
    grad.addColorStop(0.3, '#d97706');
    grad.addColorStop(0.65, '#f59e0b');
    grad.addColorStop(1, '#92400e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.2;
    for (let r = 24; r < 246; r += 4) {
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center Spindle Hole
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(256, 256, 35, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  // =========================================================================
  // 3D CELESTIAL WORLDS & HARDWARE RELICS
  // =========================================================================

  // 1. Photorealistic 3D Mars (Hero World)
  createMars3D() {
    this.marsGroup = new THREE.Group();
    this.marsGroup.position.set(0.0, 0.45, 0.0);
    this.marsGroup.userData = { id: 'mars', name: 'Planet Mars', dest: 'mars' };

    // Core Mars Sphere
    const marsGeo = new THREE.SphereGeometry(1.2, 64, 64);
    const marsMat = new THREE.MeshStandardMaterial({
      map: this.generateMarsTexture(),
      roughness: 0.78,
      metalness: 0.15
    });
    this.marsMesh = new THREE.Mesh(marsGeo, marsMat);
    this.marsGroup.add(this.marsMesh);

    // Swirling Martian Dust Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(1.22, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: this.generateMarsCloudsTexture(),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      roughness: 1.0
    });
    this.marsClouds = new THREE.Mesh(cloudGeo, cloudMat);
    this.marsClouds.raycast = () => {};
    this.marsGroup.add(this.marsClouds);

    // Atmospheric Rayleigh Limb Glow Corona
    const coronaGeo = new THREE.SphereGeometry(1.33, 48, 48);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xff6a38,
      transparent: true,
      opacity: 0.32,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    this.marsCorona = new THREE.Mesh(coronaGeo, coronaMat);
    this.marsCorona.raycast = () => {};
    this.marsGroup.add(this.marsCorona);

    // Opportunity (MER-B) Relic Beacon (Perseverance Valley)
    const oppyBeacon = this.createRelicBeacon(0xffb700, 'OPPORTUNITY (SOL 5111)');
    oppyBeacon.position.set(0.58, 0.34, 1.0);
    this.marsGroup.add(oppyBeacon);

    // InSight Lander Relic Beacon (Elysium Planitia)
    const insightBeacon = this.createRelicBeacon(0x00e5ff, 'INSIGHT SEIS');
    insightBeacon.position.set(0.92, 0.52, 0.55);
    this.marsGroup.add(insightBeacon);

    // Orbiting Mars Relay Satellite (MRO / Odyssey)
    this.satellitePivot = new THREE.Group();
    this.satellitePivot.rotation.z = 0.42;

    const satOrbitRingGeo = new THREE.RingGeometry(1.74, 1.77, 64);
    const satOrbitRingMat = new THREE.MeshBasicMaterial({
      color: 0xff7849,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    const satRing = new THREE.Mesh(satOrbitRingGeo, satOrbitRingMat);
    satRing.rotation.x = Math.PI / 2;
    satRing.raycast = () => {};
    this.satellitePivot.add(satRing);

    // Satellite body
    this.satelliteMesh = new THREE.Group();
    const satBodyGeo = new THREE.BoxGeometry(0.07, 0.07, 0.11);
    const satBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.2 });
    this.satelliteMesh.add(new THREE.Mesh(satBodyGeo, satBodyMat));

    const panelGeo = new THREE.BoxGeometry(0.3, 0.02, 0.07);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, emissive: 0x0284c7, emissiveIntensity: 0.3 });
    this.satelliteMesh.add(new THREE.Mesh(panelGeo, panelMat));

    this.satelliteMesh.position.set(1.75, 0, 0);
    this.satelliteMesh.raycast = () => {};
    this.satellitePivot.add(this.satelliteMesh);
    this.marsGroup.add(this.satellitePivot);

    this.celestialGroup.add(this.marsGroup);
  }

  // 2. Photorealistic 3D Moon (Apollo 11 Tranquility Base)
  createMoon3D() {
    this.moonGroup = new THREE.Group();
    this.moonGroup.position.set(-3.2, 0.35, -0.6);
    this.moonGroup.userData = { id: 'moon', name: 'Earth Moon', dest: 'moon' };

    const moonGeo = new THREE.SphereGeometry(0.85, 54, 54);
    const moonMat = new THREE.MeshStandardMaterial({
      map: this.generateMoonTexture(),
      roughness: 0.9,
      metalness: 0.08
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonGroup.add(this.moonMesh);

    // Lunar Limb Glow
    const haloGeo = new THREE.SphereGeometry(0.95, 36, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    this.moonHalo = new THREE.Mesh(haloGeo, haloMat);
    this.moonHalo.raycast = () => {};
    this.moonGroup.add(this.moonHalo);

    // Apollo 11 Tranquility Base Relic Beacon
    const apolloBeacon = this.createRelicBeacon(0xffd700, 'APOLLO 11 LM EAGLE');
    apolloBeacon.position.set(0.40, 0.20, 0.72);
    this.moonGroup.add(apolloBeacon);

    this.celestialGroup.add(this.moonGroup);
  }

  // 3. High-Fidelity 3D Voyager 1 Probe with Golden Record (Deep Space)
  createVoyager3D() {
    this.voyagerGroup = new THREE.Group();
    this.voyagerGroup.position.set(3.0, 0.45, -0.8);
    this.voyagerGroup.userData = { id: 'deepspace', name: 'Voyager 1', dest: 'deepspace' };

    // High Gain Antenna Dish (White 3.7m Parabolic Dish)
    const dishGeo = new THREE.CylinderGeometry(0.65, 0.12, 0.22, 36, 1, true);
    dishGeo.rotateX(Math.PI / 2);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.65,
      roughness: 0.25,
      side: THREE.DoubleSide
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    this.voyagerGroup.add(dish);

    // Golden Subreflector Feed
    const hornGeo = new THREE.ConeGeometry(0.09, 0.32, 16);
    hornGeo.rotateX(-Math.PI / 2);
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xffb700,
      emissiveIntensity: 0.3
    });
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.z = 0.28;
    this.voyagerGroup.add(horn);

    // 10-Sided Bus Core
    const busGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10);
    const busMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.35 });
    const bus = new THREE.Mesh(busGeo, busMat);
    bus.position.z = -0.20;
    this.voyagerGroup.add(bus);

    // The Golden Record (Mounted on bus flank)
    const recordGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.02, 36);
    recordGeo.rotateX(Math.PI / 2);
    const recordMat = new THREE.MeshStandardMaterial({
      map: this.generateGoldenRecordTexture(),
      metalness: 0.96,
      roughness: 0.12,
      emissive: 0xffb700,
      emissiveIntensity: 0.35
    });
    this.goldenRecordMesh = new THREE.Mesh(recordGeo, recordMat);
    this.goldenRecordMesh.position.set(-0.40, -0.26, -0.12);
    this.voyagerGroup.add(this.goldenRecordMesh);

    // Magnetometer Boom Truss
    const boomGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.4, 8);
    boomGeo.rotateZ(Math.PI / 2.8);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    boom.position.set(0.7, 0.4, -0.25);
    this.voyagerGroup.add(boom);

    // Expanding Radio Waves into the Interstellar Void
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.RingGeometry(0.75, 0.82, 36);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.15;
      ring.userData = { scale: 1 + r * 0.9, maxScale: 4.5, speed: 0.022 + r * 0.005 };
      ring.raycast = () => {};
      this.radioRings.push(ring);
      this.voyagerGroup.add(ring);
    }

    this.celestialGroup.add(this.voyagerGroup);
  }

  // Glowing Relic Holo-Beacon (Light beam + pulsing sonar rings)
  createRelicBeacon(colorHex, label) {
    const group = new THREE.Group();
    group.raycast = () => {};

    // Vertical light beam
    const beamGeo = new THREE.CylinderGeometry(0.015, 0.04, 0.85, 12);
    beamGeo.translate(0, 0.42, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    group.add(beam);

    // Pulsing Ground Sonar Ring
    const ringGeo = new THREE.RingGeometry(0.08, 0.12, 24);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.userData = { isPulseRing: true, baseScale: 1, currentScale: 1, speed: 0.03 };
    group.add(ring);
    this.beacons.push({ group, ring, beam });

    return group;
  }

  // =========================================================================
  // VOLUMETRIC DEEP-SPACE NEBULA & MULTI-MAGNITUDE STARFIELD
  // =========================================================================

  createDeepSpaceNebula() {
    const nebulaGeo = new THREE.BufferGeometry();
    const count = 480;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const nebulaColors = [
      new THREE.Color(0x3b82f6), // Deep blue
      new THREE.Color(0xa855f7), // Cosmic purple
      new THREE.Color(0xec4899), // Solar magenta
      new THREE.Color(0x06b6d4)  // Ethereal cyan
    ];

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 55;
      positions[idx + 1] = (Math.random() - 0.5) * 35;
      positions[idx + 2] = -14 + (Math.random() - 0.5) * 30;

      const col = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      colors[idx] = col.r;
      colors[idx + 1] = col.g;
      colors[idx + 2] = col.b;
    }

    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    nebulaGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const nebulaMat = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.nebulaPoints = new THREE.Points(nebulaGeo, nebulaMat);
    this.spaceGroup.add(this.nebulaPoints);
  }

  createStarfieldCloud() {
    const starGeo = new THREE.BufferGeometry();
    const count = scaledCount(2200);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const starPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xdbeafe),
      new THREE.Color(0xfef08a),
      new THREE.Color(0x67e8f9)
    ];

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 65;
      positions[idx + 1] = (Math.random() - 0.5) * 45;
      positions[idx + 2] = -8 + (Math.random() - 0.5) * 35;

      const col = starPalette[Math.floor(Math.random() * starPalette.length)];
      colors[idx] = col.r;
      colors[idx + 1] = col.g;
      colors[idx + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });

    this.starPoints = new THREE.Points(starGeo, starMat);
    this.spaceGroup.add(this.starPoints);
  }

  createCollectibleCrystals(count = 6) {
    this.crystals = [];
    const crystalGeo = new THREE.OctahedronGeometry(0.18, 0);
    const colors = [0xffb700, 0x00e5ff, 0xff5e28, 0x38bdf8];

    for (let i = 0; i < count; i++) {
      const col = colors[i % colors.length];
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        metalness: 0.92,
        roughness: 0.1,
        emissive: col,
        emissiveIntensity: 0.6
      });

      const crystal = new THREE.Mesh(crystalGeo, mat);
      crystal.position.set(
        (Math.random() - 0.5) * 7.5,
        -1.2 + Math.random() * 2.8,
        (Math.random() - 0.5) * 2.5
      );
      crystal.userData = {
        isCrystal: true,
        rotSpeedX: 0.02 + Math.random() * 0.02,
        rotSpeedY: 0.025 + Math.random() * 0.02,
        baseY: crystal.position.y,
        floatFreq: 1.4 + Math.random(),
        value: 15
      };

      this.crystals.push(crystal);
      this.celestialGroup.add(crystal);
    }
  }

  // =========================================================================
  // INTERACTIVE CONTROLS: MOUSE PARALLAX, DRAG ROTATE & RAYCASTING
  // =========================================================================

  onResize() {
    if (!this.container) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    if (w > 0 && h > 0) {
      this.width = w;
      this.height = h;
      if (this.camera && this.renderer) {
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        this.adaptiveResolution?.refreshCeiling();
      }
    }
  }

  setupEvents() {
    const el = this.renderer.domElement;

    this.resizeObserver = new ResizeObserver(() => {
      this.onResize();
    });
    this.resizeObserver.observe(this.container);
    window.addEventListener('resize', () => this.onResize(), { passive: true });

    // Global subtle mouse parallax over hero section
    window.addEventListener('pointermove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      this.parallaxMouse.targetX = nx * 0.45;
      this.parallaxMouse.targetY = ny * 0.35;
    }, { passive: true });

    el.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragStartPos = { x: e.clientX, y: e.clientY };
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.dragDistance = 0;
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const rw = rect.width || this.width || 1;
      const rh = rect.height || this.height || 1;
      this.mouse.x = ((e.clientX - rect.left) / rw) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rh) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;
        this.dragDistance += Math.hypot(deltaX, deltaY);

        this.targetRotation.y += deltaX * 0.0055;
        this.targetRotation.x += deltaY * 0.0055;
        this.targetRotation.x = Math.max(-0.4, Math.min(0.4, this.targetRotation.x));
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        this.checkRaycastHover();
      }
    });

    el.addEventListener('pointerup', (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        try { el.releasePointerCapture(e.pointerId); } catch (err) {}

        if (this.dragDistance < 7) {
          this.handle3DClick(e);
        }
      }
    });

    el.addEventListener('pointercancel', (e) => {
      this.isDragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch (err) {}
    });
  }

  checkRaycastHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.celestialGroup.children, true);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj.parent && obj.parent !== this.celestialGroup) {
        obj = obj.parent;
      }

      if (this.hoveredObject !== obj) {
        this.hoveredObject = obj;
        this.renderer.domElement.style.cursor = 'pointer';
        if (obj.userData?.dest) {
          martianAudio.playPortalHover?.(obj.userData.dest);
        } else {
          martianAudio.playUiHover?.();
        }
      }
    } else {
      if (this.hoveredObject) {
        this.hoveredObject = null;
        this.renderer.domElement.style.cursor = 'default';
      }
    }
  }

  handle3DClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.celestialGroup.children, true);

    if (intersects.length > 0) {
      let obj = intersects[0].object;

      // Clicked on 3D Collectible Crystal
      if (obj.userData?.isCrystal || obj.parent?.userData?.isCrystal) {
        const targetCrystal = obj.userData?.isCrystal ? obj : obj.parent;
        this.collect3DCrystal(targetCrystal, e.clientX, e.clientY);
        return;
      }

      // Clicked on 3D Planet Group
      while (obj.parent && obj.parent !== this.celestialGroup) {
        obj = obj.parent;
      }

      if (obj.userData?.dest) {
        this.select3DPlanet(obj.userData.dest, e.clientX, e.clientY);
      }
    }
  }

  collect3DCrystal(crystal, clientX, clientY) {
    martianAudio.playScannerBeep?.(true);

    const val = crystal.userData.value || 15;
    if (this.coinsManager) {
      this.coinsManager.addCoins(val);
    }

    const stardustEl = document.getElementById('hero-stardust-collected');
    if (stardustEl) {
      const current = parseInt(stardustEl.innerText, 10) || 0;
      stardustEl.innerText = current + val;
    }

    try {
      confetti({
        particleCount: 24,
        spread: 50,
        origin: { x: clientX / window.innerWidth, y: clientY / window.innerHeight },
        colors: ['#00e5ff', '#ffb700', '#ffffff'],
        disableForReducedMotion: true
      });
    } catch (err) {}

    crystal.visible = false;
    setTimeout(() => {
      crystal.position.set(
        (Math.random() - 0.5) * 7.5,
        -1.2 + Math.random() * 2.8,
        (Math.random() - 0.5) * 2.5
      );
      crystal.visible = true;
    }, 4500);
  }

  // Camera-only preview (hover, hub open, idle reset): no sound, no confetti, no callback.
  focusPlanet(dest) {
    this.activePlanet = dest;
    const preset = this.cameraPresets[dest] || this.cameraPresets.mars;
    this.targetCameraPos.copy(preset.pos);
    this.targetLookAt.copy(preset.lookAt);
    this.targetRotation.y = preset.groupRotY;
  }

  // Full selection (click on a planet / chip). `notify: false` when the caller is the
  // parent's own setDestination, so the callback can't bounce back and recurse.
  select3DPlanet(dest, clientX = window.innerWidth / 2, clientY = window.innerHeight / 2, { notify = true } = {}) {
    if (this.isSelecting) return; // re-entry guard: parent callback -> select3DPlanet loop
    this.isSelecting = true;
    try {
      this.focusPlanet(dest);
      martianAudio.playPortalHover?.(dest);
      if (notify && typeof this.onSelectDestination === 'function') {
        this.onSelectDestination(dest);
      }
    } finally {
      this.isSelecting = false;
    }

    try {
      confetti({
        particleCount: 22,
        spread: 45,
        origin: { x: clientX / window.innerWidth, y: clientY / window.innerHeight },
        colors: dest === 'mars' ? ['#ff5e28', '#ffb700'] : dest === 'moon' ? ['#38bdf8', '#ffffff'] : ['#a855f7', '#00e5ff'],
        disableForReducedMotion: true
      });
    } catch (err) {}
  }

  // =========================================================================
  // ANIMATION RENDER LOOP
  // =========================================================================

  animate() {
    let last = performance.now();
    const loop = (now) => {
      const delta = (now - last) / 1000;
      last = now;
      // Skip while the hub is hidden or a popup covers it (the last frame stays on screen)
      if (this.isActive && !document.hidden && !document.querySelector('.modal-backdrop.active')) {
        this.update();
        this.renderer.render(this.scene, this.camera);
        this.adaptiveResolution.tick(delta);
      }
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  update() {
    const time = performance.now() * 0.001;

    // 1. Smooth Inertial Orbit Damping
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;
    this.celestialGroup.rotation.x = this.currentRotation.x;
    this.celestialGroup.rotation.y = this.currentRotation.y;

    // 2. Parallax Camera Floating
    this.parallaxMouse.x += (this.parallaxMouse.targetX - this.parallaxMouse.x) * 0.05;
    this.parallaxMouse.y += (this.parallaxMouse.targetY - this.parallaxMouse.y) * 0.05;

    // 3. Planetary Axial Rotations
    if (this.marsMesh) {
      this.marsMesh.rotation.y += 0.0032;
    }
    if (this.marsClouds) {
      this.marsClouds.rotation.y += 0.0048;
    }
    if (this.moonMesh) {
      this.moonMesh.rotation.y += 0.0015;
    }
    if (this.goldenRecordMesh) {
      this.goldenRecordMesh.rotation.z += 0.035;
    }

    // 4. Orbiting Mars Relay Satellite Motion
    if (this.satellitePivot) {
      this.satellitePivot.rotation.y += 0.012;
    }

    // 5. Relic Beacon Ground Sonar Pulsing
    this.beacons.forEach(b => {
      b.ring.userData.currentScale += b.ring.userData.speed;
      b.ring.scale.set(b.ring.userData.currentScale, b.ring.userData.currentScale, 1);
      b.ring.material.opacity = Math.max(0, 1 - (b.ring.userData.currentScale / 2.8));
      if (b.ring.userData.currentScale >= 2.8) {
        b.ring.userData.currentScale = 1;
      }
    });

    // 6. Expanding Radio Waves from Voyager 1
    this.radioRings.forEach(ring => {
      ring.userData.scale += ring.userData.speed;
      ring.scale.set(ring.userData.scale, ring.userData.scale, 1);
      ring.material.opacity = Math.max(0, 1 - (ring.userData.scale / ring.userData.maxScale));
      if (ring.userData.scale >= ring.userData.maxScale) {
        ring.userData.scale = 1;
      }
    });

    // 7. Collectible Crystals Hover & Tumbling
    this.crystals.forEach(c => {
      if (!c.visible) return;
      c.rotation.x += c.userData.rotSpeedX;
      c.rotation.y += c.userData.rotSpeedY;
      c.position.y = c.userData.baseY + Math.sin(time * c.userData.floatFreq) * 0.14;
    });

    // 8. Smooth Camera Damping toward focus target + parallax offset
    const finalCamPos = this.targetCameraPos.clone();
    finalCamPos.x += this.parallaxMouse.x;
    finalCamPos.y += this.parallaxMouse.y;

    this.camera.position.lerp(finalCamPos, 0.05);
    this.currentLookAt.lerp(this.targetLookAt, 0.05);
    this.camera.lookAt(this.currentLookAt);

    // 9. Slow Deep Starfield & Nebula Drift
    if (this.starPoints) {
      this.starPoints.rotation.y = time * 0.008;
    }
    if (this.nebulaPoints) {
      this.nebulaPoints.rotation.y = time * 0.004;
    }
  }

  setActive(active) {
    this.isActive = active;
  }

  destroy() {
    this.isActive = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
