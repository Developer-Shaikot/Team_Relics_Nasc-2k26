import * as THREE from 'three';
import { martianAudio } from './audio.js';
import { ARCHAEOLOGICAL_ARTIFACTS, SCIENTIFIC_PAYLOADS } from '../data/telemetryData.js';

export class RoverController {
  constructor(roverGroup, wheels, getTerrainHeightFn, camera, sceneManager) {
    this.rover = roverGroup;
    this.wheels = wheels;
    this.getTerrainHeight = getTerrainHeightFn;
    this.camera = camera;
    this.sceneManager = sceneManager;

    // Movement state
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = 0;
    this.heading = 0; // radians
    this.maxSpeed = 2.4; // m/s
    this.acceleration = 2.2;
    this.friction = 0.93;
    this.turnSpeed = 1.4;

    this.totalDistanceDriven = 0; // in meters
    this.currentSpeedKmH = 0;
    this.currentSlopeDeg = 0;

    this.input = {
      forward: 0,
      turn: 0
    };

    this.isDriving = false;
    this.cameraMode = 'orbit'; // 'orbit', 'follow'
    this.closestArtifact = null;
    this.closestDistance = Infinity;

    // Callbacks
    this.onTelemetryUpdate = null;
    this.onProximityAlert = null;

    this.bindKeyboard();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.code)) this.input.forward = 1;
      if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.code)) this.input.forward = -1;
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code)) this.input.turn = 1;
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code)) this.input.turn = -1;
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW', 'w', 'W', 'ArrowDown', 'KeyS', 's', 'S'].includes(e.code)) this.input.forward = 0;
      if (['ArrowLeft', 'KeyA', 'a', 'A', 'ArrowRight', 'KeyD', 'd', 'D'].includes(e.code)) this.input.turn = 0;
    });
  }

  setJoystickInput(forward, turn) {
    this.input.forward = forward;
    this.input.turn = turn;
  }

  update(delta) {
    // Turning
    if (Math.abs(this.input.turn) > 0.05) {
      this.heading += this.input.turn * this.turnSpeed * delta;
      this.rover.rotation.y = this.heading;
    }

    // Acceleration
    if (this.input.forward !== 0) {
      this.velocity += this.input.forward * this.acceleration * delta;
      this.velocity = Math.max(-this.maxSpeed * 0.6, Math.min(this.velocity, this.maxSpeed));

      if (!this.isDriving && Math.abs(this.velocity) > 0.1) {
        this.isDriving = true;
        martianAudio.playServoMotor();
      }
    } else {
      this.velocity *= this.friction;
      if (Math.abs(this.velocity) < 0.01) {
        this.velocity = 0;
        this.isDriving = false;
      }
    }

    // Move along heading vector
    if (Math.abs(this.velocity) > 0.001) {
      const moveDistance = this.velocity * delta;
      this.position.x -= Math.sin(this.heading) * moveDistance;
      this.position.z -= Math.cos(this.heading) * moveDistance;
      this.totalDistanceDriven += Math.abs(moveDistance);

      // Rotate wheels
      const wheelRotation = moveDistance / 0.12;
      this.wheels.forEach(w => {
        w.rotation.x += wheelRotation;
      });
    }

    // Terrain elevation alignment
    const curY = this.getTerrainHeight(this.position.x, this.position.z);
    this.position.y = curY;
    this.rover.position.copy(this.position);

    // Compute terrain slope pitch and roll
    const deltaSample = 0.5;
    const yFront = this.getTerrainHeight(this.position.x - Math.sin(this.heading) * deltaSample, this.position.z - Math.cos(this.heading) * deltaSample);
    const yBack = this.getTerrainHeight(this.position.x + Math.sin(this.heading) * deltaSample, this.position.z + Math.cos(this.heading) * deltaSample);
    const pitch = Math.atan2(yFront - yBack, deltaSample * 2);

    const yRight = this.getTerrainHeight(this.position.x + Math.cos(this.heading) * deltaSample, this.position.z - Math.sin(this.heading) * deltaSample);
    const yLeft = this.getTerrainHeight(this.position.x - Math.cos(this.heading) * deltaSample, this.position.z + Math.sin(this.heading) * deltaSample);
    const roll = Math.atan2(yRight - yLeft, deltaSample * 2);

    this.rover.rotation.x = pitch;
    this.rover.rotation.z = -roll;

    this.currentSlopeDeg = (Math.abs(pitch) * (180 / Math.PI)).toFixed(1);
    this.currentSpeedKmH = Math.abs(this.velocity * 3.6).toFixed(1);

    // Dynamic Camera Tracking - Keep camera centered on moving rover
    if (this.sceneManager) {
      this.sceneManager.spherical.target.set(this.position.x, this.position.y + 0.6, this.position.z);
      this.sceneManager.updateCameraPosition();
    }

    // Check Proximity to Archaeological Artifacts
    this.checkArtifactProximity();

    // Fire Telemetry Update Callback
    if (this.onTelemetryUpdate) {
      const headingDeg = Math.round(((this.heading * 180 / Math.PI) % 360 + 360) % 360);
      const headingDirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dirIndex = Math.round(headingDeg / 45) % 8;
      const compassDir = headingDirs[dirIndex];

      // Simulated Martian Coordinates
      const latOffset = (this.position.z * 0.00015);
      const lonOffset = (this.position.x * 0.00015);
      const currentLat = (-14.5714 + latOffset).toFixed(4);
      const currentLon = (354.6734 + lonOffset).toFixed(4);

      this.onTelemetryUpdate({
        x: this.position.x,
        y: this.position.y,
        z: this.position.z,
        lat: currentLat,
        lon: currentLon,
        speedKmH: this.currentSpeedKmH,
        slopeDeg: this.currentSlopeDeg,
        headingDeg,
        compassDir,
        distanceMeters: this.totalDistanceDriven,
        closestArtifact: this.closestArtifact,
        closestDistance: this.closestDistance
      });
    }
  }

  checkArtifactProximity() {
    let nearest = null;
    let minDistance = Infinity;

    ARCHAEOLOGICAL_ARTIFACTS.forEach(artifact => {
      const dx = this.position.x - artifact.coords.x;
      const dz = this.position.z - artifact.coords.z;
      const dist = Math.hypot(dx, dz);

      if (dist < minDistance) {
        minDistance = dist;
        nearest = artifact;
      }
    });

    this.closestArtifact = nearest;
    this.closestDistance = minDistance;

    if (this.onProximityAlert) {
      this.onProximityAlert(nearest, minDistance);
    }
  }
}

