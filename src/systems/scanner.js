import * as THREE from 'three';
import { SCIENTIFIC_PAYLOADS, ARCHAEOLOGICAL_ARTIFACTS } from '../data/telemetryData.js';
import { martianAudio } from './audio.js';

export class PlanetaryScanner {
  constructor(camera, scene, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];
    this.hoveredObject = null;
    this.selectedPayload = null;
    this.onScanCallback = null;

    // 3D Laser Reticle Ring
    const reticleGeo = new THREE.RingGeometry(0.12, 0.16, 32);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.reticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
    this.reticleMesh.visible = false;
    this.scene.add(this.reticleMesh);

    // LiDAR Target Pulse Rings (for 2085 Archaeological targets)
    this.beaconGroup = new THREE.Group();
    this.scene.add(this.beaconGroup);
    this.createArchaeologicalBeacons();

    this.bindEvents();
  }

  createArchaeologicalBeacons() {
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });

    ARCHAEOLOGICAL_ARTIFACTS.forEach(artifact => {
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.05, 0.8, 8), beaconMat.clone());
      beacon.position.set(artifact.coords.x, artifact.coords.y + 0.4, artifact.coords.z);
      beacon.userData = { isArtifactBeacon: true, artifactId: artifact.id, artifactData: artifact };
      this.beaconGroup.add(beacon);
      this.interactiveObjects.push(beacon);
    });
  }

  registerRoverSubsystems(roverGroup) {
    roverGroup.traverse(child => {
      if (child.userData && (child.userData.subsystemId || child.name?.startsWith('subsystem_'))) {
        this.interactiveObjects.push(child);
      }
    });
  }

  bindEvents() {
    this.domElement.addEventListener('mousemove', (e) => {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    this.domElement.addEventListener('click', () => {
      this.executeScan();
    });

    this.domElement.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        this.executeScan();
      }
    });
  }

  executeScan() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      
      // Traverse up to find userData
      while (hitObj && !hitObj.userData?.subsystemId && !hitObj.userData?.isArtifactBeacon && hitObj.parent) {
        hitObj = hitObj.parent;
      }

      if (hitObj.userData?.subsystemId) {
        const payloadId = hitObj.userData.subsystemId;
        const payload = SCIENTIFIC_PAYLOADS.find(p => p.id === payloadId) || 
          ARCHAEOLOGICAL_ARTIFACTS.find(a => a.id === payloadId);
        
        if (payload) {
          martianAudio.playScannerBeep(true);
          if (this.onScanCallback) {
            this.onScanCallback({ type: 'payload', data: payload, point: intersects[0].point });
          }
        }
      } else if (hitObj.userData?.isArtifactBeacon) {
        const artifact = hitObj.userData.artifactData;
        martianAudio.playScannerBeep(true);
        if (this.onScanCallback) {
          this.onScanCallback({ type: 'artifact', data: artifact, point: intersects[0].point });
        }
      }
    }
  }

  triggerManualScan(payloadId) {
    const payload = SCIENTIFIC_PAYLOADS.find(p => p.id === payloadId) || 
      ARCHAEOLOGICAL_ARTIFACTS.find(a => a.id === payloadId);
    if (payload) {
      martianAudio.playScannerBeep(true);
      if (this.onScanCallback) {
        const isArtifact = ARCHAEOLOGICAL_ARTIFACTS.some(a => a.id === payloadId);
        this.onScanCallback({
          type: isArtifact ? 'artifact' : 'payload',
          data: payload,
          point: new THREE.Vector3(0, 0, 0)
        });
      }
    }
  }

  update(time) {
    // Pulse archaeological beacon rings
    this.beaconGroup.children.forEach((beacon, idx) => {
      beacon.rotation.y = time * 0.8 + idx;
      const s = 1.0 + Math.sin(time * 3 + idx) * 0.15;
      beacon.scale.set(s, 1.0, s);
    });

    // Check hover for crosshair feedback
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      this.domElement.style.cursor = 'crosshair';
      this.reticleMesh.visible = true;
      this.reticleMesh.position.copy(intersects[0].point);
      this.reticleMesh.lookAt(this.camera.position);
      this.reticleMesh.scale.setScalar(0.8 + Math.sin(time * 6) * 0.1);
    } else {
      this.domElement.style.cursor = 'default';
      this.reticleMesh.visible = false;
    }
  }
}
