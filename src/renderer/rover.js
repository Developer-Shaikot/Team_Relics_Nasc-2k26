import * as THREE from 'three';

// MER-B Opportunity Rover 3D Procedural Mesh & Subsystems
export function createOpportunityRover() {
  const rover = new THREE.Group();
  rover.name = "opportunity_rover";

  // Materials
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xcca872, // gold-kapton / anodized aluminum
    roughness: 0.5,
    metalness: 0.6
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x2e3136,
    roughness: 0.7,
    metalness: 0.8
  });

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xdfa133,
    roughness: 0.35,
    metalness: 0.85
  });

  // Solar Panel Material with dust layer control
  const solarCanvas = document.createElement('canvas');
  solarCanvas.width = 512;
  solarCanvas.height = 512;
  const sCtx = solarCanvas.getContext('2d');
  sCtx.fillStyle = '#08182b'; // deep space blue PV cells
  sCtx.fillRect(0, 0, 512, 512);
  sCtx.strokeStyle = '#225588';
  sCtx.lineWidth = 3;
  for (let i = 0; i <= 512; i += 32) {
    sCtx.beginPath();
    sCtx.moveTo(i, 0); sCtx.lineTo(i, 512);
    sCtx.stroke();
    sCtx.beginPath();
    sCtx.moveTo(0, i); sCtx.lineTo(512, i);
    sCtx.stroke();
  }
  const solarTex = new THREE.CanvasTexture(solarCanvas);
  solarTex.wrapS = THREE.RepeatWrapping;
  solarTex.wrapT = THREE.RepeatWrapping;
  solarTex.repeat.set(4, 4);

  const solarMat = new THREE.MeshStandardMaterial({
    map: solarTex,
    color: 0x1a3355,
    roughness: 0.25,
    metalness: 0.75
  });

  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x050f18,
    roughness: 0.1,
    metalness: 0.95
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x1f2226,
    roughness: 0.8,
    metalness: 0.5
  });

  // 1. Warm Electronics Box (WEB Chassis)
  const chassisGeo = new THREE.BoxGeometry(1.0, 0.32, 1.3);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  chassis.position.y = 0.48;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  rover.add(chassis);

  // Gold insulation thermal wrap on lower body
  const foilGeo = new THREE.BoxGeometry(0.96, 0.2, 1.26);
  const foil = new THREE.Mesh(foilGeo, goldFoilMat);
  foil.position.y = 0.42;
  rover.add(foil);

  // 2. Triangular Solar Array Wings (Solar Panels)
  const solarDeck = new THREE.Group();
  solarDeck.name = "subsystem_solar_array";
  solarDeck.userData = { subsystemId: "solar_array" };

  // Center Deck
  const centerSolarGeo = new THREE.BoxGeometry(0.98, 0.03, 1.25);
  const centerSolar = new THREE.Mesh(centerSolarGeo, solarMat);
  centerSolar.position.y = 0.65;
  centerSolar.castShadow = true;
  solarDeck.add(centerSolar);

  // Left Wing (Triangular/trapezoidal wing)
  const leftWingGeo = new THREE.BoxGeometry(0.65, 0.025, 1.1);
  const leftWing = new THREE.Mesh(leftWingGeo, solarMat);
  leftWing.position.set(-0.78, 0.65, 0.05);
  leftWing.rotation.z = -0.06;
  leftWing.castShadow = true;
  solarDeck.add(leftWing);

  // Right Wing
  const rightWingGeo = new THREE.BoxGeometry(0.65, 0.025, 1.1);
  const rightWing = new THREE.Mesh(rightWingGeo, solarMat);
  rightWing.position.set(0.78, 0.65, 0.05);
  rightWing.rotation.z = 0.06;
  rightWing.castShadow = true;
  solarDeck.add(rightWing);

  // Rear Solar Taper
  const rearWingGeo = new THREE.BoxGeometry(0.9, 0.025, 0.5);
  const rearWing = new THREE.Mesh(rearWingGeo, solarMat);
  rearWing.position.set(0, 0.65, -0.8);
  rearWing.rotation.x = -0.05;
  solarDeck.add(rearWing);

  rover.add(solarDeck);

  // 3. Panoramic Mast Assembly (PMA) & Pancam
  const mastGroup = new THREE.Group();
  mastGroup.name = "subsystem_pancam";
  mastGroup.userData = { subsystemId: "pancam" };
  mastGroup.position.set(0.28, 0.66, 0.45);

  // Vertical Mast Pole
  const mastPoleGeo = new THREE.CylinderGeometry(0.028, 0.035, 0.85, 16);
  const mastPole = new THREE.Mesh(mastPoleGeo, darkMetalMat);
  mastPole.position.y = 0.425;
  mastPole.castShadow = true;
  mastGroup.add(mastPole);

  // Camera Head Box
  const camHeadGeo = new THREE.BoxGeometry(0.32, 0.12, 0.16);
  const camHead = new THREE.Mesh(camHeadGeo, bodyMat);
  camHead.position.set(0, 0.85, 0);
  camHead.castShadow = true;
  mastGroup.add(camHead);

  // Left & Right Pancam stereo optics
  const lensGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.08, 16);
  lensGeo.rotateX(Math.PI / 2);
  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(-0.1, 0.85, 0.09);
  mastGroup.add(leftLens);

  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(0.1, 0.85, 0.09);
  mastGroup.add(rightLens);

  // Navcams (lower stereo cameras)
  const navLensGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 12);
  navLensGeo.rotateX(Math.PI / 2);
  const leftNav = new THREE.Mesh(navLensGeo, lensMat);
  leftNav.position.set(-0.06, 0.77, 0.07);
  mastGroup.add(leftNav);
  const rightNav = new THREE.Mesh(navLensGeo, lensMat);
  rightNav.position.set(0.06, 0.77, 0.07);
  mastGroup.add(rightNav);

  rover.add(mastGroup);

  // 4. Mini-TES (Thermal Emission Spectrometer) Housing
  const miniTesGroup = new THREE.Group();
  miniTesGroup.name = "subsystem_mini_tes";
  miniTesGroup.userData = { subsystemId: "mini_tes" };
  miniTesGroup.position.set(0.28, 0.65, 0.15);

  const miniTesGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.16, 16);
  const miniTes = new THREE.Mesh(miniTesGeo, darkMetalMat);
  miniTes.position.y = 0.08;
  miniTesGroup.add(miniTes);

  const mirrorGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
  const mirror = new THREE.Mesh(mirrorGeo, goldFoilMat);
  mirror.position.set(0, 0.16, 0.03);
  mirror.rotation.x = -0.6;
  miniTesGroup.add(mirror);
  rover.add(miniTesGroup);

  // 5. Antennas (High-Gain Dish and Low-Gain Rod)
  const hgaGroup = new THREE.Group();
  hgaGroup.position.set(-0.3, 0.66, -0.35);
  // Parabolic Dish
  const dishGeo = new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35);
  const dish = new THREE.Mesh(dishGeo, darkMetalMat);
  dish.rotation.x = Math.PI - 0.4;
  dish.rotation.y = 0.3;
  hgaGroup.add(dish);
  rover.add(hgaGroup);

  // Low Gain Omni Rod
  const lgaGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.6, 8);
  const lga = new THREE.Mesh(lgaGeo, darkMetalMat);
  lga.position.set(-0.38, 0.95, 0.3);
  rover.add(lga);

  // 6. Instrument Deployment Device (IDD / Robotic Arm with RAT & Mössbauer)
  const armGroup = new THREE.Group();
  armGroup.name = "subsystem_arm_group";
  armGroup.position.set(0, 0.4, 0.68); // Front shoulder mount

  // Shoulder Joint
  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), darkMetalMat);
  armGroup.add(shoulder);

  // Upper Arm Link
  const upperLink = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.35, 12), darkMetalMat);
  upperLink.position.set(0, -0.15, 0.12);
  upperLink.rotation.x = 0.7;
  armGroup.add(upperLink);

  // Elbow Joint
  const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), darkMetalMat);
  elbow.position.set(0, -0.28, 0.26);
  armGroup.add(elbow);

  // Forearm Link
  const foreLink = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 12), darkMetalMat);
  foreLink.position.set(0, -0.34, 0.4);
  foreLink.rotation.x = -0.3;
  armGroup.add(foreLink);

  // Tool Turret Crosshead (Holds RAT & Mössbauer)
  const turretGroup = new THREE.Group();
  turretGroup.position.set(0, -0.38, 0.54);

  // RAT (Rock Abrasion Tool)
  const ratMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 16), darkMetalMat);
  ratMesh.rotation.z = Math.PI / 2;
  ratMesh.position.set(-0.06, 0, 0);
  ratMesh.name = "subsystem_rat";
  ratMesh.userData = { subsystemId: "rat" };
  turretGroup.add(ratMesh);

  // Mössbauer Spectrometer
  const mossMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.09, 16), bodyMat);
  mossMesh.position.set(0.06, 0, 0);
  mossMesh.name = "subsystem_mossbauer";
  mossMesh.userData = { subsystemId: "mossbauer" };
  turretGroup.add(mossMesh);

  armGroup.add(turretGroup);
  rover.add(armGroup);

  // 7. Master Solid-State Memory Core (2085 Archaeological Artifact)
  const coreGroup = new THREE.Group();
  coreGroup.name = "subsystem_blackbox_core";
  coreGroup.userData = { subsystemId: "blackbox_core" };
  const coreMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.08, 0.14),
    new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x005577,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8
    })
  );
  coreMesh.position.set(0, 0.67, -0.15);
  coreGroup.add(coreMesh);
  rover.add(coreGroup);

  // 8. Rocker-Bogie Suspension & 6 Wheels
  const suspensionGroup = new THREE.Group();
  const wheels = [];

  const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.14, 20);
  wheelGeo.rotateZ(Math.PI / 2);

  // Wheel positions: Front Left/Right, Middle Left/Right, Rear Left/Right
  const wheelPositions = [
    { x: -0.72, y: 0.12, z: 0.65 },  // Front Left
    { x: 0.72, y: 0.12, z: 0.65 },   // Front Right
    { x: -0.78, y: 0.12, z: 0.0 },    // Mid Left
    { x: 0.78, y: 0.12, z: 0.0 },     // Mid Right
    { x: -0.72, y: 0.12, z: -0.65 }, // Rear Left
    { x: 0.72, y: 0.12, z: -0.65 }   // Rear Right
  ];

  wheelPositions.forEach((pos, idx) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(pos.x, pos.y, pos.z);
    wheel.castShadow = true;
    suspensionGroup.add(wheel);
    wheels.push(wheel);

    // Strut connecting to chassis
    const strutGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.45, 8);
    const strut = new THREE.Mesh(strutGeo, darkMetalMat);
    strut.position.set(pos.x * 0.7, 0.3, pos.z * 0.8);
    suspensionGroup.add(strut);
  });

  rover.add(suspensionGroup);

  // Method to dynamically coat rover in red dust as Tau increases
  function setDustAccumulation(tau) {
    const normalizedTau = Math.max(0, Math.min(tau / 10.8, 1.0));
    // Dust shifts color towards dark reddish-ochre
    solarMat.color.setRGB(
      0.1 + normalizedTau * 0.55,
      0.2 - normalizedTau * 0.12,
      0.35 - normalizedTau * 0.28
    );
    solarMat.roughness = 0.25 + normalizedTau * 0.65;

    bodyMat.color.setRGB(
      0.8 + normalizedTau * 0.15,
      0.65 - normalizedTau * 0.25,
      0.45 - normalizedTau * 0.25
    );
  }

  return {
    rover,
    wheels,
    armGroup,
    mastGroup,
    setDustAccumulation
  };
}
