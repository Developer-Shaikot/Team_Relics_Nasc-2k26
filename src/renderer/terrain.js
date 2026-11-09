import * as THREE from 'three';

// Procedural Martian Regolith & HiRISE DTM Elevation Generator
// Simulates Perseverance Valley on the Western Rim of Endeavour Crater (-14.57° S, 354.67° E)

export function createMartianTerrain() {
  const group = new THREE.Group();
  group.name = "martian_terrain_group";

  // 1. Procedural Heightmap for HiRISE Perseverance Valley Incline
  const width = 120;
  const height = 120;
  const segments = 128;
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;
  
  // Elevation function mimicking HiRISE valley descending into Endeavour Crater
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    // Valley slope gradient (sloping downward toward +X / -Z into crater basin)
    let y = -0.08 * x + 0.04 * z;

    // HiRISE ridge contours (Harmonic sine/cosine waves mimicking geological terraces)
    const ridge1 = Math.sin(x * 0.08 + z * 0.05) * 1.8;
    const ridge2 = Math.cos(x * 0.15 - z * 0.12) * 0.9;
    const micro1 = Math.sin(x * 0.4 + z * 0.3) * 0.25;
    const micro2 = Math.sin(x * 1.2) * Math.cos(z * 1.2) * 0.08;

    // Small crater indentation nearby (Perseverance Valley gully)
    const distToGully = Math.hypot(x - 12, z + 8);
    const gully = -Math.exp(-distToGully * 0.15) * 2.2;

    y += ridge1 + ridge2 + micro1 + micro2 + gully;

    // Flatten immediate landing zone around rover at (0, 0)
    const distToRover = Math.hypot(x, z);
    if (distToRover < 8) {
      const blend = distToRover / 8;
      y = y * blend * 0.4;
    }

    pos.setY(i, y);
  }

  geometry.computeVertexNormals();

  // Create procedural Mars canvas texture for high detail
  const textureSize = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  const ctx = canvas.getContext('2d');

  // Base Martian red-ochre gradient
  const grad = ctx.createLinearGradient(0, 0, textureSize, textureSize);
  grad.addColorStop(0, '#c35831');
  grad.addColorStop(0.35, '#a64423');
  grad.addColorStop(0.7, '#8f371a');
  grad.addColorStop(1, '#b84e2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, textureSize, textureSize);

  // Add sand ripples & mineral noise
  const imgData = ctx.getImageData(0, 0, textureSize, textureSize);
  const data = imgData.data;
  for (let y = 0; y < textureSize; y++) {
    for (let x = 0; x < textureSize; x++) {
      const idx = (y * textureSize + x) * 4;
      const ripple = Math.sin(x * 0.05 + y * 0.02) * 18 + (Math.random() - 0.5) * 22;
      data[idx] = Math.min(255, Math.max(0, data[idx] + ripple));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + ripple * 0.6));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + ripple * 0.4));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const marsTexture = new THREE.CanvasTexture(canvas);
  marsTexture.wrapS = THREE.RepeatWrapping;
  marsTexture.wrapT = THREE.RepeatWrapping;
  marsTexture.repeat.set(12, 12);

  const material = new THREE.MeshStandardMaterial({
    map: marsTexture,
    roughness: 0.88,
    metalness: 0.12,
    color: 0xe06638,
    flatShading: false
  });

  const terrainMesh = new THREE.Mesh(geometry, material);
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  // 2. Procedural Martian Boulders & Rock Outcrops
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e3822,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true
  });

  const rockGeos = [
    new THREE.DodecahedronGeometry(1, 1),
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.DodecahedronGeometry(1, 0)
  ];

  // Scatter rocks across terrain
  for (let i = 0; i < 90; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.5 + Math.random() * 45;
    const rx = Math.cos(angle) * radius;
    const rz = Math.sin(angle) * radius;

    const rockGeo = rockGeos[i % rockGeos.length];
    const rock = new THREE.Mesh(rockGeo, rockMaterial);
    
    const scaleX = 0.2 + Math.random() * 0.7;
    const scaleY = 0.15 + Math.random() * 0.5;
    const scaleZ = 0.2 + Math.random() * 0.7;
    rock.scale.set(scaleX, scaleY, scaleZ);

    // Approximate elevation
    const ry = getTerrainHeight(rx, rz);
    rock.position.set(rx, ry + scaleY * 0.4, rz);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  }

  // 3. Hematite "Blueberries" (MER-B Discovery at Eagle/Endeavour at X: 18, Z: 14)
  const blueberryGroup = new THREE.Group();
  blueberryGroup.name = "artifact_hematite_blueberries";
  blueberryGroup.userData = { subsystemId: "hematite_blueberries", artifactId: "hematite_blueberries", missionId: "mission_blueberries" };
  const bbMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d4b5c, // distinctive bluish-gray hematite luster
    metalness: 0.7,
    roughness: 0.35
  });
  const bbGeo = new THREE.SphereGeometry(0.06, 12, 12);

  // Scatter cluster near (18.0, 14.0)
  for (let b = 0; b < 45; b++) {
    const bb = new THREE.Mesh(bbGeo, bbMaterial);
    const bx = 18.0 + (Math.random() - 0.5) * 2.5;
    const bz = 14.0 + (Math.random() - 0.5) * 2.5;
    const by = getTerrainHeight(bx, bz) + 0.04;
    bb.position.set(bx, by, bz);
    bb.scale.setScalar(0.8 + Math.random() * 0.7);
    bb.userData = { isArtifact: true, id: "hematite_blueberries" };
    blueberryGroup.add(bb);
  }
  group.add(blueberryGroup);

  // 4. RAT Rock Abrasion Target ('Esperance-class' rock with circular grind mark at X: -18, Z: 12)
  const ratRockGroup = new THREE.Group();
  ratRockGroup.name = "artifact_rat_grind_spot";
  ratRockGroup.userData = { subsystemId: "rat_grind_spot", artifactId: "rat_grind_spot", missionId: "mission_rat" };
  const ratRockMesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.75, 1),
    new THREE.MeshStandardMaterial({ color: 0x5a3120, roughness: 0.9 })
  );
  ratRockMesh.scale.set(1.4, 0.6, 1.2);
  const ratY = getTerrainHeight(-18.0, 12.0);
  ratRockGroup.position.set(-18.0, ratY + 0.2, 12.0);
  ratRockGroup.add(ratRockMesh);

  // Circular grind mark
  const grindGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 32);
  const grindMat = new THREE.MeshStandardMaterial({
    color: 0x8a9ca8, // unweathered light clay-rich core
    roughness: 0.4,
    metalness: 0.2
  });
  const grindMesh = new THREE.Mesh(grindGeo, grindMat);
  grindMesh.position.set(0, 0.4, 0.1);
  grindMesh.rotation.x = 0.2;
  grindMesh.userData = { isArtifact: true, id: "rat_grind_spot" };
  ratRockGroup.add(grindMesh);
  group.add(ratRockGroup);

  // 5. Preserved Opportunity Wheel Tracks
  const trackMat = new THREE.MeshBasicMaterial({
    color: 0x6e2410,
    transparent: true,
    opacity: 0.75,
    depthWrite: false
  });
  const trackGeo = new THREE.PlaneGeometry(0.22, 1.2);
  trackGeo.rotateX(-Math.PI / 2);

  for (let t = 0; t < 10; t++) {
    const leftTrack = new THREE.Mesh(trackGeo, trackMat);
    const tz = 2.0 + t * 0.8;
    leftTrack.position.set(-0.65, getTerrainHeight(-0.65, tz) + 0.015, tz);
    group.add(leftTrack);

    const rightTrack = new THREE.Mesh(trackGeo, trackMat);
    rightTrack.position.set(0.65, getTerrainHeight(0.65, tz) + 0.015, tz);
    group.add(rightTrack);
  }

  // 6. Mars InSight Geophysical Lander & SEIS Seismometer Dome Actor (at X: -12, Z: -18)
  const insightActor = createInSightLanderModel();
  const inY = getTerrainHeight(-12, -18);
  insightActor.group.position.set(-12, inY, -18);
  group.add(insightActor.group);

  // 7. Sol 5111 High Rim Atmospheric Weather Station & Dust Storm Monitoring Mast (at X: 16, Z: -20)
  const stormStationActor = createStormStationModel();
  const stormY = getTerrainHeight(16, -20);
  stormStationActor.group.position.set(16, stormY, -20);
  group.add(stormStationActor.group);

  // 8. Level 6: Deep Space Network Uplink Dish (at X: 0, Z: 24) — scan to launch Voyager 1 task
  const dsnDish = createDsnUplinkModel();
  dsnDish.position.set(0, getTerrainHeight(0, 24), 24);
  group.add(dsnDish);

  return { group, getTerrainHeight, insightActor, stormStationActor };
}

