import * as THREE from 'three';

// Procedural Lunar Regolith & Mare Tranquillitatis / Surveyor Crater Generator
export function createLunarTerrain() {
  const group = new THREE.Group();
  group.name = "lunar_terrain_group";

  // 1. Procedural Heightmap for Lunar Crater Basin
  const width = 120;
  const height = 120;
  const segments = 128;
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    // Subtle undulating lunar mare rolling plains
    let y = Math.sin(x * 0.05 + z * 0.04) * 0.8 + Math.cos(x * 0.09 - z * 0.08) * 0.5;

    // Micro impact crater roughness
    const micro1 = Math.sin(x * 0.5 + z * 0.4) * 0.15;
    const micro2 = Math.cos(x * 1.1) * Math.sin(z * 1.1) * 0.06;

    // Surveyor 3 Crater (Prominent crater at X: 14, Z: -10)
    const distToSurveyorCrater = Math.hypot(x - 14, z + 10);
    const surveyorCrater = -Math.exp(-distToSurveyorCrater * 0.18) * 3.2;

    // Small impact crater at (X: -16, Z: 12)
    const distToCrater2 = Math.hypot(x + 16, z - 12);
    const crater2 = -Math.exp(-distToCrater2 * 0.22) * 2.1;

    y += micro1 + micro2 + surveyorCrater + crater2;

    // Level immediate starting site around (0, 0)
    const distToCenter = Math.hypot(x, z);
    if (distToCenter < 8) {
      const blend = distToCenter / 8;
      y = y * blend * 0.3;
    }

    pos.setY(i, y);
  }

  geometry.computeVertexNormals();

  // Create procedural Lunar canvas texture
  const textureSize = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  const ctx = canvas.getContext('2d');

  // Lunar charcoal/ash-grey regolith base
  const grad = ctx.createLinearGradient(0, 0, textureSize, textureSize);
  grad.addColorStop(0, '#5a5d64');
  grad.addColorStop(0.4, '#484b51');
  grad.addColorStop(0.7, '#3c3e44');
  grad.addColorStop(1, '#52555b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, textureSize, textureSize);

  // Regolith grain and micro-craters noise
  const imgData = ctx.getImageData(0, 0, textureSize, textureSize);
  const data = imgData.data;
  for (let y = 0; y < textureSize; y++) {
    for (let x = 0; x < textureSize; x++) {
      const idx = (y * textureSize + x) * 4;
      const noise = (Math.random() - 0.5) * 26;
      data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise + 2));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const moonTexture = new THREE.CanvasTexture(canvas);
  moonTexture.wrapS = THREE.RepeatWrapping;
  moonTexture.wrapT = THREE.RepeatWrapping;
  moonTexture.repeat.set(12, 12);

  const material = new THREE.MeshStandardMaterial({
    map: moonTexture,
    roughness: 0.94,
    metalness: 0.08,
    color: 0x888b92,
    flatShading: false
  });

  const terrainMesh = new THREE.Mesh(geometry, material);
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  // 2. Lunar Anorthosite / Basalt Boulders
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x585a60,
    roughness: 0.92,
    metalness: 0.1,
    flatShading: true
  });

  const rockGeos = [
    new THREE.DodecahedronGeometry(1, 1),
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.DodecahedronGeometry(1, 0)
  ];

  for (let i = 0; i < 75; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 4.0 + Math.random() * 45;
    const rx = Math.cos(angle) * radius;
    const rz = Math.sin(angle) * radius;

    const rockGeo = rockGeos[i % rockGeos.length];
    const rock = new THREE.Mesh(rockGeo, rockMaterial);

    const scaleX = 0.25 + Math.random() * 0.8;
    const scaleY = 0.18 + Math.random() * 0.6;
    const scaleZ = 0.25 + Math.random() * 0.8;
    rock.scale.set(scaleX, scaleY, scaleZ);

    const ry = getLunarTerrainHeight(rx, rz);
    rock.position.set(rx, ry + scaleY * 0.4, rz);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  }

  // 3. Historic Surveyor 1 Soft Lander Relic (at X: 0, Z: -3)
  const surveyor1Group = createSurveyor1Model();
  const s1Y = getLunarTerrainHeight(0, -3);
  surveyor1Group.position.set(0, s1Y, -3);
  group.add(surveyor1Group);

  // 4. Apollo 11 Lunar Module Descent Stage Relic (at X: -10, Z: -12)
  const lmGroup = createApolloDescentStageModel();
  const lmY = getLunarTerrainHeight(-10, -12);
  lmGroup.position.set(-10, lmY, -12);
  group.add(lmGroup);

  // 5. Historic Surveyor 3 Probe Relic (at X: 14, Z: -10)
  const surveyor3Group = createSurveyor3Model();
  const s3Y = getLunarTerrainHeight(14, -10);
  surveyor3Group.position.set(14, s3Y, -10);
  group.add(surveyor3Group);

  // 6. Apollo 15 LRV Buggy Station & Deployment Ramp (at X: 12, Z: 14)
  const lrvBaseGroup = createLRVBaseStationModel();
  const lrvY = getLunarTerrainHeight(12, 14);
  lrvBaseGroup.position.set(12, lrvY, 14);
  group.add(lrvBaseGroup);

  // 7. LCROSS Polar Crater Water Ice Crystal Deposit (at X: -16, Z: 12)
  const iceGroup = createLCROSSIceDepositModel();
  const iceY = getLunarTerrainHeight(-16, 12);
  iceGroup.position.set(-16, iceY, 12);
  group.add(iceGroup);

  // 8. Artemis South Pole Gateway Communication Beacon (at X: 18, Z: -20)
  const artemisGroup = createArtemisBaseBeaconModel();
  const artY = getLunarTerrainHeight(18, -20);
  artemisGroup.position.set(18, artY, -20);
  group.add(artemisGroup);

  // 9. Lunar Rover LRV Tracks
  const trackMat = new THREE.MeshBasicMaterial({
    color: 0x2e3034,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  });
  const trackGeo = new THREE.PlaneGeometry(0.24, 1.2);
  trackGeo.rotateX(-Math.PI / 2);

  for (let t = 0; t < 12; t++) {
    const leftTrack = new THREE.Mesh(trackGeo, trackMat);
    const tz = 2.0 + t * 0.9;
    leftTrack.position.set(-0.7, getLunarTerrainHeight(-0.7, tz) + 0.015, tz);
    group.add(leftTrack);

    const rightTrack = new THREE.Mesh(trackGeo, trackMat);
    rightTrack.position.set(0.7, getLunarTerrainHeight(0.7, tz) + 0.015, tz);
    group.add(rightTrack);
  }

  return { group, getTerrainHeight: getLunarTerrainHeight };
}

