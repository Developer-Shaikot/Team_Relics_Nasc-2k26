import * as THREE from 'three';

export class AstronautCommander {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.mesh.name = "astronaut_commander";
    this.selectedCommander = 'asha';
    this.isCrashed = false;

    this.buildAstronautMesh();
    this.scene.add(this.mesh);
    this.mesh.visible = false;
  }

  buildAstronautMesh() {
    // Clear
    while (this.mesh.children.length > 0) {
      this.mesh.remove(this.mesh.children[0]);
    }

    const suitWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.45,
      metalness: 0.15
    });

    const visorGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffb700,
      metalness: 0.95,
      roughness: 0.08,
      emissive: 0x92400e,
      emissiveIntensity: 0.2
    });

    const darkJointMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6
    });

    const accentColor = this.selectedCommander === 'asha' ? 0x00e5ff : 0xff5e28;
    const patchMat = new THREE.MeshBasicMaterial({ color: accentColor });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.36, 0.44, 0.26);
    const torso = new THREE.Mesh(torsoGeo, suitWhiteMat);
    torso.position.y = 0.58;
    this.mesh.add(torso);

    // Chest Control Pack
    const chestPackGeo = new THREE.BoxGeometry(0.22, 0.18, 0.08);
    const chestPack = new THREE.Mesh(chestPackGeo, darkJointMat);
    chestPack.position.set(0, 0.60, 0.15);
    this.mesh.add(chestPack);

    // Country / Specialist Patch
    const patchGeo = new THREE.PlaneGeometry(0.06, 0.04);
    const patch = new THREE.Mesh(patchGeo, patchMat);
    patch.position.set(-0.19, 0.64, 0.02);
    patch.rotation.y = -Math.PI / 2;
    this.mesh.add(patch);

    // 2. Life-Support Backpack (PLSS)
    const plssGeo = new THREE.BoxGeometry(0.32, 0.42, 0.16);
    const plss = new THREE.Mesh(plssGeo, suitWhiteMat);
    plss.position.set(0, 0.60, -0.18);
    this.mesh.add(plss);

    // 3. Helmet & Gold Visor
    const helmetGeo = new THREE.SphereGeometry(0.18, 16, 14);
    const helmet = new THREE.Mesh(helmetGeo, suitWhiteMat);
    helmet.position.set(0, 0.88, 0);
    this.mesh.add(helmet);

    const visorGeo = new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI);
    const visor = new THREE.Mesh(visorGeo, visorGoldMat);
    visor.rotation.x = Math.PI / 2;
    visor.position.set(0, 0.88, 0.07);
    this.mesh.add(visor);

    // 4. Legs / Boots (Sitting posture)
    const upperLegGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.28, 8);
    upperLegGeo.rotateX(Math.PI / 2); // extend forward for sitting

    const leftUpperLeg = new THREE.Mesh(upperLegGeo, suitWhiteMat);
    leftUpperLeg.position.set(-0.11, 0.38, 0.14);
    this.mesh.add(leftUpperLeg);

    const rightUpperLeg = new THREE.Mesh(upperLegGeo, suitWhiteMat);
    rightUpperLeg.position.set(0.11, 0.38, 0.14);
    this.mesh.add(rightUpperLeg);

    const lowerLegGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.26, 8);
    const leftLowerLeg = new THREE.Mesh(lowerLegGeo, suitWhiteMat);
    leftLowerLeg.position.set(-0.11, 0.22, 0.28);
    this.mesh.add(leftLowerLeg);

    const rightLowerLeg = new THREE.Mesh(lowerLegGeo, suitWhiteMat);
    rightLowerLeg.position.set(0.11, 0.22, 0.28);
    this.mesh.add(rightLowerLeg);

    // Boots
    const bootGeo = new THREE.BoxGeometry(0.10, 0.08, 0.16);
    const leftBoot = new THREE.Mesh(bootGeo, darkJointMat);
    leftBoot.position.set(-0.11, 0.08, 0.32);
    this.mesh.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo, darkJointMat);
    rightBoot.position.set(0.11, 0.08, 0.32);
    this.mesh.add(rightBoot);

    // 5. Arms
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.28, 8);
    const leftArm = new THREE.Mesh(armGeo, suitWhiteMat);
    leftArm.position.set(-0.24, 0.54, 0.08);
    leftArm.rotation.x = -Math.PI / 4;
    this.mesh.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, suitWhiteMat);
    rightArm.position.set(0.24, 0.54, 0.08);
    rightArm.rotation.x = -Math.PI / 4;
    this.mesh.add(rightArm);
  }

  setCommander(commander) {
    this.selectedCommander = commander || 'asha';
    this.buildAstronautMesh();
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  setCrashState(crashed, roverPosition) {
    this.isCrashed = crashed;
    if (crashed && roverPosition) {
      // Fallen on the terrain beside overturned rover
      this.mesh.position.set(roverPosition.x + 1.2, roverPosition.y + 0.1, roverPosition.z + 0.4);
      this.mesh.rotation.set(0, 0, Math.PI / 2); // lying down
    } else {
      this.mesh.rotation.set(0, 0, 0);
    }
  }

  update(roverPosition, roverHeading = 0, planet = 'mars') {
    if (!this.mesh.visible) return;

    if (this.isCrashed) {
      // Maintain fallen posture
      return;
    }

    // Position seated on rover
    if (roverPosition) {
      this.mesh.rotation.set(0, roverHeading + Math.PI, 0);

      if (planet === 'moon') {
        // Driver seat on Lunar Buggy (left seat)
        const offset = new THREE.Vector3(-0.25, 0.48, 0.05).applyAxisAngle(new THREE.Vector3(0, 1, 0), roverHeading + Math.PI);
        this.mesh.position.copy(roverPosition).add(offset);
      } else {
        // Driver position on Opportunity deck
        const offset = new THREE.Vector3(0, 0.45, -0.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), roverHeading + Math.PI);
        this.mesh.position.copy(roverPosition).add(offset);
      }
    }
  }
}

