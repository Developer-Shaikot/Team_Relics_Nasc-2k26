import * as THREE from 'three';
import { PITCH_SCRIPT_MARS, PITCH_SCRIPT_MOON } from '../data/telemetryData.js';
import { martianAudio } from './audio.js';

export class PitchShowcaseDirector {
  constructor(camera, controls, atmosphere, rover, setTauCallback, updateHUDCallback) {
    this.camera = camera;
    this.controls = controls;
    this.atmosphere = atmosphere;
    this.rover = rover;
    this.setTau = setTauCallback;
    this.updateHUD = updateHUDCallback;

    this.currentPlanet = 'mars'; // 'mars' or 'moon'
    this.isPlaying = false;
    this.elapsedTime = 0;
    this.duration = 120; // 120 seconds pitch timeline
    this.currentActIndex = -1;
  }

  setPitchPlanet(planet) {
    this.currentPlanet = planet;
    if (this.isPlaying) {
      this.start(planet);
    }
  }

  get currentScript() {
    return this.currentPlanet === 'moon' ? PITCH_SCRIPT_MOON : PITCH_SCRIPT_MARS;
  }

  start(planet = null) {
    if (planet) this.currentPlanet = planet;
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
      if (typeof this.onCompleteCallback === 'function') {
        this.onCompleteCallback();
      }
      return;
    }

    const script = this.currentScript;
    const currentAct = script.find(
      act => this.elapsedTime >= act.start && this.elapsedTime <= act.end
    );

    if (currentAct) {
      const actIdx = script.indexOf(currentAct);
      if (actIdx !== this.currentActIndex) {
        this.currentActIndex = actIdx;
        martianAudio.playScannerBeep();
      }

      const progress = (this.elapsedTime - currentAct.start) / (currentAct.end - currentAct.start);

      if (this.currentPlanet === 'mars') {
        if (actIdx === 0) {
          const angle = progress * Math.PI * 0.5;
          this.camera.position.set(Math.sin(angle) * 16, 8 - progress * 4, Math.cos(angle) * 16);
          this.camera.lookAt(0, 0.5, 0);
          this.setTau(0.8 + progress * 10.0);
        } else if (actIdx === 1) {
          const angle = 2.0 + progress * Math.PI * 0.8;
          this.camera.position.set(Math.cos(angle) * 3.8, 1.4 + Math.sin(progress * 4) * 0.3, Math.sin(angle) * 3.8);
          this.camera.lookAt(0, 0.6, 0);
          this.setTau(1.5);
        } else if (actIdx === 2) {
          this.camera.position.set(5.0 * (1 - progress), 6.5, 6.0 * (1 - progress) + 3.0);
          this.camera.lookAt(0, 0.4, 0);
          this.setTau(6.5);
        } else if (actIdx === 3) {
          this.camera.position.set(Math.sin(progress * 0.8) * 4.5, 0.9 + progress * 2.5, 3.2 + progress * 4.0);
          this.camera.lookAt(0, 0.8, 0);
          this.setTau(0.6);
        }
      } else {
        // Moon 120s Pitch Camera Choreography
        if (actIdx === 0) {
          const angle = progress * Math.PI * 0.4;
          this.camera.position.set(Math.sin(angle) * 14, 5 + Math.sin(progress * 2) * 1.5, Math.cos(angle) * 14);
          this.camera.lookAt(0, 0.6, 0);
        } else if (actIdx === 1) {
          this.camera.position.set(10 + Math.cos(progress * 3) * 2, 2.5, -8 + Math.sin(progress * 3) * 2);
          this.camera.lookAt(14, 0.5, -10); // Look at Surveyor 3 relic
        } else if (actIdx === 2) {
          this.camera.position.set(-8, 6.5, -10 + progress * 6);
          this.camera.lookAt(-10, 0.8, -12); // Look at Apollo LM
        } else if (actIdx === 3) {
          this.camera.position.set(Math.sin(progress) * 5, 2.0 + progress * 4, 4 + progress * 3);
          this.camera.lookAt(0, 1.0, 0);
        }
      }

      if (this.updateHUD) {
        this.updateHUD({
          act: currentAct,
          elapsed: this.elapsedTime,
          progress: this.elapsedTime / this.duration,
          planet: this.currentPlanet
        });
      }
    }
  }
}
