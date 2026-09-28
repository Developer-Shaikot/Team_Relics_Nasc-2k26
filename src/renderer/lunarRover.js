import * as THREE from 'three';

// Apollo Lunar Roving Vehicle (LRV) 3D Procedural Mesh & Subsystems
export function createLunarRover() {
  const rover = new THREE.Group();
  rover.name = "lunar_rover_lrv";

  // Materials
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xc8ccd2, // satin anodized aluminum
    roughness: 0.35,
    metalness: 0.8
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x22252a,
    roughness: 0.7,
    metalness: 0.7
  });

  const seatMeshMat = new THREE.MeshStandardMaterial({
    color: 0x8a929e,
    roughness: 0.8,
    metalness: 0.3,
    wireframe: true
  });

  const meshWheelMat = new THREE.MeshStandardMaterial({
    color: 0xadb5bd,
    roughness: 0.4,
    metalness: 0.85,
    wireframe: true
  });

  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.9,
    wireframe: true
  });

  // 1. Chassis Tubular Frame
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.12, 1.8),
    frameMat
  );
  chassis.position.y = 0.38;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  rover.add(chassis);

  // Front Battery & Radiator Console
  const frontConsole = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.25, 0.45),
    darkMat
  );
  frontConsole.position.set(0, 0.48, 0.8);
  rover.add(frontConsole);

  // High-Gain Umbrella Mesh Parabolic Antenna (Front Left)
  const hgaGroup = new THREE.Group();
  hgaGroup.position.set(-0.35, 0.55, 0.8);
  const dishGeo = new THREE.SphereGeometry(0.32, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4);
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.rotation.x = -Math.PI / 2 + 0.3;
  hgaGroup.add(dish);

  const dishFeed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8),
    frameMat
  );
  dishFeed.position.set(0, 0.15, 0.05);
  hgaGroup.add(dishFeed);
  rover.add(hgaGroup);

  // Low Gain Omni & Color TV Camera (Front Right)
  const tvCamGroup = new THREE.Group();
  tvCamGroup.position.set(0.35, 0.55, 0.8);
  const tvCam = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.12, 0.2),
    frameMat
  );
  tvCam.position.y = 0.15;
  tvCamGroup.add(tvCam);
  rover.add(tvCamGroup);

  // 2. Twin Astronaut Foldable Mesh Seats
  const seat1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.45, 0.38),
    seatMeshMat
  );
  seat1.position.set(-0.25, 0.58, 0.05);
  rover.add(seat1);

  const seat2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.45, 0.38),
    seatMeshMat
  );
  seat2.position.set(0.25, 0.58, 0.05);
  rover.add(seat2);

  // Central T-Handle Hand Controller
  const tHandleGroup = new THREE.Group();
  tHandleGroup.position.set(0, 0.5, 0.3);
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8),
    frameMat
  );
  stick.position.y = 0.12;
  tHandleGroup.add(stick);
  const grip = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.02, 0.02),
    darkMat
  );
  grip.position.y = 0.24;
  tHandleGroup.add(grip);
  rover.add(tHandleGroup);

  // 3. Rear Equipment Deck & Sample Return Palette
  const rearDeck = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.18, 0.6),
    darkMat
  );
  rearDeck.position.set(0, 0.42, -0.6);
  rover.add(rearDeck);

  // 4. Four Wire-Mesh Wheels with Independent DC Motors
  const wheels = [];
  const wheelPositions = [
    { x: -0.75, y: 0.32, z: 0.65 },  // Front Left
    { x: 0.75, y: 0.32, z: 0.65 },   // Front Right
    { x: -0.75, y: 0.32, z: -0.65 }, // Rear Left
    { x: 0.75, y: 0.32, z: -0.65 }   // Rear Right
  ];

  wheelPositions.forEach((pos, idx) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, pos.y, pos.z);

    // Wire Mesh Tire
    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, meshWheelMat);
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Inner Hub Motor
    const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.24, 12);
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, frameMat);
    wheelGroup.add(hub);

    // Mudguard / Fender (Orange/Zinc-Chromate or Silver)
    const fenderGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 12, 1, false, 0, Math.PI);
    fenderGeo.rotateZ(Math.PI / 2);
    const fenderMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.4,
      metalness: 0.8
    });
    const fender = new THREE.Mesh(fenderGeo, fenderMat);
    fender.position.y = 0.05;
    wheelGroup.add(fender);

    rover.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  return {
    rover,
    wheels,
    setDustAccumulation: (tau) => {
      // Moon has no atmospheric dust storms
    }
  };
}