export function getLunarTerrainHeight(x, z) {
  let y = Math.sin(x * 0.05 + z * 0.04) * 0.8 + Math.cos(x * 0.09 - z * 0.08) * 0.5;
  const micro1 = Math.sin(x * 0.5 + z * 0.4) * 0.15;
  const micro2 = Math.cos(x * 1.1) * Math.sin(z * 1.1) * 0.06;

  const distToSurveyorCrater = Math.hypot(x - 14, z + 10);
  const surveyorCrater = -Math.exp(-distToSurveyorCrater * 0.18) * 3.2;

  const distToCrater2 = Math.hypot(x + 16, z - 12);
  const crater2 = -Math.exp(-distToCrater2 * 0.22) * 2.1;

  y += micro1 + micro2 + surveyorCrater + crater2;

  const distToCenter = Math.hypot(x, z);
  if (distToCenter < 8) {
    const blend = distToCenter / 8;
    y = y * blend * 0.3;
  }
  return y;
}

// Surveyor 3 3D Relic (Tripod legs, solar panel mast, camera head, soil scoop)
function createSurveyor3Model() {
  const probe = new THREE.Group();
  probe.name = "artifact_surveyor3";
  probe.userData = { subsystemId: "surveyor3" };

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4, metalness: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7, metalness: 0.8 });
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x112244, roughness: 0.3, metalness: 0.8 });

  // Central triangular tubular frame
  const frameGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 3);
  const frame = new THREE.Mesh(frameGeo, whiteMat);
  frame.position.y = 0.5;
  probe.add(frame);

  // 3 Tripod Landing Legs with footpads
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8);
    const leg = new THREE.Mesh(legGeo, whiteMat);
    leg.position.set(Math.cos(angle) * 0.45, 0.3, Math.sin(angle) * 0.45);
    leg.rotation.z = Math.cos(angle) * 0.6;
    leg.rotation.x = -Math.sin(angle) * 0.6;
    probe.add(leg);

    const padGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12);
    const pad = new THREE.Mesh(padGeo, darkMat);
    pad.position.set(Math.cos(angle) * 0.8, 0.02, Math.sin(angle) * 0.8);
    probe.add(pad);
  }

  // Mast & Planar Solar Panel
  const mastGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
  const mast = new THREE.Mesh(mastGeo, darkMat);
  mast.position.set(0, 1.1, 0);
  probe.add(mast);

  const solarPanelGeo = new THREE.BoxGeometry(0.4, 0.6, 0.02);
  const solarPanel = new THREE.Mesh(solarPanelGeo, solarMat);
  solarPanel.position.set(0, 1.5, 0.1);
  solarPanel.rotation.x = 0.3;
  probe.add(solarPanel);

  // TV Camera (The historic camera retrieved by Apollo 12)
  const camGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12);
  const cam = new THREE.Mesh(camGeo, whiteMat);
  cam.position.set(0.2, 0.85, 0.15);
  cam.rotation.x = 0.2;
  probe.add(cam);

  // Soil Mechanics Surface Sampler (Scoop Arm)
  const armGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8);
  const arm = new THREE.Mesh(armGeo, darkMat);
  arm.position.set(-0.35, 0.3, 0.2);
  arm.rotation.z = -0.7;
  probe.add(arm);

  // Glowing Waypoint Beacon
  const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 4;
  probe.add(beacon);

  return probe;
}

