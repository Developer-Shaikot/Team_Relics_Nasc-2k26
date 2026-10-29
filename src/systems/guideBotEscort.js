import * as THREE from 'three';

export class GuideBotEscort {
  constructor(scene) {
    this.scene = scene;
    this.botGroup = new THREE.Group();
    this.scene.add(this.botGroup);

    this.targetWaypoint = new THREE.Vector3(0, 0, 0);
    this.activeColor = '#00e5ff';
    this.buildBotMesh();

    this.botGroup.visible = false;
  }

  setColor(colorHex) {
    this.activeColor = colorHex || '#00e5ff';
    if (this.chassisMat) {
      this.chassisMat.color.set(this.activeColor);
      this.chassisMat.emissive.set(this.activeColor);
    }
    if (this.pointerMat) {
      this.pointerMat.color.set(this.activeColor);
    }
  }

  buildBotMesh() {
    // 1. Chassis Body (Dome sphere & cylinder)
    this.chassisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.activeColor),
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color(this.activeColor),
      emissiveIntensity: 0.35
    });

    const bodyGeo = new THREE.SphereGeometry(0.32, 16, 12);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.chassisMat);
    this.botGroup.add(bodyMesh);

    // 2. Visor Screen
    const visorGeo = new THREE.BoxGeometry(0.36, 0.16, 0.22);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.1,
      metalness: 0.9
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.18);
    this.botGroup.add(visor);

    // 3. LED Glowing Eyes
    const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.09, 0.06, 0.28);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.09, 0.06, 0.28);
    this.botGroup.add(eyeL);
    this.botGroup.add(eyeR);

    // 4. Directional Objective Pointer Arrow (Holographic glowing cone pointing to relic)
    const arrowGeo = new THREE.ConeGeometry(0.12, 0.45, 12);
    arrowGeo.rotateX(Math.PI / 2); // point forward
    this.pointerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.activeColor),
      transparent: true,
      opacity: 0.85
    });
    this.pointerArrow = new THREE.Mesh(arrowGeo, this.pointerMat);
    this.pointerArrow.position.set(0, 0.45, 0.2);
    this.botGroup.add(this.pointerArrow);

    // 5. Thruster Base & Light
    const thrusterGeo = new THREE.ConeGeometry(0.12, 0.25, 10);
    const thrusterMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75
    });
    this.thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    this.thruster.position.set(0, -0.38, 0);
    this.botGroup.add(this.thruster);

    this.thrusterLight = new THREE.PointLight(0x00e5ff, 1.2, 4);
    this.thrusterLight.position.set(0, -0.4, 0);
    this.botGroup.add(this.thrusterLight);
  }

  setTargetWaypoint(x, y, z) {
    this.targetWaypoint.set(x, y, z);
  }

  setVisible(visible) {
    this.botGroup.visible = visible;
  }

  update(delta, elapsedTime, roverPos, roverHeading = 0) {
    if (!this.botGroup.visible || !roverPos) return;

    // Desired bot hover position: ahead of rover and 2.4m in air
    const aheadDist = 1.4;
    const targetX = roverPos.x - Math.sin(roverHeading) * aheadDist;
    const targetZ = roverPos.z - Math.cos(roverHeading) * aheadDist;
    const hoverY = roverPos.y + 2.2 + Math.sin(elapsedTime * 3.5) * 0.18;

    // Smoothly lag-follow the rover
    this.botGroup.position.x += (targetX - this.botGroup.position.x) * 0.08;
    this.botGroup.position.z += (targetZ - this.botGroup.position.z) * 0.08;
    this.botGroup.position.y += (hoverY - this.botGroup.position.y) * 0.1;

    // Pointer arrow aims towards the target relic waypoint
    if (this.pointerArrow && this.targetWaypoint) {
      const dir = new THREE.Vector3().subVectors(this.targetWaypoint, this.botGroup.position).normalize();
      const lookTarget = new THREE.Vector3().addVectors(this.botGroup.position, dir);
      this.pointerArrow.lookAt(lookTarget);
    }

    // Gentle thruster flicker
    if (this.thruster) {
      this.thruster.scale.y = 0.85 + Math.sin(elapsedTime * 18) * 0.35;
    }
  }
}

