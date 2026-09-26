import * as THREE from 'three';
import { martianAudio } from './audio.js';

export class RoverController {
  constructor(roverGroup, wheels, getTerrainHeightFn, camera) {
    this.rover = roverGroup;
    this.wheels = wheels;
    this.getTerrainHeight = getTerrainHeightFn;
    this.camera = camera;

    // Movement state
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = 0;
    this.heading = 0; // radians
    this.maxSpeed = 2.2; // m/s
    this.acceleration = 1.8;
    this.friction = 0.94;
    this.turnSpeed = 1.2;

    this.input = {
      forward: 0,
      turn: 0
    };

    this.isDriving = false;
    this.cameraMode = 'orbit'; // 'orbit', 'follow', 'first_person'

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
      this.velocity = Math.max(-this.maxSpeed * 0.5, Math.min(this.velocity, this.maxSpeed));
      
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

    // Move along heading vector (forward is -Z in local coords when heading=0)
    if (Math.abs(this.velocity) > 0.001) {
      const moveDistance = this.velocity * delta;
      this.position.x -= Math.sin(this.heading) * moveDistance;
      this.position.z -= Math.cos(this.heading) * moveDistance;

      // Rotate wheels
      const wheelRotation = moveDistance / 0.12; // distance / wheel radius
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
  }
}