// Apollo Lunar Module Descent Stage 3D Model
function createApolloDescentStageModel() {
  const lm = new THREE.Group();
  lm.name = "artifact_apollo_lm";
  lm.userData = { subsystemId: "apollo_lm" };

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xdfa133, roughness: 0.35, metalness: 0.85 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.8 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.7 });

  // Octagonal base chassis (Gold Kapton wrapped)
  const baseGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.8, 8);
  const base = new THREE.Mesh(baseGeo, goldMat);
  base.position.y = 0.8;
  base.castShadow = true;
  lm.add(base);

  // Descent Engine Bell
  const bellGeo = new THREE.ConeGeometry(0.5, 0.7, 16, 1, true);
  const bell = new THREE.Mesh(bellGeo, darkMat);
  bell.position.y = 0.35;
  bell.rotation.x = Math.PI;
  lm.add(bell);

  // 4 Landing Struts with footpads & ladder
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
    const strut = new THREE.Mesh(strutGeo, silverMat);
    strut.position.set(Math.cos(angle) * 1.6, 0.45, Math.sin(angle) * 1.6);
    strut.rotation.z = Math.cos(angle) * 0.7;
    strut.rotation.x = -Math.sin(angle) * 0.7;
    lm.add(strut);

    const padGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12);
    const pad = new THREE.Mesh(padGeo, goldMat);
    pad.position.set(Math.cos(angle) * 2.3, 0.03, Math.sin(angle) * 2.3);
    lm.add(pad);
  }

  // Historic Plaque on Forward Leg
  const plaqueGeo = new THREE.BoxGeometry(0.25, 0.18, 0.02);
  const plaque = new THREE.Mesh(plaqueGeo, silverMat);
  plaque.position.set(0, 0.6, 1.6);
  lm.add(plaque);

  // Glowing Beacon
  const beaconGeo = new THREE.CylinderGeometry(0.05, 0.05, 8, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffb700, transparent: true, opacity: 0.35 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 4;
  lm.add(beacon);

  return lm;
}

// Surveyor 1 Soft Lander 3D Relic (Oceanus Procellarum, 1966)
function createSurveyor1Model() {
  const probe = new THREE.Group();
  probe.name = "artifact_surveyor1";
  probe.userData = { subsystemId: "surveyor1" };

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.35, metalness: 0.75 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a2d32, roughness: 0.7, metalness: 0.8 });
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f2042, roughness: 0.25, metalness: 0.85 });

  // Central triangular tubular chassis frame
  const frameGeo = new THREE.CylinderGeometry(0.3, 0.42, 0.65, 3);
  const frame = new THREE.Mesh(frameGeo, whiteMat);
  frame.position.y = 0.52;
  probe.add(frame);

  // 3 Tripod Landing Legs with crushable footpads
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 + 0.3;
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.95, 8);
    const leg = new THREE.Mesh(legGeo, whiteMat);
    leg.position.set(Math.cos(angle) * 0.45, 0.3, Math.sin(angle) * 0.45);
    leg.rotation.z = Math.cos(angle) * 0.6;
    leg.rotation.x = -Math.sin(angle) * 0.6;
    probe.add(leg);

    const padGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 12);
    const pad = new THREE.Mesh(padGeo, darkMat);
    pad.position.set(Math.cos(angle) * 0.82, 0.02, Math.sin(angle) * 0.82);
    probe.add(pad);
  }

  // Mast & Planar Solar Panel
  const mastGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8);
  const mast = new THREE.Mesh(mastGeo, darkMat);
  mast.position.set(0, 1.15, 0);
  probe.add(mast);

  const solarPanelGeo = new THREE.BoxGeometry(0.42, 0.65, 0.02);
  const solarPanel = new THREE.Mesh(solarPanelGeo, solarMat);
  solarPanel.position.set(0, 1.55, 0.08);
  solarPanel.rotation.x = 0.25;
  probe.add(solarPanel);

  // High-Gain Planar Antenna
  const hgaGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16);
  const hga = new THREE.Mesh(hgaGeo, whiteMat);
  hga.position.set(-0.25, 1.25, 0);
  hga.rotation.z = 0.4;
  probe.add(hga);

  // Glowing Beacon
  const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 4;
  probe.add(beacon);

  return probe;
}

