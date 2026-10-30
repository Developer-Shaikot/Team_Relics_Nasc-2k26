import * as THREE from 'three';
import { SCIENTIFIC_PAYLOADS, ARCHAEOLOGICAL_ARTIFACTS, ARCHAEOLOGICAL_ARTIFACTS_MARS, ARCHAEOLOGICAL_ARTIFACTS_MOON, ARCHAEOLOGICAL_ARTIFACTS_DEEPSPACE } from '../data/telemetryData.js';
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
    this.currentPlanet = 'mars';

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

    // LiDAR Target Pulse Rings
    this.beaconGroup = new THREE.Group();
    this.scene.add(this.beaconGroup);
    this.activeWaypointId = "mission_locate";
    this.createArchaeologicalBeacons();

    this.bindEvents();
  }

  get activeArtifacts() {
    if (this.currentPlanet === 'moon') return ARCHAEOLOGICAL_ARTIFACTS_MOON;
    if (this.currentPlanet === 'deepspace') return ARCHAEOLOGICAL_ARTIFACTS_DEEPSPACE;
    return ARCHAEOLOGICAL_ARTIFACTS_MARS;
  }

  setPlanet(planet) {
    this.currentPlanet = planet;
    this.activeWaypointId = planet === 'moon'
      ? 'moon_quest_apollo11'
      : planet === 'deepspace'
        ? 'mission_blackbox'
        : 'mission_locate';
    this.rebuildArchaeologicalBeacons();
  }

  setTerrainHeightFn(fn) {
    this.getTerrainHeight = fn;
    this.rebuildArchaeologicalBeacons();
  }

  rebuildArchaeologicalBeacons() {
    // Remove existing beacon objects from interactiveObjects
    this.interactiveObjects = this.interactiveObjects.filter(obj => !obj.userData?.isArtifactBeacon);

    // Clear beacon group
    while (this.beaconGroup.children.length > 0) {
      const child = this.beaconGroup.children[0];
      this.beaconGroup.remove(child);
    }

    this.createArchaeologicalBeacons();
  }

  createArchaeologicalBeacons() {
    const list = this.activeArtifacts;
    list.forEach(artifact => {
      const terrainY = this.getTerrainHeight ? this.getTerrainHeight(artifact.coords.x, artifact.coords.z) : (artifact.coords.y || 0);
      const beaconSubGroup = new THREE.Group();
      beaconSubGroup.position.set(artifact.coords.x, terrainY, artifact.coords.z);

      const color = artifact.color || 0x00e5ff;

      // 1. Vertical Light Pillar Beam (8 meters tall)
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.35, 9.0, 16, 1, true);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
      pillarMesh.position.y = 4.5;
      beaconSubGroup.add(pillarMesh);

      // 2. Floating Crystal Marker at top
      const crystalGeo = new THREE.OctahedronGeometry(0.45, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8
      });
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.position.y = 9.2;
      beaconSubGroup.add(crystalMesh);

      // 3. Ground Wave Pulse Ring
      const ringGeo = new THREE.RingGeometry(0.3, 1.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.08;
      beaconSubGroup.add(ringMesh);

      // 4. Clickable / Touchable Hit Sphere
      const hitGeo = new THREE.SphereGeometry(1.6, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.y = 2.0;
      hitMesh.userData = { isArtifactBeacon: true, artifactId: artifact.id, artifactData: artifact };
      beaconSubGroup.add(hitMesh);

      beaconSubGroup.userData = {
        pillarMesh,
        crystalMesh,
        ringMesh,
        hitMesh,
        artifactId: artifact.id,
        missionId: artifact.missionId,
        artifactData: artifact
      };

      this.beaconGroup.add(beaconSubGroup);
      this.interactiveObjects.push(hitMesh);
    });
  }

  setActiveWaypoint(missionId) {
    this.activeWaypointId = missionId;
    this.beaconGroup.children.forEach(subGroup => {
      const isTarget = subGroup.userData.missionId === missionId || subGroup.userData.artifactId === missionId;
      if (subGroup.userData.pillarMesh) {
        subGroup.userData.pillarMesh.material.opacity = isTarget ? 0.85 : 0.25;
        subGroup.userData.pillarMesh.scale.set(isTarget ? 1.5 : 0.8, 1.0, isTarget ? 1.5 : 0.8);
      }
      if (subGroup.userData.crystalMesh) {
        subGroup.userData.crystalMesh.scale.setScalar(isTarget ? 1.4 : 0.8);
      }
    });
  }

  registerRoverSubsystems(roverGroup) {
    roverGroup.traverse(child => {
      if (child.userData && (child.userData.subsystemId || child.name?.startsWith('subsystem_'))) {
        if (!this.interactiveObjects.includes(child)) {
          this.interactiveObjects.push(child);
        }
      }
    });
  }

  registerInteractiveTerrain(terrainGroup) {
    if (!terrainGroup) return;
    terrainGroup.traverse(child => {
      if (child.userData && (child.userData.subsystemId || child.name?.startsWith('artifact_'))) {
        if (!this.interactiveObjects.includes(child)) {
          this.interactiveObjects.push(child);
        }
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
    // Pulse archaeological beacon light pillars and crystals
    this.beaconGroup.children.forEach((subGroup, idx) => {
      const isTarget = subGroup.userData.missionId === this.activeWaypointId || subGroup.userData.artifactId === this.activeWaypointId;
      const speedMult = isTarget ? 1.6 : 1.0;

      if (subGroup.userData.crystalMesh) {
        subGroup.userData.crystalMesh.rotation.y = time * 1.5 * speedMult + idx;
        subGroup.userData.crystalMesh.position.y = 9.2 + Math.sin(time * 2.5 + idx) * 0.4;
      }

      if (subGroup.userData.ringMesh) {
        const ringScale = 1.0 + (Math.sin(time * 3 * speedMult + idx) + 1) * 0.4;
        subGroup.userData.ringMesh.scale.set(ringScale, ringScale, 1.0);
      }

      if (subGroup.userData.pillarMesh) {
        const baseOpacity = isTarget ? 0.75 : 0.3;
        subGroup.userData.pillarMesh.material.opacity = baseOpacity + Math.sin(time * 4 + idx) * 0.15;
      }
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
