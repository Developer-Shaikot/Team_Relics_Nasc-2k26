# 📊 03. API & DATA SPECIFICATIONS

## 1. Scientific Telemetry Data Structures (`src/data/telemetryData.js`)

### 1.1 Historical Sol Timeline Schema (`HISTORICAL_SOL_LOGS`)
Stores historical milestones recorded by NASA's Planetary Data System (PDS) across Opportunity's 5,111-sol mission.

```typescript
interface HistoricalSolLog {
  sol: number;              // Martian solar day number (e.g., 1, 20, 5111)
  date: string;             // Corresponding Earth calendar date (YYYY-MM-DD)
  location: string;         // Geographic location on Mars (e.g., "Eagle Crater", "Perseverance Valley")
  tau: number;              // Atmospheric optical depth measurement
  powerWh: number;          // Solar array daily power production (Wh/sol)
  batteryVolts: number;     // Bus battery voltage (Nominal: ~34V, Cutoff: 20.5V)
  distanceKm: number;       // Cumulative odometer distance driven (km)
  temperatureC: number;     // Ambient atmospheric temperature (°C)
  note_en: string;          // English historical field summary
  note_bn: string;          // Bengali historical field summary
}
```

### 1.2 Scientific Payloads Schema (`SCIENTIFIC_PAYLOADS`)
Defines the technical specifications and diagnostic telemetry of Opportunity's onboard instruments.

```typescript
interface ScientificPayload {
  id: string;               // Unique instrument identifier (e.g., "pancam", "rat", "mossbauer")
  name: string;             // Full scientific instrument title
  abbreviation: string;     // Instrument acronym (e.g., "Pancam", "RAT", "MIMOS II")
  discoveries: string;      // Key scientific breakthroughs achieved on Mars
  wavelengths: string;      // Spectral sensitivity or operational frequency
  resolution: string;       // Optical/mechanical resolution
  significance: string;     // Historical impact on planetary geology
}
```

### 1.3 Archaeological Artifacts Schema (`ARCHAEOLOGICAL_ARTIFACTS`)
Contains coordinates and historical data for surrounding Martian artifacts in Perseverance Valley.

```typescript
interface ArchaeologicalArtifact {
  id: string;               // Unique artifact identifier (e.g., "hematite_blueberries", "rat_grind_spot")
  title: string;            // Name of artifact
  coords: { x: number; y: number; z: number }; // 3D local world coordinates
  description: string;      // Archaeological field analysis
  significance: string;     // Aqueous and geological meaning
}
```

---

## 2. Educational & Gamification Data Schema (`src/data/kidsContent.js`)

### 2.1 S-Curve Roadmap Missions Schema (`KIDS_MISSIONS`)

```typescript
interface KidsMission {
  id: string;               // Unique mission identifier (e.g., "mission_locate", "mission_storm")
  level: number;            // Roadmap level index (1 to 6)
  stationYear: string;      // Timeline or sol tag (e.g., "2085", "Sol 5111")
  icon: string;             // Emoji / Badge glyph
  shortTitle_en: string;    // Compact roadmap node title (English)
  shortTitle_bn: string;    // Compact roadmap node title (Bengali)
  title_en: string;         // Full mission challenge title (English)
  title_bn: string;         // Full mission challenge title (Bengali)
  desc_en: string;          // Challenge narrative & objective (English)
  desc_bn: string;          // Challenge narrative & objective (Bengali)
  badge: string;            // Award trophy glyph (e.g., "🚀", "🫐", "💎", "🔬", "🌪️", "🏆")
  badgeName_en: string;     // Official Badge Title (English)
  badgeName_bn: string;     // Official Badge Title (Bengali)
  hint_en: string;          // Direct interaction hint (English)
  hint_bn: string;          // Direct interaction hint (Bengali)
}
```

### 2.2 Space Cadet Quiz Schema (`CADET_QUIZ`)

```typescript
interface QuizQuestion {
  question_en: string;      // Question text (English)
  question_bn: string;      // Question text (Bengali)
  options_en: string[];     // Array of 4 answer options (English)
  options_bn: string[];     // Array of 4 answer options (Bengali)
  correct: number;          // 0-indexed correct answer index
  explanation_en: string;   // Educational feedback explanation (English)
  explanation_bn: string;   // Educational feedback explanation (Bengali)
}
```

---

## 3. Core Engine Class & Method Reference

### 3.1 `PlanetaryScanner` (`src/systems/scanner.js`)
| Method | Parameters | Return | Description |
| :--- | :--- | :--- | :--- |
| `registerRoverSubsystems(roverGroup)` | `THREE.Group` | `void` | Traverses rover 3D hierarchy and registers tagged raycast targets. |
| `triggerManualScan(payloadId)` | `string` | `void` | Programmatically triggers a diagnostic scan for an instrument or artifact. |
| `executeScan()` | *none* | `void` | Fires camera-to-mouse raycast, detects intersections, and executes diagnostic modal callback. |
| `update(time)` | `number` | `void` | Animates concentric LiDAR reticle rings and beacon rotations. |

### 3.2 `MissionQuestManager` (`src/systems/quests.js`)
| Method | Parameters | Return | Description |
| :--- | :--- | :--- | :--- |
| `markMissionCompleted(missionId)` | `string` | `void` | Marks mission complete, plays audio fanfare, fires confetti, and advances roadmap. |
| `renderRoadmapView(container, isBn, doneCount, total)` | `HTMLElement, boolean, number, number` | `void` | Renders the SVG S-curve roadmap canvas with 8 milestone stations and HUD details panel. |
| `renderListView(container, isBn, doneCount, total)` | `HTMLElement, boolean, number, number` | `void` | Renders the vertical card list alternative view. |
| `executeMissionAction(missionId)` | `string` | `void` | Dismisses modal and invokes `onMissionActionCallback` to direct 3D simulation. |
| `showCertificateModal()` | *none* | `void` | Opens the official NASA Junior Archaeologist Master Certificate of Honor. |

### 3.3 `MartianAudioEngine` (`src/systems/audio.js`)
| Method | Parameters | Return | Description |
| :--- | :--- | :--- | :--- |
| `toggleMute()` | *none* | `boolean` | Toggles master Web Audio output state (returns `isUnmuted`). |
| `updateAtmosphereWind(tau)` | `number` | `void` | Adjusts synthesized resonant bandpass filter frequency and gain according to storm Tau. |
| `playScannerBeep(isSuccess)` | `boolean` | `void` | Generates short dual-frequency modulated telemetry chirp. |
| `playMorseCode(text)` | `string` | `void` | Synthesizes authentic Morse code audio stream for final transmission decoding. |