// Apollo 15 LRV Buggy Station & Deployment Ramp (1971)
function createLRVBaseStationModel() {
  const station = new THREE.Group();
  station.name = "artifact_lrv_station";
  station.userData = { subsystemId: "lrv_station" };

  const metalMat = new THREE.MeshStandardMaterial({ color: 0x8892a0, roughness: 0.4, metalness: 0.8 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xdfa133, roughness: 0.35, metalness: 0.85 });
  const neonMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.8 });

  // Deployment Platform Ramp
  const rampGeo = new THREE.BoxGeometry(2.4, 0.1, 3.2);
  const ramp = new THREE.Mesh(rampGeo, metalMat);
  ramp.position.y = 0.06;
  station.add(ramp);

  // Corner Tool Staging Boxes
  const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), goldMat);
  box1.position.set(-0.9, 0.25, -1.2);
  station.add(box1);

  const box2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), metalMat);
  box2.position.set(0.8, 0.2, -1.2);
  station.add(box2);

  // Navigation Marker Antenna Mast
  const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.5, 8);
  const pole = new THREE.Mesh(poleGeo, metalMat);
  pole.position.set(1.0, 1.75, 1.3);
  station.add(pole);

  const flagGeo = new THREE.PlaneGeometry(0.6, 0.35);
  const flag = new THREE.Mesh(flagGeo, neonMat);
  flag.position.set(1.32, 3.2, 1.3);
  station.add(flag);

  // Beacon
  const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 4;
  station.add(beacon);

  return station;
}

// LCROSS Polar Crater Water Ice Crystal Deposit (Cabeus Crater)
function createLCROSSIceDepositModel() {
  const deposit = new THREE.Group();
  deposit.name = "artifact_lcross_ice";
  deposit.userData = { subsystemId: "lcross_ice" };

  const iceMat = new THREE.MeshStandardMaterial({
    color: 0x8be9fd,
    emissive: 0x00c4e6,
    emissiveIntensity: 0.45,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88
  });

  // Clustered Ice Spire Crystals
  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    const dist = 0.3 + (i % 3) * 0.25;
    const h = 0.8 + (i % 4) * 0.4;
    const crystalGeo = new THREE.ConeGeometry(0.18, h, 6);
    const crystal = new THREE.Mesh(crystalGeo, iceMat);
    crystal.position.set(Math.cos(angle) * dist, h * 0.5, Math.sin(angle) * dist);
    crystal.rotation.set(Math.sin(i) * 0.2, angle, Math.cos(i) * 0.2);
    deposit.add(crystal);
  }

  // Glowing Ice Rim Pulse
  const ringGeo = new THREE.RingGeometry(0.4, 1.8, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  deposit.add(ring);

  // Beacon
  const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 4;
  deposit.add(beacon);

  return deposit;
}

// Artemis South Pole Gateway Communication Beacon (2026+)
function createArtemisBaseBeaconModel() {
  const terminal = new THREE.Group();
  terminal.name = "artifact_artemis_beacon";
  terminal.userData = { subsystemId: "artemis_beacon" };

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xdfa133, roughness: 0.3, metalness: 0.9 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.7 });
  const orangeMat = new THREE.MeshBasicMaterial({ color: 0xff5e28, transparent: true, opacity: 0.9 });

  // Modern Hexagonal Gateway Hab Base
  const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.6, 6);
  const base = new THREE.Mesh(baseGeo, whiteMat);
  base.position.y = 0.3;
  terminal.add(base);

  // Central Optical Laser Terminal Tower
  const towerGeo = new THREE.CylinderGeometry(0.08, 0.15, 3.2, 12);
  const tower = new THREE.Mesh(towerGeo, goldMat);
  tower.position.y = 1.9;
  terminal.add(tower);

  // Optical Transceiver Head
  const headGeo = new THREE.OctahedronGeometry(0.35, 1);
  const head = new THREE.Mesh(headGeo, orangeMat);
  head.position.y = 3.6;
  terminal.add(head);

  // Beacon Light
  const beaconGeo = new THREE.CylinderGeometry(0.05, 0.05, 8, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff5e28, transparent: true, opacity: 0.45 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 4;
  terminal.add(beacon);

  return terminal;
}
