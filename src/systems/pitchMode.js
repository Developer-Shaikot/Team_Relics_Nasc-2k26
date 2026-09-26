import * as THREE from 'three';
import { PITCH_SCRIPT_TIMESTAMPS } from '../data/telemetryData.js';
import { martianAudio } from './audio.js';

export class PitchShowcaseDirector {
  constructor(camera, controls, atmosphere, rover, setTauCallback, updateHUDCallback) {
    this.camera = camera;
    this.controls = controls;
    this.atmosphere = atmosphere;
    this.rover = rover;
    this.setTau = setTauCallback;
    this.updateHUD = updateHUDCallback;

    this.isPlaying = false;
    this.elapsedTime = 0;
    this.duration = 120; // 120 seconds pitch timeline
    this.currentActIndex = -1;
  }

  start() {
    this.isPlaying = true;
    this.elapsedTime = 0;
    this.currentActIndex = -1;
    if (this.controls) this.controls.enabled = false;
    martianAudio.playTelemetryTransmission();
  }

  stop() {
    this.isPlaying = false;
    if (this.controls) this.controls.enabled = true;
  }

  seek(seconds) {
    this.elapsedTime = Math.max(0, Math.min(seconds, this.duration));
  }

  update(delta) {
    if (!this.isPlaying) return;

    this.elapsedTime += delta;
    if (this.elapsedTime >= this.duration) {
      this.stop();
      return;
    }

    // Determine current act
    const currentAct = PITCH_SCRIPT_TIMESTAMPS.find(
      act => this.elapsedTime >= act.start && this.elapsedTime <= act.end
    );

    if (currentAct) {
      const actIdx = PITCH_SCRIPT_TIMESTAMPS.indexOf(currentAct);
      if (actIdx !== this.currentActIndex) {
        this.currentActIndex = actIdx;
        martianAudio.playScannerBeep();
      }

      // Smooth camera interpolation based on Act progression
      const progress = (this.elapsedTime - currentAct.start) / (currentAct.end - currentAct.start);

      if (actIdx === 0) {
        // Act I: Orbit high sweeping into storm
        const angle = progress * Math.PI * 0.5;
        this.camera.position.set(
          Math.sin(angle) * 16,
          8 - progress * 4,
          Math.cos(angle) * 16
        );
        this.camera.lookAt(0, 0.5, 0);
        // Tau ramps from 0.8 to 10.8
        const tau = 0.8 + progress * 10.0;
        this.setTau(tau);
      } else if (actIdx === 1) {
        // Act II: Close archaeological scanner orbit around rover
        const angle = 2.0 + progress * Math.PI * 0.8;
        this.camera.position.set(
          Math.cos(angle) * 3.8,
          1.4 + Math.sin(progress * 4) * 0.3,
          Math.sin(angle) * 3.8
        );
        this.camera.lookAt(0, 0.6, 0);
        this.setTau(1.5);
      } else if (actIdx === 2) {
        // Act III: Top-down scientific & terrain perspective
        this.camera.position.set(
          5.0 * (1 - progress),
          6.5,
          6.0 * (1 - progress) + 3.0
        );
        this.camera.lookAt(0, 0.4, 0);
        this.setTau(6.5);
      } else if (actIdx === 3) {
        // Act IV: Hero camera shot rising into Martian horizon
        this.camera.position.set(
          Math.sin(progress * 0.8) * 4.5,
          0.9 + progress * 2.5,
          3.2 + progress * 4.0
        );
        this.camera.lookAt(0, 0.8, 0);
        this.setTau(0.6);
      }

      if (this.updateHUD) {
        this.updateHUD({
          act: currentAct,
          elapsed: this.elapsedTime,
          progress: this.elapsedTime / this.duration
        });
      }
    }
  }
}
