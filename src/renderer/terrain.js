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

  // 3. Hematite "Blueberries" (MER-B Discovery at Eagle/Endeavour)
  const blueberryGroup = new THREE.Group();
  blueberryGroup.name = "artifact_hematite_blueberries";
  const bbMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d4b5c, // distinctive bluish-gray hematite luster
    metalness: 0.7,
    roughness: 0.35
  });
  const bbGeo = new THREE.SphereGeometry(0.04, 12, 12);

  // Scatter cluster near (3.2, 2.5)
  for (let b = 0; b < 35; b++) {
    const bb = new THREE.Mesh(bbGeo, bbMaterial);
    const bx = 3.2 + (Math.random() - 0.5) * 1.6;
    const bz = 2.5 + (Math.random() - 0.5) * 1.6;
    const by = getTerrainHeight(bx, bz) + 0.03;
    bb.position.set(bx, by, bz);
    bb.scale.setScalar(0.7 + Math.random() * 0.6);
    blueberryGroup.add(bb);
  }
  group.add(blueberryGroup);

  // 4. RAT Rock Abrasion Target ('Esperance-class' rock with circular grind mark)
  const ratRockGroup = new THREE.Group();
  ratRockGroup.name = "artifact_rat_grind_spot";
  const ratRockMesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.55, 1),
    new THREE.MeshStandardMaterial({ color: 0x5a3120, roughness: 0.9 })
  );
  ratRockMesh.scale.set(1.4, 0.6, 1.2);
  const ratY = getTerrainHeight(-1.8, 1.2);
  ratRockGroup.position.set(-1.8, ratY + 0.15, 1.2);
  ratRockGroup.add(ratRockMesh);

  // Circular grind mark
  const grindGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 32);
  const grindMat = new THREE.MeshStandardMaterial({
    color: 0x8a9ca8, // unweathered light clay-rich core
    roughness: 0.4,
    metalness: 0.2
  });
  const grindMesh = new THREE.Mesh(grindGeo, grindMat);
  grindMesh.position.set(0, 0.3, 0.1);
  grindMesh.rotation.x = 0.2;
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

  return { group, getTerrainHeight };
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