function createDsnUplinkModel() {
  const dish = new THREE.Group();
  dish.name = "artifact_dsn_uplink";
  dish.userData = { subsystemId: "dsn_uplink", artifactId: "dsn_uplink", missionId: "mission_blackbox" };
  const tag = { isArtifact: true, id: "dsn_uplink" };

  const metal = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.35 });
  const glow = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.4, 16), metal);
  base.position.y = 0.2;
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.0, 12), metal);
  pillar.position.y = 1.4;

  // Parabolic dish (open hemisphere) tilted toward the sky
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.5, roughness: 0.3, side: THREE.DoubleSide })
  );
  bowl.rotation.x = Math.PI + 0.6;
  bowl.position.y = 2.7;

  const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), metal);
  feed.position.set(0, 3.1, -0.35);
  feed.rotation.x = -0.6;
  const feedTip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), glow);
  feedTip.position.set(0, 3.55, -0.68);

  [base, pillar, bowl, feed, feedTip].forEach((m) => {
    m.userData = tag;
    dish.add(m);
  });
  return dish;
}

// Mars InSight Lander 3D Articulated Actor: Twin Fan Solar Wings, IDA Robotic Arm, Golden SEIS Dome & 3D P/S Seismic Waves
function createInSightLanderModel() {
  const insight = new THREE.Group();
  insight.name = "artifact_insight_lander";
  insight.userData = { subsystemId: "insight_lander" };

  const deckMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.45, metalness: 0.75 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x282c34, roughness: 0.65, metalness: 0.8 });
  const dustySolarMat = new THREE.MeshStandardMaterial({ color: 0x4a2f24, roughness: 0.6, metalness: 0.55 });
  const goldShieldMat = new THREE.MeshStandardMaterial({
    color: 0xffb700,
    emissive: 0x664400,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.9
  });

  // 1. Circular Lander Science Deck
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.32, 12), deckMat);
  deck.position.y = 0.62;
  deck.castShadow = true;
  insight.add(deck);

  // 3 Shock-Absorbing Landing Legs
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 + 0.2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8), darkMetalMat);
    leg.position.set(Math.cos(angle) * 0.9, 0.35, Math.sin(angle) * 0.9);
    leg.rotation.z = Math.cos(angle) * 0.45;
    leg.rotation.x = -Math.sin(angle) * 0.45;
    insight.add(leg);

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12), darkMetalMat);
    pad.position.set(Math.cos(angle) * 1.15, 0.02, Math.sin(angle) * 1.15);
    insight.add(pad);
  }

  // 2. Twin Decagonal Ultraflex Circular Solar Array Wings (Dust-Coated)
  const leftFan = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.03, 10), dustySolarMat);
  leftFan.position.set(-1.95, 0.68, 0);
  leftFan.castShadow = true;
  insight.add(leftFan);

  const rightFan = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.03, 10), dustySolarMat);
  rightFan.position.set(1.95, 0.68, 0);
  rightFan.castShadow = true;
  insight.add(rightFan);

  // 3. Articulated Instrument Deployment Arm (IDA)
  const idaArmGroup = new THREE.Group();
  idaArmGroup.position.set(0.15, 0.78, 0.45);

  const shoulderPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.35, 10), darkMetalMat);
  shoulderPost.position.y = 0.15;
  idaArmGroup.add(shoulderPost);

  const boom1 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.1, 10), darkMetalMat);
  boom1.position.set(0, 0.45, 0.45);
  boom1.rotation.x = 1.05;
  idaArmGroup.add(boom1);

  const grappleHook = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), goldShieldMat);
  grappleHook.position.set(0, 0.15, 0.95);
  idaArmGroup.add(grappleHook);

  insight.add(idaArmGroup);

  // 4. SEIS (Seismic Experiment for Interior Structure) Golden Wind & Thermal Shield Dome on Martian Soil
  const seisDomeGroup = new THREE.Group();
  seisDomeGroup.name = "subsystem_seis_dome";
  seisDomeGroup.userData = { subsystemId: "insight_lander" };
  seisDomeGroup.position.set(0.15, 0.16, 1.45);

  const seisDome = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.3, 6), goldShieldMat);
  seisDome.castShadow = true;
  seisDomeGroup.add(seisDome);

  // Heartbeat Pulse Ring around SEIS Dome
  const heartbeatRingMat = new THREE.MeshBasicMaterial({
    color: 0xffb700,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const heartbeatRing = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.58, 24), heartbeatRingMat);
  heartbeatRing.rotation.x = -Math.PI / 2;
  heartbeatRing.position.y = -0.12;
  seisDomeGroup.add(heartbeatRing);

  insight.add(seisDomeGroup);

  // 5. HP3 ("The Mole") Heat Flow Probe Mast beside SEIS
  const hp3Mast = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), darkMetalMat);
  hp3Mast.position.set(-0.45, 0.22, 1.35);
  insight.add(hp3Mast);

  // 6. 3D Meteoroid Strike & Concentric P-Wave (Fast Cyan) + S-Wave (Slow Amber) Shockwave Rings
  const seismicWaveGroup = new THREE.Group();
  seismicWaveGroup.position.set(4.5, 0.08, -4.5); // Distant impact epicenter relative to lander
  const pWaveRingMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide
  });
  const pWaveRing = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.75, 36), pWaveRingMat);
  pWaveRing.rotation.x = -Math.PI / 2;
  seismicWaveGroup.add(pWaveRing);

  const sWaveRingMat = new THREE.MeshBasicMaterial({
    color: 0xff9f1c,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide
  });
  const sWaveRing = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.95, 36), sWaveRingMat);
  sWaveRing.rotation.x = -Math.PI / 2;
  seismicWaveGroup.add(sWaveRing);

  // Falling Meteoroid Fireball Mesh
  const meteorMat = new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.0 });
  const meteorMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), meteorMat);
  seismicWaveGroup.add(meteorMesh);

  insight.add(seismicWaveGroup);

  // Animation state
  let quakeActive = false;
  let quakeTimer = 0;

  function triggerMarsquake3D() {
    quakeActive = true;
    quakeTimer = 0;
  }

  function update(delta, elapsedTime = 0) {
    // Gentle robotic arm inspection sway & SEIS heartbeat pulse
    idaArmGroup.rotation.y = Math.sin(elapsedTime * 0.7) * 0.12;
    const beat = 1.0 + Math.pow(Math.sin(elapsedTime * 3.2), 4) * 0.35;
    heartbeatRing.scale.set(beat, beat, 1.0);
    goldShieldMat.emissiveIntensity = 0.25 + Math.pow(Math.sin(elapsedTime * 3.2), 4) * 0.5;

    if (quakeActive) {
      quakeTimer += delta;
      // 0.0s - 0.45s: Meteoroid streak descending into ground
      if (quakeTimer < 0.45) {
        const p = quakeTimer / 0.45;
        meteorMat.opacity = 1.0;
        meteorMesh.position.set((1 - p) * 6.0, (1 - p) * 9.0, -(1 - p) * 4.0);
      } else {
        meteorMat.opacity = 0.0;
        const waveT = quakeTimer - 0.45;

        // Fast Primary P-Wave (v_P = 5.0 km/s scaled)
        const pRadius = 1.0 + waveT * 4.8;
        pWaveRing.scale.set(pRadius, pRadius, 1.0);
        pWaveRingMat.opacity = Math.max(0, 0.85 - waveT * 0.22);

        // Slower Secondary S-Wave (v_S = 2.9 km/s scaled)
        const sRadius = 1.0 + waveT * 2.75;
        sWaveRing.scale.set(sRadius, sRadius, 1.0);
        sWaveRingMat.opacity = Math.max(0, 0.92 - waveT * 0.16);

        // Vibrate SEIS dome when P-wave and S-wave pass over InSight
        if (waveT > 0.8 && waveT < 3.6) {
          seisDome.position.y = Math.sin(elapsedTime * 55) * 0.03;
        } else {
          seisDome.position.y = 0;
        }

        if (waveT > 5.8) {
          quakeActive = false;
          pWaveRingMat.opacity = 0;
          sWaveRingMat.opacity = 0;
          seisDome.position.y = 0;
        }
      }
    }
  }

  return {
    group: insight,
    triggerMarsquake3D,
    update
  };
}

