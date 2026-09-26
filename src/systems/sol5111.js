import { HISTORICAL_SOL_LOGS } from '../data/telemetryData.js';
import { martianAudio } from './audio.js';

export class Sol5111TimelineManager {
  constructor(setTauCallback, updateTelemetryHUDCallback) {
    this.setTau = setTauCallback;
    this.updateHUD = updateTelemetryHUDCallback;
    this.currentSolIndex = HISTORICAL_SOL_LOGS.length - 1; // Default to Sol 5111
    this.isPlayingTimeline = false;
    this.playbackTimer = null;
  }

  setSolByIndex(index) {
    if (index < 0 || index >= HISTORICAL_SOL_LOGS.length) return;
    this.currentSolIndex = index;
    const solData = HISTORICAL_SOL_LOGS[index];
    
    // Set optical tau in atmospheric optics
    this.setTau(solData.tau);
    martianAudio.updateAtmosphereWind(solData.tau);

    // Compute derived engineering metrics
    // Battery Voltage: ~34.0V at 900Wh dropping down to 20.8V critical cutoff at 22Wh
    const batteryVolts = (20.5 + (solData.powerWh / 900) * 13.5).toFixed(1);
    
    // Operating Temp: -20°C nominal dropping to -78°C in global storm
    const tempCelsius = (-80 + (solData.powerWh / 900) * 60).toFixed(0);

    // Sunlight extinction percentage
    const cosTheta = 0.82;
    const directSunPct = (Math.exp(-solData.tau / cosTheta) * 100).toFixed(3);

    if (this.updateHUD) {
      this.updateHUD({
        ...solData,
        batteryVolts,
        tempCelsius,
        directSunPct
      });
    }
  }

  playTimeline() {
    this.isPlayingTimeline = true;
    let idx = 0;
    this.setSolByIndex(idx);
    
    if (this.playbackTimer) clearInterval(this.playbackTimer);
    this.playbackTimer = setInterval(() => {
      idx++;
      if (idx >= HISTORICAL_SOL_LOGS.length) {
        clearInterval(this.playbackTimer);
        this.isPlayingTimeline = false;
        martianAudio.playTelemetryTransmission();
        return;
      }
      this.setSolByIndex(idx);
      martianAudio.playScannerBeep(false);
    }, 2800);
  }

  stopTimeline() {
    this.isPlayingTimeline = false;
    if (this.playbackTimer) clearInterval(this.playbackTimer);
  }
}
