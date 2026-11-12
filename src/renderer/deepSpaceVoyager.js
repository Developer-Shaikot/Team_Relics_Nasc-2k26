import * as THREE from 'three';
import { scaledCount } from '../systems/performance.js';

// Deep Space Interstellar Environment (24.3 Billion km / 162 AU) & Articulated Voyager 1 3D Actor
export function createDeepSpaceVoyager() {
  const environmentGroup = new THREE.Group();
  environmentGroup.name = "deep_space_environment_group";

  // 1. Interstellar Starfield & Heliopause Plasma Particles
  const starCount = scaledCount(2400);
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const r = 45 + Math.random() * 140;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);

    // Subtle stellar spectral colors (blue-white, pale gold, soft cyan)
    const tint = Math.random();
    if (tint < 0.3) {
      starColors[i * 3] = 0.75; starColors[i * 3 + 1] = 0.88; starColors[i * 3 + 2] = 1.0;
    } else if (tint < 0.6) {
      starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.94; starColors[i * 3 + 2] = 0.8;
    } else {
      starColors[i * 3] = 0.95; starColors[i * 3 + 1] = 0.97; starColors[i * 3 + 2] = 1.0;
    }
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.92
  });
  const starPoints = new THREE.Points(starGeo, starMat);
  environmentGroup.add(starPoints);

  // Distant Pale Sun & Tiny "Pale Blue Dot" Earth Marker (at Z = +65)
  const distantSunGroup = new THREE.Group();
  distantSunGroup.position.set(8, 6, 65);
  const sunPin = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff4cc })
  );
  distantSunGroup.add(sunPin);

  const sunHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 2.2, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  distantSunGroup.add(sunHalo);

  // Tiny Pale Blue Dot next to the distant Sun
  const paleBlueDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  paleBlueDot.position.set(1.8, -0.4, 0);
  distantSunGroup.add(paleBlueDot);
  environmentGroup.add(distantSunGroup);

  // Subtle Reference Holographic Grid Plane below Voyager so camera orbit feels grounded
  const holoGrid = new THREE.GridHelper(36, 36, 0x00e5ff, 0x0b2545);
  holoGrid.position.y = -2.2;
  holoGrid.material.transparent = true;
  holoGrid.material.opacity = 0.22;
  environmentGroup.add(holoGrid);

  // 2. Articulated Voyager 1 Spacecraft Actor
  const voyager = new THREE.Group();
  voyager.name = "artifact_voyager1";
  voyager.userData = { subsystemId: "voyager1" };
  voyager.position.set(0, 0.6, 0);

  // Materials
  const whiteDishMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.3,
    side: THREE.DoubleSide
  });

  const darkBlanketMat = new THREE.MeshStandardMaterial({
    color: 0x1e242b,
    roughness: 0.65,
    metalness: 0.75
  });

  const busFoilMat = new THREE.MeshStandardMaterial({
    color: 0xadb5bd,
    roughness: 0.4,
    metalness: 0.85
  });

  const goldRecordMat = new THREE.MeshStandardMaterial({
    color: 0xffc72c,
    emissive: 0x8a5a00,
    emissiveIntensity: 0.45,
    roughness: 0.15,
    metalness: 0.96
  });

  const rtgMat = new THREE.MeshStandardMaterial({
    color: 0x2b303a,
    emissive: 0xff5e28,
    emissiveIntensity: 0.55,
    roughness: 0.5,
    metalness: 0.8
  });

  // A. 10-Sided Decagonal Main Bus
  const busGroup = new THREE.Group();
  busGroup.name = "subsystem_voyager_bus";
  busGroup.userData = { subsystemId: "voyager_bus" };

  const outerBusGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.48, 10);
  const outerBus = new THREE.Mesh(outerBusGeo, darkBlanketMat);
  busGroup.add(outerBus);

  const innerCoreGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.52, 10);
  const innerCore = new THREE.Mesh(innerCoreGeo, busFoilMat);
  busGroup.add(innerCore);
  voyager.add(busGroup);

  // B. 3.7-Meter High-Gain Parabolic Dish Antenna (HGA) facing Earth (+Z / +Y)
  const hgaGroup = new THREE.Group();
  hgaGroup.name = "subsystem_voyager_hga";
  hgaGroup.userData = { subsystemId: "voyager_hga" };
  hgaGroup.position.set(0, 0.38, 0);

  const dishGeo = new THREE.SphereGeometry(1.85, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.32);
  const dishMesh = new THREE.Mesh(dishGeo, whiteDishMat);
  dishMesh.rotation.x = Math.PI;
  dishMesh.position.y = 0.55;
  hgaGroup.add(dishMesh);

  // Sub-reflector tripod struts on dish
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.95, 8),
      busFoilMat
    );
    strut.position.set(Math.cos(angle) * 0.42, 0.45, Math.sin(angle) * 0.42);
    strut.rotation.z = Math.cos(angle) * 0.45;
    strut.rotation.x = -Math.sin(angle) * 0.45;
    hgaGroup.add(strut);
  }

  const feedHorn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 0.18, 16),
    darkBlanketMat
  );
  feedHorn.position.y = 0.82;
  hgaGroup.add(feedHorn);
  voyager.add(hgaGroup);

  // C. The Iconic 12-Inch Gold-Plated Copper Golden Record (Mounted on Bus Side)
  const goldenRecordGroup = new THREE.Group();
  goldenRecordGroup.name = "subsystem_golden_record";
  goldenRecordGroup.userData = { subsystemId: "golden_record" };
  goldenRecordGroup.position.set(0.89, 0.0, 0.15);
  goldenRecordGroup.rotation.z = -Math.PI / 2;

  const platterMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.03, 32),
    goldRecordMat
  );
  goldenRecordGroup.add(platterMesh);

  // Etched Pulsar Map & Groove Rings on the Golden Record
  const grooveRing = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.28, 32),
    new THREE.MeshBasicMaterial({ color: 0xffe885, side: THREE.DoubleSide, wireframe: true })
  );
  grooveRing.rotation.x = -Math.PI / 2;
  grooveRing.position.y = 0.018;
  goldenRecordGroup.add(grooveRing);

  // Glowing Halo Ring around Golden Record
  const recordHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.34, 0.42, 32),
    new THREE.MeshBasicMaterial({ color: 0xffb700, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
  );
  recordHalo.rotation.x = -Math.PI / 2;
  recordHalo.position.y = 0.01;
  goldenRecordGroup.add(recordHalo);
  voyager.add(goldenRecordGroup);

  // D. Triple MHW-RTG Plutonium-238 Nuclear Battery Boom (Left-Rear Outrigger)
  const rtgGroup = new THREE.Group();
  rtgGroup.name = "subsystem_voyager_rtg";
  rtgGroup.userData = { subsystemId: "voyager_rtg" };
  rtgGroup.position.set(-0.85, -0.1, -0.35);
  rtgGroup.rotation.z = 0.35;

  const rtgBoom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, 2.2, 8),
    darkBlanketMat
  );
  rtgBoom.rotation.z = Math.PI / 2;
  rtgBoom.position.x = -1.1;
  rtgGroup.add(rtgBoom);

  for (let r = 0; r < 3; r++) {
    const canister = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.52, 12),
      rtgMat
    );
    canister.rotation.z = Math.PI / 2;
    canister.position.set(-0.75 - r * 0.58, 0, 0);
    rtgGroup.add(canister);
  }
  voyager.add(rtgGroup);

  // E. 13-Meter Triaxial Fluxgate Magnetometer Boom (MAG)
  const magGroup = new THREE.Group();
  magGroup.name = "subsystem_voyager_mag";
  magGroup.userData = { subsystemId: "voyager_mag" };
  magGroup.position.set(0.6, -0.15, -0.6);

  const magBoom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.04, 4.8, 6),
    new THREE.MeshStandardMaterial({ color: 0xd97706, wireframe: true })
  );
  magBoom.rotation.z = -Math.PI / 3;
  magBoom.rotation.x = -0.35;
  magBoom.position.set(1.8, -0.8, -1.2);
  magGroup.add(magBoom);
  voyager.add(magGroup);

  // F. Articulated Science Scan Platform (ISS Narrow/Wide Cameras & Spectrometers)
  const scanPlatformGroup = new THREE.Group();
  scanPlatformGroup.name = "subsystem_voyager_iss";
  scanPlatformGroup.userData = { subsystemId: "voyager_iss" };
  scanPlatformGroup.position.set(0.75, 0.15, 0.65);

  const scanBoom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8),
    darkBlanketMat
  );
  scanBoom.rotation.z = -Math.PI / 2.5;
  scanBoom.position.set(0.65, 0.25, 0);
  scanPlatformGroup.add(scanBoom);

  const cameraHeadGroup = new THREE.Group();
  cameraHeadGroup.position.set(1.35, 0.5, 0);

  const narrowCam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.42, 16),
    darkBlanketMat
  );
  narrowCam.rotation.x = Math.PI / 2;
  cameraHeadGroup.add(narrowCam);

  const wideCam = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.18, 0.28),
    busFoilMat
  );
  wideCam.position.set(0.18, 0.08, 0);
  cameraHeadGroup.add(wideCam);

  scanPlatformGroup.add(cameraHeadGroup);
  voyager.add(scanPlatformGroup);

  // G. Twin 10m Plasma Wave Subsystem (PWS) Whip Antennas
  const pws1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.012, 3.8, 6),
    busFoilMat
  );
  pws1.position.set(-0.4, -0.6, 1.6);
  pws1.rotation.x = Math.PI / 2.4;
  pws1.rotation.z = 0.4;
  voyager.add(pws1);

  const pws2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.012, 3.8, 6),
    busFoilMat
  );
  pws2.position.set(0.4, -0.6, 1.6);
  pws2.rotation.x = Math.PI / 2.4;
  pws2.rotation.z = -0.4;
  voyager.add(pws2);

  // H. Radio Handshake Carrier Wave Rings (Animated during 22h Light-Delay Handshake)
  const radioWaveGroup = new THREE.Group();
  radioWaveGroup.position.set(0, 1.1, 0);
  const waveRings = [];
  for (let w = 0; w < 3; w++) {
    const wRing = new THREE.Mesh(
      new THREE.RingGeometry(0.3, 0.42, 32),
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      })
    );
    wRing.rotation.x = -Math.PI / 2;
    radioWaveGroup.add(wRing);
    waveRings.push(wRing);
  }
  voyager.add(radioWaveGroup);

  environmentGroup.add(voyager);

  // Animation state flags
  let isCameraParked = false;
  let isGoldenRecordSpinning = false;
  let handshakePulseActive = false;

  function setRTGThermalGlow(watts = 249) {
    const ratio = Math.max(0.15, Math.min(1.0, (watts - 180) / 120));
    rtgMat.emissiveIntensity = 0.2 + ratio * 0.7;
  }

  function setCameraPowered(isOn) {
    isCameraParked = !isOn;
  }

  function setGoldenRecordSpin(spinning) {
    isGoldenRecordSpinning = spinning;
    goldRecordMat.emissiveIntensity = spinning ? 0.9 : 0.45;
  }

  function triggerHandshakeWave(active = true) {
    handshakePulseActive = active;
  }

  function update(delta, elapsedTime = 0) {
    // Gentle zero-gravity attitude drift of Voyager 1
    voyager.position.y = 0.6 + Math.sin(elapsedTime * 0.8) * 0.08;
    voyager.rotation.z = Math.sin(elapsedTime * 0.4) * 0.025;
    voyager.rotation.y = Math.sin(elapsedTime * 0.25) * 0.04;

    // Scan platform camera articulation (parks downward when powered OFF to save 28W)
    const targetCamPitch = isCameraParked ? -0.75 : Math.sin(elapsedTime * 1.1) * 0.25;
    cameraHeadGroup.rotation.x += (targetCamPitch - cameraHeadGroup.rotation.x) * Math.min(1, delta * 3.5);
    cameraHeadGroup.rotation.y = isCameraParked ? 0 : Math.cos(elapsedTime * 0.7) * 0.35;

    // Golden Record rotation & shimmer
    const spinSpeed = isGoldenRecordSpinning ? 3.2 : 0.4;
    platterMesh.rotation.y += delta * spinSpeed;
    grooveRing.rotation.z -= delta * spinSpeed;
    recordHalo.scale.setScalar(1.0 + Math.sin(elapsedTime * 4.0) * 0.1);

    // Radio Carrier Handshake Pulse Rings
    waveRings.forEach((ring, idx) => {
      if (handshakePulseActive) {
        const phase = (elapsedTime * 1.4 + idx * 0.33) % 1.0;
        const scale = 1.0 + phase * 8.5;
        ring.scale.set(scale, scale, 1.0);
        ring.position.y = phase * 6.0;
        ring.material.opacity = (1.0 - phase) * 0.75;
      } else {
        ring.material.opacity = 0.0;
      }
    });
  }

  return {
    group: environmentGroup,
    rover: voyager,
    wheels: [],
    getTerrainHeight: () => 0.6,
    setRTGThermalGlow,
    setCameraPowered,
    setGoldenRecordSpin,
    triggerHandshakeWave,
    update
  };
}