// Sol 5111 High Rim Atmospheric Weather Station & Dust Storm Monitoring Mast (Mission 5)
function createStormStationModel() {
  const station = new THREE.Group();
  station.name = "artifact_storm_station";
  station.userData = { subsystemId: "storm_station", artifactId: "storm_station", missionId: "mission_storm" };

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xdfa133, roughness: 0.35, metalness: 0.85 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x242830, roughness: 0.65, metalness: 0.8 });
  const hazardMat = new THREE.MeshStandardMaterial({ color: 0xff5e28, roughness: 0.4, metalness: 0.6 });
  const amberLedMat = new THREE.MeshBasicMaterial({ color: 0xff9f1c });
  const solarPanelMat = new THREE.MeshStandardMaterial({
    color: 0x5a2d1e, // dust-covered solar silicon
    roughness: 0.7,
    metalness: 0.5
  });

  // 1. Heavy Base Pedestal (Hexagonal anchored foundation)
  const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.28, 6), darkMetalMat);
  baseMesh.position.y = 0.14;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  baseMesh.userData = { isArtifact: true, id: "storm_station" };
  station.add(baseMesh);

  // 4 Stabilizer Outrigger Feet with anchoring spikes
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + 0.35;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.6), darkMetalMat);
    foot.position.set(Math.cos(angle) * 1.35, 0.06, Math.sin(angle) * 1.35);
    foot.rotation.y = angle;
    foot.userData = { isArtifact: true, id: "storm_station" };
    station.add(foot);
  }

  // 2. Central Electronics Enclosure & Telemetry Terminal Box
  const terminalBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.6), goldMat);
  terminalBox.position.set(0, 0.65, 0);
  terminalBox.castShadow = true;
  terminalBox.userData = { isArtifact: true, id: "storm_station" };
  station.add(terminalBox);

  // Diagnostic Screen (Flickering Amber Telemetry)
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.3), amberLedMat);
  screenMesh.position.set(0, 0.75, 0.31);
  station.add(screenMesh);

  // 3. Vertical Atmospheric Tower Mast (3.4 meters tall)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 3.4, 8), darkMetalMat);
  mast.position.set(0, 2.3, 0);
  mast.castShadow = true;
  mast.userData = { isArtifact: true, id: "storm_station" };
  station.add(mast);

  // Cross-Arms for Meteorological Sensors
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8), darkMetalMat);
  arm1.rotation.z = Math.PI / 2;
  arm1.position.set(0, 2.2, 0);
  station.add(arm1);

  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), darkMetalMat);
  arm2.rotation.x = Math.PI / 2;
  arm2.position.set(0, 3.2, 0);
  station.add(arm2);

  // 4. Optical Depth Tau Pyranometer Sensor Dome (Upward facing)
  const pyranometer = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.1, metalness: 0.9 })
  );
  pyranometer.position.set(0.5, 2.2, 0);
  pyranometer.userData = { isArtifact: true, id: "storm_station" };
  station.add(pyranometer);

  // 5. Slanted Dust-Coated Solar Array (Opportunity's fatal storm monitor)
  const solarFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.8), darkMetalMat);
  solarFrame.position.set(-0.65, 1.45, 0);
  solarFrame.rotation.z = 0.45; // 25 degree tilt
  station.add(solarFrame);

  const solarCells = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.72), solarPanelMat);
  solarCells.position.set(-0.65, 1.48, 0);
  solarCells.rotation.x = -Math.PI / 2;
  solarCells.rotation.y = -0.45;
  solarCells.userData = { isArtifact: true, id: "storm_station" };
  station.add(solarCells);

  // 6. 3-Cup Spinning Anemometer Rotor on Mast Peak
  const anemometerGroup = new THREE.Group();
  anemometerGroup.position.set(0, 3.85, 0);
  station.add(anemometerGroup);

  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), darkMetalMat);
  anemometerGroup.add(spindle);

  for (let c = 0; c < 3; c++) {
    const angle = (c * Math.PI * 2) / 3;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), darkMetalMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(Math.cos(angle) * 0.175, 0.08, Math.sin(angle) * 0.175);
    rod.rotation.y = -angle;
    anemometerGroup.add(rod);

    const cup = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8, 0, Math.PI),
      hazardMat
    );
    cup.position.set(Math.cos(angle) * 0.35, 0.08, Math.sin(angle) * 0.35);
    cup.rotation.y = angle + Math.PI / 2;
    anemometerGroup.add(cup);
  }

  // 7. Swirling Atmospheric Dust Storm Vortex Ring & Flare
  const vortexGeo = new THREE.RingGeometry(1.0, 3.2, 32);
  const vortexMat = new THREE.MeshBasicMaterial({
    color: 0xff5e28,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const vortexRing = new THREE.Mesh(vortexGeo, vortexMat);
  vortexRing.rotation.x = -Math.PI / 2;
  vortexRing.position.y = 0.08;
  station.add(vortexRing);

  // Top Warning Strobe Light
  const strobeLight = new THREE.PointLight(0xff5e28, 2.5, 14);
  strobeLight.position.set(0, 3.95, 0);
  station.add(strobeLight);

  function update(delta, elapsedTime = 0) {
    // Spin wind anemometer cups continuously
    anemometerGroup.rotation.y += delta * 7.5;
    // Pulse dust vortex ring
    const scale = 1.0 + Math.sin(elapsedTime * 2.5) * 0.12;
    vortexRing.scale.set(scale, scale, 1.0);
    vortexRing.rotation.z += delta * 0.8;
    // Strobe light pulse
    strobeLight.intensity = 1.8 + Math.sin(elapsedTime * 8) * 1.2;
    amberLedMat.color.setRGB(1.0, 0.6 + Math.sin(elapsedTime * 10) * 0.2, 0.1);
  }

  return {
    group: station,
    update
  };
}

export function getTerrainHeight(x, z) {
  let y = -0.08 * x + 0.04 * z;
  const ridge1 = Math.sin(x * 0.08 + z * 0.05) * 1.8;
  const ridge2 = Math.cos(x * 0.15 - z * 0.12) * 0.9;
  const micro1 = Math.sin(x * 0.4 + z * 0.3) * 0.25;
  const micro2 = Math.sin(x * 1.2) * Math.cos(z * 1.2) * 0.08;

  const distToGully = Math.hypot(x - 12, z + 8);
  const gully = -Math.exp(-distToGully * 0.15) * 2.2;

  y += ridge1 + ridge2 + micro1 + micro2 + gully;

  const distToRover = Math.hypot(x, z);
  if (distToRover < 8) {
    const blend = distToRover / 8;
    y = y * blend * 0.4;
  }
  return y;
}
